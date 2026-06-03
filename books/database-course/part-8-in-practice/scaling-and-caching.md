---
sidebar_position: 3
title: "Scaling and Caching"
---

# Scaling and Caching

> When one database isn't enough. Scaling is a **ladder** you climb in
> order — optimize queries, scale up, add read replicas, cache, and only
> then shard — because each rung is cheaper and simpler than the next. This
> chapter is that ladder, the caching patterns (and the famously hard
> problem of **cache invalidation**), connection pooling, and *the order to
> apply them*.

The [distributed chapters](/database/part-6-distributed/replication) covered
replication, partitioning, and consensus as *mechanisms*. This chapter is
the *practitioner's* sequencing: faced with a database that can't keep up,
what do you do, and in what order? The crucial lesson is that the powerful
tools (sharding) are the *last* resort, not the first — and most scaling
problems are solved well before you get there.

## 1. The scaling ladder

Scaling has a natural order, cheapest and simplest first:

```
1. TUNE        — optimize queries & indexes (Ch 28)        ← do this first, always
2. SCALE UP    — a bigger machine (vertical scaling)        ← simple, buys time
3. READ REPLICAS — offload reads to copies (Ch 18)          ← for read-heavy loads
4. CACHE       — serve hot data from memory (Redis/etc.)    ← huge for repeated reads
5. SHARD       — split data across machines (Ch 19)         ← last resort, most complex
```

Climb in order. Each rung is **simpler, cheaper, and less risky** than the
one below it, and each can buy enough headroom that you never need the next.
The expensive mistake is jumping to sharding (rung 5) when a missing index
(rung 1) or a cache (rung 4) would have solved it — adding enormous
complexity for a problem a one-line index fixes. **Always tune first.** Most
"we need to scale the database" problems are really "we have a slow query"
or "we're not caching."

## 2. Vertical scaling (and its limit)

The simplest scaling: **a bigger machine** — more RAM (bigger buffer pool,
[Chapter 7](/database/part-2-storage-engines/buffer-pool), higher cache hit
rate), more/faster CPUs, faster disks (NVMe). Vertical scaling is
*wonderfully simple*: no application changes, no distributed-systems
complexity, just a bigger box. Modern hardware is enormous (terabytes of
RAM, dozens of cores), so a single well-tuned database handles far more than
people assume — often millions of transactions per minute.

Its limits: there's a **biggest machine** (you can't scale up forever), it
gets **expensive** at the top end (the priciest tier costs far more than 2×
the mid tier), and it's a **single point of failure**. But "just use a
bigger instance" buys real time and keeps the architecture simple — don't
skip it for premature distribution. Vertical scaling is the unglamorous rung
that quietly solves most growth.

## 3. Read replicas

For **read-heavy** workloads (most web apps read far more than they write),
**read replicas** ([Chapter 18](/database/part-6-distributed/replication))
are the next rung: the leader takes writes and streams changes to follower
replicas; reads are spread across the followers. N replicas multiply read
throughput.

The catch is **replication lag** ([Chapter 18](/database/part-6-distributed/replication)):
async replicas are slightly behind the leader, so a read from a replica may
return **stale data** — and the user-visible **read-your-own-writes**
problem (you update your profile, then read a lagging replica and see the
old value). Mitigations: route a user's reads to the leader (or a caught-up
replica) right after they write; pin a user to one replica for monotonic
reads. Read replicas scale reads cheaply and add failover capacity, at the
cost of eventual-consistency anomalies you must design around. They do
**not** help write scaling (every replica applies every write) — that's
sharding's job (§6).

## 4. Caching

