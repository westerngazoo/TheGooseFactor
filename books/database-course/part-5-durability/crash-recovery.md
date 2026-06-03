---
sidebar_position: 2
title: "Crash Recovery: ARIES"
---

# Crash Recovery: ARIES

> Putting the database back together. After a crash, memory is gone and the
> data pages on disk are a mess — some committed changes missing, some
> uncommitted changes present. **Recovery** uses the write-ahead log to
> restore a correct state. **ARIES**, the canonical algorithm, does it in
> three phases — **Analysis, Redo, Undo** — and is robust even if recovery
> itself crashes.

[Chapter 16](/database/part-5-durability/write-ahead-log) gave us the WAL:
a durable, sequential record of every change. This chapter uses it to
**recover**. When a crashed database restarts, it can't just resume — the
on-disk state is inconsistent. ARIES (the algorithm behind DB2,
SQL Server, and the spirit of most others) turns the log back into a
correct database. It's the payoff for everything the WAL set up.

## 1. The state after a crash

When the power dies, two kinds of damage exist on disk, both caused by the
**steal + no-force** buffer policy
([Chapter 16](/database/part-5-durability/write-ahead-log)):

- **Lost committed changes** (because of **no-force**): a transaction
  committed (its COMMIT record is on disk), but some of its dirty data
  pages were never flushed. → those changes must be **redone**.
- **Surviving uncommitted changes** (because of **steal**): the buffer
  pool flushed a dirty page belonging to a transaction that never
  committed. → those changes must be **undone**.

```
on-disk data pages after crash:
   ✗ missing some COMMITTED updates      → REDO them
   ✗ contain some UNCOMMITTED updates     → UNDO them
```

Recovery's job: redo the committed-but-missing, undo the
uncommitted-but-present, and end in the exact state as if every committed
transaction had fully landed and every incomplete one had never run.

## 2. The ARIES principles

ARIES rests on three principles that make recovery correct *and* robust:

1. **Write-ahead logging** — the log record precedes the data page on
   disk (Chapter 16). Without this, recovery couldn't know what happened.
2. **Repeating history during redo** — on restart, ARIES first *replays
   the log to reconstruct the exact state at the moment of the crash* —
   including the effects of transactions that will later be undone — then
   undoes the losers. Restore history exactly, *then* roll back.
3. **Logging changes during undo** — undo actions are themselves logged
   (as **compensation log records**, §6), so that if the system crashes
   *during recovery*, recovery can be safely restarted without redoing
   undo work.

These give ARIES its hallmark: recovery that's correct, complete, and
**idempotent** — you can crash mid-recovery and just run recovery again.

## 3. The three phases

ARIES recovers in three sequential passes over the log:

```
   crash
     │
  ┌──▼─────────┐   scan forward from last checkpoint:
  │ 1. ANALYSIS│   determine which transactions were active (losers) and
  │            │   which dirty pages might need redo.
  ├────────────┤
  │ 2. REDO    │   replay ALL changes (committed AND uncommitted) from the
  │            │   appropriate point — "repeat history" to the crash state.
  ├────────────┤
  │ 3. UNDO    │   roll back the loser transactions (the uncommitted ones),
  │            │   logging compensation records as it goes.
  └────────────┘
   consistent DB
```

The order matters: **Analysis** figures out what to do, **Redo**
reconstructs the crash-moment state exactly, and **Undo** removes the
incomplete transactions — leaving only committed work. Let's take each.

## 4. Analysis

The **Analysis** phase scans the log forward (from the last checkpoint,
§7) to reconstruct two things the in-memory bookkeeping lost in the crash:

- The **transaction table**: which transactions were **active** at the
  crash (the "losers" — they didn't commit, so they'll be undone). A
  transaction with a `COMMIT` record is a winner; one without is a loser.
- The **dirty page table**: which pages were dirty (modified in memory but
  maybe not flushed), and the earliest log record that might need redoing
  for each — the **recoveryLSN**.

Analysis doesn't change anything; it *plans*. Its output tells Redo where
to start and Undo which transactions to roll back. The starting point is
the last checkpoint, which is why checkpoints (§7) bound how far back
recovery must look.

## 5. Redo: repeating history

The **Redo** phase replays the log *forward*, re-applying changes to bring
the data pages to their **exact state at the moment of the crash** —
**including changes by uncommitted (loser) transactions**. This "repeat
history" step sounds wasteful (why redo work we're about to undo?) but it's
what makes the algorithm simple and correct: after Redo, the database is in
a known, fully-reconstructed state, and Undo can proceed uniformly.

The key to safety is **idempotent redo** via LSNs
([Chapter 16](/database/part-5-durability/write-ahead-log)). For each
log record, ARIES checks the target page's **`pageLSN`**:

```
for each redoable log record (LSN L) on page P:
    if P.pageLSN >= L:   the change is ALREADY in the page → skip
    else:                apply the change, set P.pageLSN = L
```

Because a page records the LSN of its last applied change, ARIES never
applies a change twice. So Redo can be interrupted and restarted freely —
re-running it skips already-applied changes. *That* is why recovery itself
is crash-safe.

