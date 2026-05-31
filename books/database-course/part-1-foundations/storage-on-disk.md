---
sidebar_position: 3
title: "Storage on Disk: Pages, Records, Files"
---

# Storage on Disk

> The bottom of the stack. Data ultimately lives as bytes on disk,
> organized into fixed-size **pages**; rows become **records** packed into
> those pages; pages live in **files**. The page is the atom of a
> database, and the reason is the brutal speed gap between memory and
> disk.

We've reached the foundation. Before B-trees, queries, or transactions,
there's the raw question: *how do you put a table on a disk so it can be
read and written efficiently?* The answer — pages and records — is shaped
entirely by hardware, so we start there.

## 1. The memory hierarchy

Storage isn't one thing; it's a hierarchy, fast-and-small at the top to
slow-and-large at the bottom:

```
  CPU registers     ~1 ns      bytes
  L1/L2/L3 cache    ~1–10 ns   KB–MB
  RAM (memory)      ~100 ns    GB        ← fast, volatile, "small"
  SSD               ~100 µs    TB        ← durable, slower
  HDD (spinning)    ~10 ms     TB        ← durable, much slower (random)
```

The jump from RAM to SSD is roughly *1000×*; to a spinning disk's random
seek, ~100,000×. And **durable** storage (SSD/HDD) is exactly the slow
part — but durability is non-negotiable
([Chapter 1](/database/part-1-foundations/why-databases)). So a database's
prime directive is: **minimize accesses to durable storage**, and when you
must access it, do so efficiently.

## 2. Why blocks and pages exist

Disks don't deal in bytes; they transfer data in fixed-size **blocks**
(historically 512 B, now commonly 4 KB). You can't read one byte from an
SSD — you read at least a block. Reading is also dominated by *latency*
(finding the data), not bandwidth, so reading 4 KB costs almost the same
as reading 1 byte.

The database mirrors this with its own fixed-size unit: the **page**
(typically 4 KB, 8 KB, or 16 KB — PostgreSQL uses 8 KB, InnoDB 16 KB). A
page is the unit the database reads from and writes to disk, and the unit
the buffer pool caches
([Chapter 7](/database/part-2-storage-engines/buffer-pool)). Everything is
organized in pages because that's how the hardware is happiest.

> :nerdygoose: This is *the* foundational decision, and it explains nearly
> every storage structure that follows. Because the cost is "per page
> read," not "per byte," the goal of every index and layout is to **touch
> as few pages as possible**. A B-tree is shaped to be shallow (few pages
> from root to leaf); a row is packed to fit many per page; a buffer pool
> exists to avoid re-reading pages. Once you internalize "I/O is counted
> in pages," the design of the entire storage engine becomes inevitable
> rather than arbitrary.

## 3. Files and the storage manager

At the bottom, the database stores its pages in **files** on the operating
system's filesystem (or sometimes a raw block device). A table might be
one file (SQLite puts the *whole database* in one file) or many; either
way, the **storage manager** treats a file as an array of pages addressed
by **page number**:

```
file "users.db":
  ┌────────┬────────┬────────┬────────┬─────
  │ page 0 │ page 1 │ page 2 │ page 3 │ ...
  └────────┴────────┴────────┴────────┴─────
   offset = page_number × page_size
```

To read page *N*, the storage manager seeks to `N × page_size` and reads
`page_size` bytes. Page 0 is often a **header/metadata** page describing
the file. This simple "file = array of pages" model is the interface
every layer above builds on.

## 4. Records: rows as bytes

A **record** (or **tuple**) is a row serialized into bytes. To store
`(id=42, name="Ada", active=true)`, the database lays the fields out per
the table's **schema**:

```
fixed-width fields:   [ id: 4 bytes ][ active: 1 byte ] ...
variable-width fields: stored with a length, or via an offset
```

- **Fixed-length** fields (an `INT`, a `BOOL`) are trivial — known size,
  known position.
- **Variable-length** fields (a `VARCHAR`, a `TEXT`) need a length prefix
  or an offset, since you can't know where the next field starts
  otherwise. A common layout puts fixed fields first, then a small array
  of offsets pointing to the variable fields packed at the end.
- **NULLs** are tracked with a **null bitmap** — one bit per column
  marking whether it's null — so a null doesn't waste the field's full
  width.

Serializing rows to a compact, parseable byte layout is the job of the
**tuple format**; getting it right (and versioned, for schema changes) is
surprisingly fiddly real-world work.

## 5. Packing records into pages: the slotted page

How do you fit variable-length records into a fixed-size page and still
find them after they move? The near-universal answer is the **slotted
page**:

```
 ┌─────────────────────────────────────────────┐
 │ header │ slot1 slot2 slot3 →     ← free →   │
 │        │   (offsets into the page)           │
 │                          ← rec3 rec2 rec1    │
 └─────────────────────────────────────────────┘
   slot array grows from the front;
   records grow from the back; free space in the middle.
```

