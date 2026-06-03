---
sidebar_position: 3
title: "Specialized Indexes and Engines"
---

# Specialized Indexes and Engines

> The B-tree and LSM-tree of [Part II](/database/part-2-storage-engines/b-trees)
> answer "find this key" and "find this range." But "find documents
> containing these *words*," "find points *near* here," "find vectors
> *similar* to this one," and "what happened in this *time window*" need
> different data structures. An index is a structure **matched to a query
> pattern** — and this chapter surveys the specialized ones behind search,
> geo, time-series, and AI similarity.

[Chapters 24–25](/database/part-7-analytics/columnar-and-olap) covered
analytical *scans*. This chapter covers analytical and specialized
*lookups* — query patterns that B-trees handle poorly or not at all. The
unifying lesson: **the right index is the data structure whose shape
mirrors the query's shape.** Get that mapping and you understand why
specialized databases exist.

## 1. The principle: index follows query

A B-tree ([Chapter 5](/database/part-2-storage-engines/b-trees)) is great
for `WHERE id = 42` and `WHERE id BETWEEN 10 AND 20` because its sorted,
balanced structure mirrors *ordered key* access. But it's useless for:

- "Which documents contain the word *database*?" (text, not key lookup)
- "Which stores are within 5 km of me?" (2-D proximity, not 1-D range)
- "Which 10 product embeddings are *most similar* to this one?" (nearest
  neighbor in high-dimensional space)

Each needs an index whose structure matches the query. There's no universal
index — sorted order helps ranges, hashing helps equality, and these
specialized queries need their own structures. Recognizing "this query
pattern wants *that* index" is the skill.

## 2. Inverted indexes: full-text search

To answer "which documents contain word X," you need an **inverted index** —
the structure behind every search engine (Lucene, Elasticsearch, Solr,
Postgres full-text). It maps **each term → the list of documents containing
it** (a *posting list*) — "inverted" from the natural document→words
mapping:

```
documents:
  doc1: "the fast database"
  doc2: "a fast query"
inverted index (term → posting list):
  fast     → [doc1, doc2]
  database → [doc1]
  query    → [doc2]
```

A search for "fast database" intersects the posting lists for `fast` and
`database` → `[doc1]`. Building it requires **tokenization** (split text
into terms, lowercase, remove stop-words, **stem** "running"→"run"), and
posting lists store positions too (for phrase queries). Crucially, results
are **ranked** by relevance — **TF-IDF** or **BM25** score how well a
document matches (term frequency, inverse document frequency) — because
search returns *best matches*, not exact ones. Full-text search is a
different game from key lookup: tokenize, invert, intersect, rank.

## 3. Spatial indexes: geo queries

"Find points near here" or "find shapes overlapping this region" is
**2-D** (or N-D), and a 1-D B-tree can't index two dimensions at once
(sorting by latitude scatters longitude). **Spatial indexes** solve
multi-dimensional proximity and overlap:

- **R-tree**: a B-tree-like structure of nested **bounding boxes**; each
  node covers a rectangle containing its children. A "within this region"
  query descends only into overlapping boxes. (PostGIS, spatial databases.)
- **Quadtree / k-d tree**: recursively partition space into quadrants/half-
  spaces.
- **Space-filling curves** (geohash, Z-order/Morton, Hilbert): map 2-D
  coordinates to a *1-D* value preserving locality, so a normal B-tree can
  index it — nearby points get nearby keys. The clever trick to reuse 1-D
  indexes for geo.

```
"stores within 5km" → R-tree: descend only into bounding boxes near me
                    → or geohash: B-tree range scan on the geohash prefix
```

Spatial indexes power maps, ride-sharing ("drivers near you"), geofencing,
and GIS. The query shape — proximity in space — demands a structure that
understands space, which a linear key order doesn't.

## 4. Time-series engines

Time-series data — metrics, sensor readings, events — has a distinctive
shape: **append-mostly, time-ordered, queried by time range, often
downsampled**. Time-series databases (InfluxDB, TimescaleDB, Prometheus,
specialized stores) optimize for it:

