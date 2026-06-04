---
sidebar_position: 4
title: "The Buffer Pool"
---

# The Buffer Pool

> The database's memory manager. Disk is slow and big; RAM is fast and
> small. The **buffer pool** is the in-memory cache of disk **pages** that
> bridges them — deciding which pages live in RAM, evicting the cold ones,
> and writing dirty pages back safely. It's why a database can work on data
> far larger than memory, fast.

Both storage families read and write **pages**
([Chapters 5–6](/database/part-2-storage-engines/b-trees)), and pages live
on slow disk. If every page access hit the disk, databases would crawl.
The **buffer pool** (a.k.a. buffer cache or page cache) keeps hot pages in
memory and orchestrates the traffic between RAM and disk. It's the single
biggest factor in whether your working set "fits in cache."

## 1. The problem: data bigger than memory

A database routinely manages terabytes of data with gigabytes of RAM. It
can't hold everything in memory, but it *can* hold the **working set** —
the pages actually being used right now. The buffer pool's job:

- Keep frequently-used pages in memory (avoid disk reads).
- When memory is full, **evict** a page to make room — ideally one that
  won't be needed soon.
- Track **modified** ("dirty") pages and write them back to disk at the
  right time.

This is a classic caching problem, with a database-specific twist:
correctness under crashes ([Part V](/database/part-5-durability/write-ahead-log))
constrains *when* dirty pages may be written.

## 2. Frames, the page table, and pinning

The buffer pool is an array of fixed-size **frames**, each able to hold
one page. A **page table** (a hash map) tracks which page is in which
frame:

```
page table:  page_id → frame_index   (+ dirty bit, pin count)

buffer pool:  [ frame0 ][ frame1 ][ frame2 ] ... [ frameN ]
                page 17   page 4    (free)  ...
```

For each resident page the pool tracks:

- A **dirty bit** — has the page been modified since it was read in?
- A **pin count** — how many callers are currently *using* this page.
  A **pinned** page must **not** be evicted (someone holds a pointer into
  it). Callers `pin` before using and `unpin` when done.

Pinning is essential for correctness: evicting a page out from under a
B-tree traversal would be catastrophic. The pin count is the buffer pool's
way of knowing a frame is in active use.

## 3. The page request flow

When any layer needs page *N*:

```
get_page(N):
  if N in page table:            # cache HIT
      pin it; return the frame
  else:                          # cache MISS
      frame = find a free frame, or EVICT one (§4)
      if evicted page is dirty: write it to disk first
      read page N from disk into the frame
      record N in the page table; pin it; return the frame
```

A **hit** is a pointer return — nanoseconds. A **miss** costs a disk read
(plus possibly a disk write to evict). So the **hit rate** dominates
database performance: a high hit rate means the working set fits in the
pool and most accesses never touch disk; a low one means thrashing. "Add
more RAM" so often helps because it raises the buffer-pool hit rate.

## 4. Eviction policies

When the pool is full and a new page is needed, which resident page do you
evict? You want the one **least likely to be used soon**. Common policies:

- **LRU (Least Recently Used)**: evict the page unused for the longest.
  Simple, decent — but a single big **sequential scan** can flush the
  whole cache with pages used once ("LRU pollution").
- **Clock / Second-Chance**: an approximation of LRU using a reference bit
  and a circular sweep — near-LRU quality, far cheaper bookkeeping. Widely
  used.
- **LRU-K / LFU variants**: track frequency or the *K*th-last access to
  resist scan pollution.

Real engines use scan-resistant refinements (PostgreSQL uses a clock-sweep
variant; others segment the cache). Whatever the policy, **pinned pages
are never evicted**, and a **dirty** victim must be flushed before its
frame is reused — which links eviction to durability.

> :nerdygoose: A subtle but vital rule governs *when* a dirty page may be
> written to disk, and it's dictated by crash recovery
> ([Chapter 16](/database/part-5-durability/write-ahead-log)): the
> **write-ahead logging** protocol says the **log records describing a
> change must reach disk before the changed data page does**. So the
> buffer pool can't just flush a dirty victim whenever convenient — it
> must first ensure the relevant WAL records are on disk. This coupling
> between the buffer pool and the log is where storage performance and
> crash safety meet, and it's why the two are designed together.

## 5. Dirty pages and write-back

A modified page is marked **dirty**. The buffer pool does **not** write it
to disk immediately — that would forfeit the whole point (turning a fast
memory write into a slow disk write). Instead, dirty pages are written
back lazily:

- On **eviction**, if the victim is dirty (and its WAL records are safely
  on disk), flush it.
