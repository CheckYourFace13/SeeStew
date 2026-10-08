# Editor profile — TODO for Chris

Named bylines and BlogPosting author schema currently use **Chris P.** with a short placeholder bio and the SeeStew logo as a temporary editor avatar (not a personal photo).

## Please provide

1. **Final bio** — 2–3 sentences in first person or third person (your choice), factual only. No invented credentials, titles, or affiliations.
2. **Editor photo** — a real headshot you own rights to use. Preferred:
   - Square crop, at least 400×400
   - Save as `public/editor/chris-p.jpg` (or `.webp`)
3. Confirm the public byline spelling: **Chris P.** vs full name if you want it.

## Where to update

| Field | File |
| --- | --- |
| Name, role, bio, image path | `src/lib/editor-profile.ts` |
| Temporary logo avatar | `siteConfig.logo` until photo lands |
| About page copy | pulls from `editorProfile` automatically |

After updating:

```bash
npm run build
```

Then deploy as usual. Set `imageIsPlaceholder: false` once a real photo is live.
