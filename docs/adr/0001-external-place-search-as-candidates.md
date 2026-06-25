# External Place Search As Candidates

External place search results are stored as `ShopCandidate` records and are not shown as verified ramen shops until reviewed and promoted. This keeps the canonical `shops` table trustworthy while still allowing Naver Local Search API, user submissions, and future providers to help discover new ramen places.

**Status**: accepted

**Considered Options**:

- Show external API results directly in search.
- Insert external API results directly into `shops`.
- Store external API results as candidates, then review and promote.

**Consequences**:

- Search quality depends on our verified DB first, not on noisy external result filtering.
- A cron-like sync can refresh candidate data, but it must not mutate verified shops without review.
- We need a candidate table, scoring rules, duplicate detection, and an admin/review path.