> :surprisedgoose: "Repeat history" — redoing even the changes of
> transactions you're about to roll back — feels backward, but it's the
> stroke of genius that makes ARIES tractable. By first reconstructing the
> **exact** crash-moment state (winners and losers alike), Undo always
> starts from a single, well-defined state and can roll back losers with
> the same logic every time. The alternative — selectively redoing only
> winners — would require reasoning about partial, tangled states.
> Restoring history in full, then undoing, trades a little extra work for
> enormous conceptual simplicity. Many robust systems borrow this "replay
> everything, then reconcile" pattern.

## 6. Undo: rolling back the losers

The **Undo** phase rolls back the **loser** transactions (active at the
crash, never committed), restoring their data using the **before-images**
([Chapter 16](/database/part-5-durability/write-ahead-log)) logged with
each change. It scans the log *backward*, undoing the losers' changes from
newest to oldest.

The subtlety ARIES nails: each undo action **writes a log record** — a
**Compensation Log Record (CLR)** — describing the undo it just performed.
CLRs make undo **redoable but not re-undoable**: if the system crashes
*during* Undo, recovery restarts, Redo replays the CLRs (re-applying the
undo work already done), and Undo continues from where it left off —
never undoing the same change twice. The CLR is how ARIES makes *recovery
of recovery* correct. Atomicity ([Chapter 12](/database/part-4-transactions/transactions-and-acid))
is delivered here: incomplete transactions leave **no trace**.

## 7. Checkpoints: bounding the work

Without help, recovery would have to replay the log from the *beginning of
time* — impossible for a long-lived database. **Checkpoints** bound the
work: periodically, the database writes a **checkpoint record** capturing
the current transaction table and dirty page table, so recovery can start
the Analysis scan from the **last checkpoint** instead of the log's start.

Modern databases use **fuzzy checkpoints**: rather than stopping all
activity and flushing everything (a "sharp" checkpoint stalls the system),
they record the bookkeeping *while transactions keep running*, accepting
that some dirty pages aren't flushed yet (recovery's Redo handles those).
Checkpoints trade a little steady-state work for **fast recovery** — the
more frequent the checkpoints, the less log to replay after a crash, but
the more checkpoint overhead during normal operation. It's a tunable
balance (e.g. PostgreSQL's `checkpoint_timeout`).

## 8. Recovery in the big picture

Tie it together. ARIES delivers two of the four ACID properties:

- **Durability** ([Chapter 12](/database/part-4-transactions/transactions-and-acid)):
  the **Redo** phase ensures every *committed* change is present, even if
  its data page never made it to disk before the crash.
- **Atomicity**: the **Undo** phase ensures every *incomplete* transaction
  leaves no trace, rolling back partial work via before-images.

Together with concurrency control (Part IV) providing **Isolation**, the
WAL + ARIES complete the ACID picture. The architecture from
[Chapter 2](/database/part-1-foundations/architecture) is now fully
mechanical: storage (Part II), query processing (Part III), concurrency
(Part IV), and durability/recovery (Part V). A single-node database holds
no more mysteries — every guarantee traces to a concrete mechanism. What
remains is scaling *beyond* one machine, where durability and the log
reappear in distributed form. That's Part VI.

> :weightliftinggoose: Recovery turns the WAL back into a correct database
> via **ARIES: Analysis → Redo → Undo**. Analysis (from the last
> **checkpoint**) finds the loser transactions and dirty pages; **Redo
> repeats history** — replaying *all* changes to the exact crash state,
> made **idempotent** by comparing each page's **`pageLSN`** to the log's
> LSN; **Undo** rolls back losers via **before-images**, logging **CLRs**
> so recovery is itself crash-safe. The result: **Redo = durability, Undo
> = atomicity**. Checkpoints bound the replay. With this, the single-node
> database is fully explained.

## What we covered

- After a crash, **steal + no-force** leaves disk with **lost committed
  changes** (need **redo**) and **surviving uncommitted changes** (need
  **undo**).
- **ARIES** rests on **write-ahead logging**, **repeating history during
  redo**, and **logging undo actions** — yielding idempotent, restartable
  recovery.
- **Analysis**: scan from the last **checkpoint** to rebuild the
  **transaction table** (losers) and **dirty page table** — it plans, not
  changes.
- **Redo**: replay *all* changes (winners and losers) to the **exact
  crash state**; **idempotent** via **`pageLSN` ≥ LSN** skip checks — so
  redo can be re-run safely.
- **Undo**: roll back loser transactions using **before-images**, writing
  **Compensation Log Records (CLRs)** so a crash *during* recovery is
  handled.
- **Checkpoints** (esp. **fuzzy** ones) bound how much log recovery must
  replay, trading steady-state overhead for fast recovery.
- **Redo delivers Durability, Undo delivers Atomicity** — with Part IV's
  Isolation, ACID is complete and fully mechanical.

## What's next

That completes the single-node database. [Part VI](/database/part-6-distributed/replication)
scales out to **distributed databases**: **replication** (copies for
availability), **partitioning/sharding** (splitting data across machines),
and **consensus** (Raft) plus distributed transactions — where durability,
the log, and the CAP trade-offs reappear across the network.