- A **slot array** at the front holds, for each record, its **offset and
  length** within the page.
- **Records** are packed from the back of the page toward the front.
- **Free space** sits in the middle, shrinking as both ends grow.

The win: a record is addressed by `(page number, slot number)` — its
**record ID** or "tuple ID." If a record is updated or the page is
compacted and the record *moves within the page*, only its slot entry
changes; the record ID stays stable. Indexes can point at the slot, not
the raw offset. This indirection (slot → offset) is a small idea with big
payoff for everything above.

## 6. The record ID: the address of a row

That `(page_number, slot_number)` pair — variously called **RID**, **TID**
(tuple ID), or **row pointer** — is how the rest of the database
*addresses a specific row*. An index ([Chapter 5](/database/part-2-storage-engines/b-trees))
maps a key (like `id = 42`) to a RID; the executor then says "fetch the
record at page 17, slot 3." The slotted-page indirection means the row can
shuffle within its page without invalidating every index pointing at it.

When a row grows too big to fit where it was (an update making a
`VARCHAR` longer), some designs leave a **forwarding pointer** in the old
slot to the row's new home — so the RID still works, at the cost of an
extra hop. These details (forwarding, overflow pages for huge values) are
where real engines get intricate, but the core abstraction — a row has a
stable address — is what matters.

## 7. Heap files: the simplest table storage

Put it together and you have the simplest way to store a table: a **heap
file** — a collection of pages, each a slotted page full of records, in no
particular order:

```
table = [ page0, page1, page2, ... ]   each page = slotted page of rows
```

- **Insert**: find a page with free space (tracked by a free-space map),
  put the record in a slot. Append a new page if none fits.
- **Scan**: read every page, every slot — a **full table scan**, O(pages).
- **Find by RID**: go straight to `(page, slot)` — O(1), one page read.
- **Find by value** (`WHERE id = 42`): without an index, scan everything.

The heap file is the default "where the rows live"
([Chapter 4](/database/part-2-storage-engines/storage-engine)). It's great
for inserts and full scans, terrible for value lookups — which is exactly
the gap that **indexes** ([Chapter 5](/database/part-2-storage-engines/b-trees))
fill. Heap + index is the classic table storage combo.

## 8. The picture so far

Bottom-up, the storage foundation is:

- **Bytes** on **disk**, transferred in **blocks**, mirrored by the
  database's fixed-size **pages**.
- **Pages** stored in **files**, addressed by page number by the storage
  manager.
- **Records** (serialized rows, with null bitmaps and variable-length
  handling) packed into **slotted pages**, addressed by **RID** =
  `(page, slot)`.
- **Heap files** = collections of such pages, the base table storage.

This is the substrate everything else stands on. The buffer pool caches
these pages; B-trees index the RIDs; the WAL logs page changes; the
executor fetches records by RID. Every higher abstraction eventually
bottoms out here, in "which page, which slot." Hold that, and the storage
engine in Part II will feel like a natural next step rather than a new
world.

> :weightliftinggoose: The atom of a database is the **page**, and the
> reason is the memory/disk speed gap — so the metric that matters is
> **page I/Os**, not bytes or instructions. Lock in the chain: disk
> blocks → fixed-size **pages** in **files** → **slotted pages** holding
> **records** → addressed by **RID `(page, slot)`** → collected into
> **heap files**. Sketch a slotted page and trace an insert and a
> by-RID lookup. This bottom layer is short on glamour and long on
> consequence: nearly every design choice above exists to touch these
> pages as rarely as possible.

## What we covered

- The **memory hierarchy**: durable storage (SSD/HDD) is ~1000–100,000×
  slower than RAM, so the prime directive is **minimize durable-storage
  I/O**.
- Disks transfer fixed-size **blocks**; the database mirrors this with
  fixed-size **pages** (4–16 KB) — the unit of I/O and caching, with cost
  counted **per page**.
- The **storage manager** treats a **file** as an array of pages addressed
  by **page number**.
- A **record** is a serialized row: fixed- vs variable-length fields,
  offsets, and a **null bitmap**.
- The **slotted page** packs variable-length records: a front **slot
  array** of offsets, records from the back, free space between — giving
  each row a stable **RID `(page, slot)`**.
- The **RID** is how indexes and the executor address a row; updates may
  use **forwarding pointers**.
- A **heap file** (pages of slotted records) is the base table storage:
  fast insert/scan/by-RID, slow by-value — motivating **indexes**.

## What's next

That's the foundation. [Part II](/database/part-2-storage-engines/storage-engine)
builds the **storage engine** on top of it — starting with the page
abstraction and the engine's API, then the index structures (**B-trees**
and **LSM-trees**) and the **buffer pool** that ties memory and disk
together.