A **cache** ([Chapter 7](/database/part-2-storage-engines/buffer-pool) was
the database's own cache; this is an *application-level* one) stores hot data
in fast memory (Redis, Memcached) so repeated reads skip the database
entirely. For data read far more often than it changes (a user profile, a
product page, a config), caching is the **highest-leverage** scaling tool —
it can remove the majority of read load. The common patterns:

- **Cache-aside (lazy)**: the application checks the cache; on a **miss**, it
  reads the database and *populates* the cache. The most common pattern —
  simple, and only-cached-what's-used.
- **Write-through**: writes go to the cache *and* the database synchronously
  — cache always fresh, writes slightly slower.
- **Write-behind (write-back)**: writes go to the cache, flushed to the
  database asynchronously — fast writes, risk of loss if the cache dies
  before flushing.

```
cache-aside read:
  value = cache.get(key)
  if miss: value = db.query(key); cache.set(key, value, ttl)
  return value
```

A cache turns "every page load hits the database" into "most page loads hit
memory" — often the single biggest scaling win available, and far simpler
than sharding.

## 5. Cache invalidation: the hard problem

Caching's catch — and one of computing's famously hard problems — is
**invalidation**: when the underlying data changes, the cached copy is now
**wrong**, and you must update or evict it. Get this wrong and users see
stale data (or worse, inconsistent data). The approaches:

- **TTL (time-to-live)**: entries expire after N seconds. Simple, but a
  window of staleness, and a tuning trade (short TTL = fresh but more DB
  load; long TTL = less load but staler).
- **Explicit invalidation**: when data changes, the writer evicts/updates
  the affected cache keys. Precise, but you must track *every* key a change
  affects — easy to miss one, and hard with derived/aggregated data.
- **CDC-driven invalidation**: a change stream
  ([Chapter 27](/database/part-7-analytics/streaming-and-materialized-views))
  from the WAL invalidates caches automatically as the database changes —
  precise *and* decoupled.

Two notorious failure modes: the **thundering herd / cache stampede** — a
popular key expires and thousands of requests simultaneously miss and
hammer the database (mitigate with locks, request coalescing, or
probabilistic early refresh); and **inconsistency** between cache and
database under concurrent writes. Cache invalidation is hard *because*
keeping two copies of data consistent is hard — the same fundamental problem
as replication ([Chapter 18](/database/part-6-distributed/replication)), in
a different guise.

> :surprisedgoose: "There are only two hard things in computer science:
> cache invalidation and naming things." The joke endures because cache
> invalidation is *genuinely* one of the field's deep difficulties — and
> here's why: a cache is a **replica** of the database's data
> ([Chapter 18](/database/part-6-distributed/replication)), so keeping it
> consistent is the *same* problem as keeping replicas consistent, with all
> the same impossibilities (you can't atomically update the cache and the
> database across a failure; under concurrency the orderings race). Every
> caching bug is, at root, a *two-copies-of-the-truth* bug. The takeaway:
> cache aggressively (the wins are huge), but treat the cache as
> *eventually consistent* and design for staleness — never assume the cache
> and the database agree at any given instant.

## 6. Sharding: the last resort

When writes (or total data) exceed one machine, you finally **shard**
([Chapter 19](/database/part-6-distributed/partitioning)) — split the data
across nodes so each handles a slice, scaling **writes** and **storage**.
It's the most powerful tool and the **last** rung for good reason — it's the
most complex and hardest to undo:

- **The partition key is a fateful, hard-to-change choice**
  ([Chapter 19](/database/part-6-distributed/partitioning)): wrong key →
  hotspots or scatter-gather queries; changing it later means re-sharding
  everything.
- **Cross-shard pain**: joins, transactions, and secondary indexes spanning
  shards are slow or complex (distributed transactions,
  [Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions)).
- **Operational complexity**: rebalancing, routing, per-shard failover —
  many moving parts.

So shard **only when you've exhausted the cheaper rungs** and genuinely need
write/storage scale beyond one machine. Design to keep related data
**co-located** (so common queries stay single-shard,
[Chapter 19](/database/part-6-distributed/partitioning)). Many teams that
"need to shard" actually need a cache and an index — verify you're really at
this rung before climbing onto it.

## 7. Connection pooling

A practical scaling detail that bites everyone: **database connections are
expensive** — each consumes memory and a backend process/thread on the
server, and establishing one has real overhead. An app that opens a fresh
connection per request, with hundreds of concurrent requests, can exhaust
the database's connection limit and fall over — *before* any query is even
slow.

A **connection pool** maintains a fixed set of reusable connections that
requests borrow and return:

```
app requests → connection pool (e.g. 20 connections) → database
   thousands of requests share a small, bounded pool of connections
```

Application-side pools (built into most frameworks/drivers) and external
**poolers** (PgBouncer for Postgres) bound the connections hitting the
database, so a traffic spike queues on the pool rather than overwhelming the
server. Connection pooling is essential, easy-to-miss infrastructure — "the
database is at its connection limit" is a common, avoidable outage, and a
pool fixes it. It's a reminder that scaling isn't only about query speed;
it's also about *resource limits*.

## 8. The scaling discipline

Pull it together into a sequence:

1. **Tune** ([Chapter 28](/database/part-8-in-practice/indexing-and-query-tuning))
   — fix slow queries and indexes; refresh statistics. *Most scaling
   problems end here.*
2. **Pool connections** — bound the load before it overwhelms the server.
3. **Scale up** — a bigger machine buys time, simply.
4. **Cache** — remove repeated reads (the biggest win for read-heavy apps);
   design for staleness.
5. **Read replicas** — spread reads, accept replication lag.
6. **Shard** — last, only when writes/storage truly exceed one machine;
   choose the partition key carefully.

The discipline is **resist premature distribution**. Distributed databases
and sharding are *fascinating* ([Part VI](/database/part-6-distributed/replication))
and *seductive*, but they trade enormous added complexity for scale you may
not need — and a single tuned, well-cached, vertically-scaled database
serves more load than most applications will ever see. Climb the ladder in
order; stop as soon as you have the headroom. Next — the frontier: cloud-
native architectures that are rethinking these rungs entirely.

> :weightliftinggoose: Scaling is a **ladder, climbed in order**: **tune
> queries/indexes** (Ch 28 — most problems end here) → **pool connections**
> (avoid the connection-limit outage) → **scale up** (a bigger box, simple)
> → **cache** (biggest read-heavy win; **cache-aside** is the default, but
> **invalidation is genuinely hard** — a cache is a replica, so design for
> staleness, beware the **stampede**) → **read replicas** (spread reads,
> accept lag) → **shard** (last resort — most powerful, most complex,
> hardest to undo). The discipline: **resist premature distribution** — a
> tuned, cached, vertically-scaled single database handles more than you
> think.

## What we covered

- Scaling is a **ladder** — tune → scale up → read replicas → cache → shard
  — climbed in order, each rung simpler/cheaper than the next; **always
  tune first**.
- **Vertical scaling** (a bigger machine) is simple and buys real time;
  limited by the biggest/priciest box and single-point-of-failure.
- **Read replicas** scale **reads** (not writes), at the cost of
  **replication lag** / read-your-writes anomalies to design around.
- **Caching** (Redis/Memcached) is the highest-leverage read-scaling tool;
  patterns: **cache-aside** (default), write-through, write-behind.
- **Cache invalidation** is hard (a cache is a **replica** — same
  consistency problem); use TTL, explicit, or CDC-driven invalidation;
  beware the **thundering herd**.
- **Sharding** is the **last resort** — scales writes/storage but is complex,
  with a fateful partition-key choice and cross-shard pain.
- **Connection pooling** (app pools, PgBouncer) bounds expensive connections
  — prevents a common, avoidable outage.
- The discipline: **resist premature distribution** — climb in order, stop
  when you have headroom.

## What's next

[Chapter 31](/database/part-8-in-practice/modern-architectures) — modern
architectures. The cloud-native frontier reshaping databases: **separation
of compute and storage**, **serverless** databases, **NewSQL** (distributed
SQL with ACID at scale), **HTAP**, and the **lakehouse** — closing the
expanded course with where databases are going.
