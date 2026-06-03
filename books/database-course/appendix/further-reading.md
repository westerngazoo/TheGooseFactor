---
sidebar_position: 3
title: "Further Reading"
---

# Further Reading

> Where to go deeper — the canonical books, the famous papers behind each
> chapter, and the best way to truly learn: build one.

## The essential books

- **"Database Internals"** (Alex Petrov) — the closest book to this
  course's spirit: storage engines (B-trees, LSM), the buffer pool,
  distributed systems, consensus. If you read one, read this. Maps almost
  chapter-for-chapter onto Parts II–VI.
- **"Designing Data-Intensive Applications"** (Martin Kleppmann) — the
  modern classic on data systems: replication, partitioning, consistency,
  consensus, stream processing. Essential for the distributed half
  ([Part VI](/database/part-6-distributed/replication)) and beyond.
- **"Database System Concepts"** (Silberschatz, Korth, Sudarshan) — the
  comprehensive textbook; the relational model, query processing,
  transactions, recovery in depth.
- **"Readings in Database Systems"** (the **Red Book**, ed. Bailis,
  Hellerstein, Stonebraker) — a free, curated guided tour of the field's
  seminal papers with commentary.
- **"Transaction Processing: Concepts and Techniques"** (Gray & Reuter) —
  the deep, classic reference on transactions and recovery.

## The famous papers (by chapter)

The field is unusually paper-driven; the primary sources are readable and
worth it:

- **The relational model** ([Ch 8](/database/part-3-query-processing/relational-model-and-sql))
  — Codd, *"A Relational Model of Data for Large Shared Data Banks"*
  (1970). The foundation.
- **Query optimization** ([Ch 10](/database/part-3-query-processing/query-optimization))
  — Selinger et al., *"Access Path Selection in a Relational Database
  Management System"* (System R, 1979). The origin of cost-based
  optimization and join ordering.
- **The Volcano model** ([Ch 11](/database/part-3-query-processing/execution))
  — Graefe, *"Volcano — An Extensible and Parallel Query Evaluation
  System"*.
- **Recovery** ([Ch 17](/database/part-5-durability/crash-recovery)) —
  Mohan et al., *"ARIES: A Transaction Recovery Method..."* (1992). The
  canonical recovery algorithm.
- **LSM-trees** ([Ch 6](/database/part-2-storage-engines/lsm-trees)) —
  O'Neil et al., *"The Log-Structured Merge-Tree"* (1996); and Google's
  **Bigtable** paper (2006).
- **Dynamo / leaderless replication** ([Ch 18](/database/part-6-distributed/replication))
  — DeCandia et al., *"Dynamo: Amazon's Highly Available Key-value Store"*
  (2007).
- **Consensus** ([Ch 20](/database/part-6-distributed/consensus-and-distributed-transactions))
  — Lamport, *"Paxos Made Simple"*; Ongaro & Ousterhout, *"In Search of an
  Understandable Consensus Algorithm (Raft)"* (2014).
- **Distributed SQL** — Corbett et al., *"Spanner: Google's Globally-
  Distributed Database"* (2012).

## Real systems to read and read about

Nothing teaches like a real engine's docs and source:

- **PostgreSQL** — superb documentation; a clean heap + B-tree + MVCC
  (`VACUUM`) design. The internals are well-explained and the source is
  approachable.
- **SQLite** — small enough to read end-to-end; *"The Definitive Guide to
  SQLite"* and the official architecture docs are excellent for a complete,
  embeddable B-tree engine.
- **RocksDB / LevelDB** — the reference LSM-tree engines; the RocksDB wiki
  is a deep practical resource on LSM tuning and compaction.
- **CockroachDB / TiDB** — open-source distributed SQL combining sharding,
  Raft, and MVCC ([Part VI](/database/part-6-distributed/replication)); great
  engineering blogs.

## Courses and lectures

- **CMU 15-445/645 "Database Systems"** (Andy Pavlo) — *the* database
  internals course, lectures free on YouTube, with a project building a
  real storage/execution engine. Pairs perfectly with this course.
- **MIT 6.5840 (6.824) "Distributed Systems"** — for the distributed half:
  builds Raft and a sharded key-value store.
- **Berkeley CS186** — a solid systems-oriented database course.

## The best way to learn: build one

This course is called "from scratch" for a reason. To make it stick,
**build a tiny database**, incrementally:

1. A **file of pages** and a **slotted-page** record store
   ([Ch 3](/database/part-1-foundations/storage-on-disk)).
2. A **B-tree** index over it ([Ch 5](/database/part-2-storage-engines/b-trees)).
3. A **buffer pool** with LRU eviction
   ([Ch 7](/database/part-2-storage-engines/buffer-pool)).
4. A tiny **SQL parser + executor** (start with `SELECT`/`INSERT`,
   [Part III](/database/part-3-query-processing/relational-model-and-sql)).
5. A **WAL** and crash **recovery**
   ([Part V](/database/part-5-durability/write-ahead-log)).

Excellent guided builds exist — *"Let's Build a Simple Database"* (the
`cstack` SQLite-clone tutorial in C), *"Build Your Own Database"*
(Go-based), and the CMU 15-445 projects. Each turns a chapter here into
working code.

> :weightliftinggoose: Read **Database Internals** and **Designing
> Data-Intensive Applications** — together they cover this whole course at
> greater depth. Watch **CMU 15-445** (Pavlo) and, crucially, **build the
> tiny database** above — a file, pages, a B-tree, a buffer pool, a WAL.
> The concepts become permanent the moment they're code you wrote. Skim
> the classic papers (Codd, System R, ARIES, Dynamo, Raft) — they're
> shorter and clearer than their reputations suggest. The field rewards
> building.

---

Back to the [course introduction](/database/) · the
[roadmap](/database/table-of-contents) · the
[cheat sheet](/database/appendix/cheat-sheet) · the
[glossary](/database/appendix/glossary).