- **Time-partitioning**: data is chunked by time window, so a "last 24h"
  query touches only recent chunks and old data can be dropped wholesale
  (**retention policies**) — a partitioning ([Chapter 19](/database/part-6-distributed/partitioning))
  on time.
- **LSM-style ingest** ([Chapter 6](/database/part-2-storage-engines/lsm-trees)):
  high write throughput via append-only, since data arrives continuously.
- **Columnar + delta/timestamp compression**
  ([Chapter 24](/database/part-7-analytics/columnar-and-olap)): timestamps
  are nearly sequential (delta-encode tiny), values often similar (compress
  well).
- **Downsampling / rollups**: precompute hourly/daily aggregates from raw
  data, so dashboards query cheap summaries
  ([Chapter 27](/database/part-7-analytics/streaming-and-materialized-views)).

Time-series is less a new index than a *recombination* — time-partitioning
+ LSM ingest + columnar compression + rollups — tuned for the "write a
flood, read by time window, aggregate" pattern. It shows how the building
blocks of [Parts I–VII](/database/table-of-contents) recombine for a
workload.

## 5. Vector indexes: similarity search

The newest and hottest specialized index, driven by machine learning.
**Embeddings** turn text/images/audio into high-dimensional **vectors**
(hundreds to thousands of floats) where *similar items are near each other*.
The query is **nearest-neighbor**: "find the K vectors most *similar* to
this one" (by cosine/Euclidean distance) — the basis of semantic search,
recommendations, and **RAG** (retrieval-augmented generation) for LLMs.

