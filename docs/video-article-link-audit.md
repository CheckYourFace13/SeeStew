# Video ↔ article link audit

Generated: 2026-04-08

Video catalog: SeeStew YouTube feed as used at build time (~3 long-form + ~15 shorts in the latest production build; API/RSS availability varies by environment).

Articles: 110

Matching rules (deterministic only — no fuzzy title overlap):

1. `relatedVideoId` / `relatedShortId` / `sourceVideoId` on the article
2. Exact slug match (`article.slug` === `video.slug`)
3. Explicit map in `src/lib/video-article-links.ts` (`EXPLICIT_VIDEO_TO_ARTICLE`)

Runtime wiring: `src/lib/related.ts` and article/video/short pages use `linkedVideosForArticle` / `linkedArticlesForVideo` only. Weak title-overlap pairs were removed for video↔article links.

## Matched pairs

_None yet._

- Every article currently has `relatedVideoId: null` (and no `relatedShortId` / `sourceVideoId`).
- Channel video slugs (e.g. `teddy-roosevelt-big-stick-diplomacy`, `st-francis-dam-collapse-a-catastrophic-failure`) do not equal research article slugs (e.g. `st-francis-dam-disaster-1928`).
- Do **not** force fuzzy matches. When a true companion exists, set `relatedVideoId` / `relatedShortId` on the article JSON, or add a verified entry to `EXPLICIT_VIDEO_TO_ARTICLE`.

## Unmatched videos / shorts (examples from recent builds)

Do **not** force weak links. Add an explicit map entry or `relatedVideoId` only when verified.

- `teddy-roosevelt-big-stick-diplomacy` — long
- `rene-laudonniere-fort-caroline` — long
- `antonio-pigafetta-magellan` — long
- Shorts such as `washington-s-farewell-address-warnings-for-america`, `st-francis-dam-collapse-a-catastrophic-failure`, `black-tom-island-explosion-wwi-sabotage-in-nyc` (and other `/shorts/[slug]` routes) — no exact article slug match

Re-run anytime:

```bash
npm run audit:video-article-links
```

## Unmatched articles (no verified companion video)

110 of 110 articles have no deterministic video/short pair.

That is expected for research-first stories. Link when a true companion exists.

<details><summary>Unmatched article slugs</summary>

See `content/articles/*.json` — all current slugs are unmatched until an explicit ID or exact slug pair is added.

</details>
