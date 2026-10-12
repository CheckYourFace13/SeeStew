# Video ↔ article matching — next steps

Deterministic matching only (see `src/lib/video-article-links.ts`):

1. `relatedVideoId` / `relatedShortId` / `sourceVideoId` on the article JSON  
2. Exact slug match (`article.slug` === `video.slug`)  
3. Explicit map `EXPLICIT_VIDEO_TO_ARTICLE`

**Current status:** 0 deterministic matches. Research article slugs (e.g. `st-francis-dam-disaster-1928`) do not equal YouTube title slugs (e.g. `st-francis-dam-collapse-a-catastrophic-failure`). Do **not** fuzzy-force weak pairs.

## How to add a verified pair

On the article JSON:

```json
"relatedVideoId": "YOUTUBE_VIDEO_ID",
"relatedShortId": "YOUTUBE_SHORT_ID"
```

Or add to `EXPLICIT_VIDEO_TO_ARTICLE` in `src/lib/video-article-links.ts`:

```ts
"youtubeVideoIdOrSlug": "article-slug",
```

Then run:

```bash
npm run audit:video-article-links
```

## Likely candidates to review manually

| YouTube / short theme (from recent builds) | Possible article slug |
| --- | --- |
| St. Francis Dam collapse | `st-francis-dam-disaster-1928` |
| Black Tom Island explosion | `black-tom-explosion-1916` |
| Washington’s Farewell Address | _(no matching research article yet)_ |
| Teddy Roosevelt / Big Stick | _(no matching research article yet)_ |

Re-run the audit after any ID is set. Full unmatched lists: `docs/video-article-link-audit.md`.