- During a **checkpoint** ([Chapter 17](/database/part-5-durability/crash-recovery)),
  the database flushes dirty pages to bound recovery time.
- By a **background writer** that trickles dirty pages out, smoothing I/O.

This lazy write-back is what makes the database fast: many updates to a hot
page coalesce into *one* eventual disk write. Durability is provided by the
WAL (the log hits disk on commit), *not* by writing the data page
immediately — the data page can lag, because recovery can replay the log.
That decoupling — **fast in-memory updates, durable via the log, data
pages written lazily** — is the heart of high-performance, crash-safe
storage.

## 6. Why not just use the OS page cache?

The operating system already caches file data (the OS page cache), so why
does the database maintain *its own* buffer pool? Because the database
knows things the OS doesn't:

- **Eviction by query semantics**: the DB knows a sequential scan's pages
  are throwaway and shouldn't evict the B-tree root; the OS sees only
  opaque file reads.
- **The WAL ordering rule** (§4): the DB must control flush ordering for
  recovery; it can't if the OS flushes whenever.
- **Pinning** pages during operations, prefetching by access pattern, and
  prioritizing index pages.

So most serious databases manage their own buffer pool and often bypass or
minimize the OS cache (e.g. with direct I/O) to avoid *double caching* the
same data in two places. (Some, like SQLite or LMDB-style designs, lean on
the OS cache deliberately for simplicity — another trade-off.) Control over
caching is worth the complexity for a database.

## 7. Sizing and the hit rate

The buffer pool's size is one of the most important tuning knobs in any
database:

- Too small → low hit rate → constant disk I/O → slow.
- Large enough to hold the **working set** → high hit rate → most accesses
  are memory-speed.
- The whole dataset in the pool → essentially an in-memory database.

This is why "give the database more RAM" is the perennial first tuning
move, and why config like PostgreSQL's `shared_buffers` or InnoDB's
`innodb_buffer_pool_size` matters so much. Monitoring the **buffer cache
hit ratio** is a primary health metric: a sudden drop often explains a
sudden slowdown — the working set stopped fitting.

## 8. The bridge between worlds

Step back: the buffer pool is the **boundary** the whole storage stack
pivots on. Above it, B-trees and LSM SSTables and the executor think in
*pages* and assume page access is cheap. Below it, the storage manager
deals in *disk I/O*. The buffer pool is the illusion-maker that lets the
upper layers pretend pages are in memory — and mostly be right.

It also ties storage to durability: the WAL-ordering rule (§4) and
checkpoints (§5) mean the buffer pool is a full participant in crash
safety, not just performance. With pages (Part I), the index structures
(B-trees, LSM), and the buffer pool that caches them, **Part II is
complete** — you have the whole read/write path from a logical record down
to the disk and back.

> :weightliftinggoose: The buffer pool is the database's RAM cache of disk
> **pages**, and its **hit rate** is the master performance dial — keep the
> **working set** in memory and most accesses never touch disk. Hold the
> mechanics: **frames** + a **page table**, **pin** pages in use (never
> evict the pinned), evict the cold (**clock/LRU**), and write **dirty**
> pages back **lazily** — but only after their **WAL records are on disk**
> (the write-ahead rule). That last coupling is where speed meets crash
> safety. When a database "just needs more RAM," this is why.

## What we covered

- The **buffer pool** caches disk **pages** in memory so a database can
  work on data far larger than RAM, fast.
- It's an array of **frames** with a **page table** (page_id → frame),
  each page tracking a **dirty bit** and **pin count**; **pinned** pages
  can't be evicted.
- A page request is a **hit** (return the frame) or **miss** (evict if
  needed, read from disk); the **hit rate** dominates performance.
- **Eviction** policies (**LRU**, **clock/second-chance**, scan-resistant
  variants) pick a cold victim; a dirty victim must be flushed first.
- Dirty pages are written back **lazily** (on eviction, at **checkpoints**,
  by a background writer) — durability comes from the **WAL**, not
  immediate data-page writes; the **WAL-before-data** rule constrains
  flushes.
- Databases keep their **own** buffer pool (not just the OS cache) for
  semantic eviction, flush-ordering, and pinning.
- **Sizing** the pool to the working set (e.g. `shared_buffers`) and
  watching the **hit ratio** is primary tuning.

## What's next

That completes Part II — the storage engine. [Part III](/database/part-3-query-processing/relational-model-and-sql)
moves up the stack to **query processing**: the relational model and SQL,
then how a query is parsed, planned, optimized, and executed against the
storage engine you now understand.