Exact nearest-neighbor in high dimensions is brutally expensive (the "curse
of dimensionality" defeats tree indexes), so vector databases use
**Approximate Nearest Neighbor (ANN)** — trade a little accuracy for huge
speed:

- **HNSW** (Hierarchical Navigable Small World): a layered proximity graph;
  search greedily walks toward the query through "small-world" links. The
  dominant ANN index — fast, accurate.
- **IVF** (Inverted File): cluster vectors, search only the nearest few
  clusters.
- **Product quantization**: compress vectors to fit more in memory.

```
query vector → HNSW graph walk → ~10 approximate nearest neighbors, fast
```

Systems: **pgvector** (Postgres extension), Pinecone, Weaviate, Milvus,
FAISS (library). Vector search is why "find me things *like* this" — by
meaning, not keyword — is suddenly everywhere, and it needs an index built
for high-dimensional proximity, which no classical structure provides.

> :surprisedgoose: Notice that "search" has quietly become *three different
> indexing problems* depending on what "similar" means. **Keyword search**
> (does this *word* appear?) wants an **inverted index** — exact term
> matching. **Geo search** (is this point *near* here?) wants a **spatial
> index** — proximity in 2-D. **Semantic search** (does this *mean* the
> same thing?) wants a **vector index** — proximity in 500-D embedding
> space. The same English word "find similar things" maps to three
> completely different data structures, because "similar" means term-overlap,
> or physical distance, or semantic distance. The index *is* the
> definition of similarity — choose the structure that encodes the
> "nearness" your query means.

## 6. Bitmap indexes

One more, prominent in analytics: the **bitmap index**, for **low-cardinality**
columns (few distinct values — `status`, `gender`, `country`). For each
distinct value, store a **bitmap** (one bit per row: 1 if that row has the
value):

```
status column → bitmaps:
  active:   1 0 1 1 0 ...   (rows 1,3,4 are active)
  inactive: 0 1 0 0 1 ...
query "active AND country=US" → bitwise-AND the two bitmaps (CPU-fast)
```

Combining predicates becomes **bitwise AND/OR** over bitmaps — extremely
fast (the CPU ANDs 64 bits per instruction), and bitmaps compress well
(RLE-style). Bitmap indexes shine in analytical/warehouse queries with many
low-cardinality filters (`WHERE region IN (...) AND status = ... AND year =
...`), where they beat B-trees. They're a column-store-era index, complementing
[Chapter 24](/database/part-7-analytics/columnar-and-olap)'s storage.

## 7. Specialized databases vs extensions

A practical question: do you adopt a *separate* specialized database, or an
*extension* to your existing one? The landscape offers both:

- **Dedicated systems**: Elasticsearch (search), a time-series DB, a vector
  DB (Pinecone) — best-in-class for that workload, but another system to
  operate, sync, and reason about (data duplication, consistency across
  systems).
- **Extensions to a general database**: Postgres especially — `pg_trgm`/
  `tsvector` (full-text), **PostGIS** (spatial), **pgvector** (vectors),
  TimescaleDB (time-series). "Good enough" for many workloads, with one
  system to operate and transactional consistency with your other data.

The trade is the classic one: a specialized system's *performance ceiling*
vs the *operational simplicity* and *consistency* of one database doing it
all. For moderate scale, "just use a Postgres extension" is often right; at
extreme scale, the dedicated system earns its operational cost. Either way,
underneath is one of this chapter's indexes.

## 8. The lesson: structure mirrors query

Step back to the principle. Every index in this book maps a **query shape**
to a **data structure**:

- Equality/range on a key → **B-tree** / hash
  ([Chapter 5](/database/part-2-storage-engines/b-trees)).
- Write-heavy key-value → **LSM-tree**
  ([Chapter 6](/database/part-2-storage-engines/lsm-trees)).
- Full-text term match → **inverted index**.
- Spatial proximity → **R-tree / geohash**.
- Time-window scans → **time-partitioned LSM + rollups**.
- High-dimensional similarity → **vector (ANN) index**.
- Low-cardinality filters → **bitmap index**.

There is no universal index because there is no universal query. The art —
in schema design ([Chapter 29](/database/part-8-in-practice/schema-design-and-evolution))
and system selection — is matching the structure to the access pattern your
application actually has. Master that mapping and "which database/index do I
need?" becomes "what shape are my queries?" — a far more answerable
question. Next, we look at keeping these indexes and aggregates *fresh* as
data changes: streaming and materialized views.

> :weightliftinggoose: The principle: **an index is a data structure
> matched to a query pattern** — there's no universal index because there's
> no universal query. Know the specialized ones: **inverted index**
> (full-text — term→posting list, tokenize + rank with BM25); **spatial**
> (R-tree / geohash for 2-D proximity); **time-series** (time-partitioned
> LSM + columnar compression + rollups); **vector/ANN** (HNSW for
> high-dimensional similarity — the engine of semantic search and RAG); and
> **bitmap** (low-cardinality analytical filters via bitwise ops). Choose
> by query shape — and prefer a **Postgres extension** (PostGIS, pgvector)
> over a separate system until scale demands otherwise.

## What we covered

- An **index is a structure matched to a query pattern**; B-trees suit
  key equality/range but not text, geo, similarity, or time-window queries.
- **Inverted indexes** (term → posting list) power full-text search:
  tokenize/stem, intersect posting lists, **rank** with TF-IDF/BM25.
- **Spatial indexes** (**R-tree**, quadtree, **geohash/Z-order**
  space-filling curves) answer 2-D proximity/overlap queries.
- **Time-series engines** recombine **time-partitioning + LSM ingest +
  columnar compression + downsampling/rollups** for metric workloads.
- **Vector (ANN) indexes** (**HNSW**, IVF, quantization) do
  high-dimensional **similarity search** over ML embeddings — semantic
  search, recommendations, RAG.
- **Bitmap indexes** answer low-cardinality analytical filters via fast
  **bitwise AND/OR**.
- **Specialized databases** (Elasticsearch, Pinecone) vs **extensions**
  (PostGIS, pgvector, TimescaleDB): performance ceiling vs operational
  simplicity + consistency.
- The lesson: **structure mirrors query** — choose the index whose shape
  matches your access pattern.

## What's next

[Chapter 27](/database/part-7-analytics/streaming-and-materialized-views) —
streaming and materialized views. Instead of re-running expensive queries,
**precompute** results and keep them **fresh incrementally** as data
changes: materialized views, incremental view maintenance, stream
processing, and **change data capture** (tapping the WAL of
[Chapter 16](/database/part-5-durability/write-ahead-log) as a change
stream).
