---
sidebar_position: 1
sidebar_label: Introduction
title: "Databases from Scratch"
slug: /
---

# Databases from Scratch

> What actually happens when you type `SELECT * FROM users WHERE id = 42`?
> This course answers that by **building a database engine from the ground
> up** — bytes on disk, B-trees, a buffer pool, a query planner,
> transactions, a write-ahead log, and finally distribution. By the end,
> a database is no longer a black box.

Most programmers *use* databases every day and treat them as magic: you
hand SQL to a box and rows come back. This course opens the box. We build
a database — call it **GooseDB** — layer by layer, the same layers
PostgreSQL, SQLite, MySQL, and every serious engine share. The goal isn't
a production database; it's *understanding* one, so you can use, tune, and
debug any database with insight.

## Why learn how databases work

- **You'll use them better.** Why is this query slow? Why did adding an
  index help (or not)? What does `SERIALIZABLE` actually cost? These stop
  being mysteries once you've built the machinery.
- **The ideas are everywhere.** B-trees, write-ahead logs, MVCC,
  consensus — these techniques show up in filesystems, key-value stores,
  message queues, and distributed systems far beyond "the database."
- **It's the canonical systems-engineering tour.** A database touches
  storage, memory hierarchies, concurrency, recovery, and distribution —
  the whole stack of hard systems problems, in one coherent artifact.
- **It demystifies the magic.** "ACID," "isolation level," "the planner
  chose a sequential scan" — by the end these are mechanisms you've built,
  not incantations.

> :nerdygoose: A relational database is one of computing's great
> engineering achievements: a declarative language (SQL) where you say
> *what* you want, not *how* to get it, sitting atop decades of work on
> storage, indexing, optimization, and concurrency — all while promising
> your data survives crashes and concurrent access without corruption.
> The fact that it mostly *just works* hides an enormous amount of
> beautiful machinery. This course is a tour of that machinery.

## What this course assumes

- You can program in *some* language (the examples are
  language-agnostic, with pseudocode and the occasional snippet).
- You've *used* SQL a little — enough to recognize `SELECT`/`INSERT`.
- You know basic data structures (arrays, trees, hashing) and Big-O.

No prior database-internals knowledge is needed. We start from "how do
you put a record on a disk?"

## The shape of the course

Six parts, built bottom-up — each layer rests on the one below:

- **Part I — Foundations.** What a database guarantees, its layered
  architecture, and how bytes are laid out on disk (pages, records,
  files, the memory hierarchy).
- **Part II — Storage Engines.** The heart of the read/write path: the
  page abstraction, **B-trees** (read-optimized), **LSM-trees**
  (write-optimized), and the **buffer pool** that caches pages in memory.
- **Part III — Query Processing.** From SQL text to results: the
  relational model, parsing and planning, **cost-based optimization**,
  and the **execution** engine (the iterator model, join algorithms).
- **Part IV — Transactions & Concurrency.** **ACID**, concurrency control
  (locking, 2PL), **MVCC**, and the isolation levels and anomalies.
- **Part V — Durability & Recovery.** The **write-ahead log** and how a
  database **recovers** from a crash with all committed data intact
  (ARIES).
- **Part VI — Distributed Databases.** Scaling out: **replication**,
  **partitioning/sharding**, and **consensus** (Raft) plus distributed
  transactions.

See the [Roadmap](/database/table-of-contents) for the full chapter list.

## The running example: GooseDB

Throughout, we build up **GooseDB**, a teaching database. We won't write
every line, but each chapter adds a concrete piece — a page layout, a
B-tree insert, a query plan, a WAL record — so the abstractions stay
grounded in "here's the actual data structure and algorithm." Where it
helps, we compare GooseDB's choices to what real systems (PostgreSQL,
SQLite, RocksDB, MySQL/InnoDB) do.

> :weightliftinggoose: Reading about databases is like reading about
> squats — you learn by loading the bar. Don't just read the B-tree
> chapter; sketch the node splits on paper. Trace a query through the
> planner. Hand-simulate a crash and the recovery. Even better, *build a
> tiny key-value store* as you go — a file, pages, a B-tree, a WAL — and
> watch the concepts become code. Databases reward the hands-on climb.

## How to read it

Front to back the first time — the layers depend on each other (you can't
understand recovery without storage, or MVCC without transactions). After
that, jump to whatever you need. Each chapter ends with **What we
covered** and **What's next**, and the [appendix](/database/appendix/cheat-sheet)
has a cheat sheet, a glossary, and further reading.

Ready? [Part I, Chapter 1](/database/part-1-foundations/why-databases)
starts with the question every black box deserves: *what is a database
actually promising you?*
