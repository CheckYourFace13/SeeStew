# Editor profile — optional photo

Public bylines and BlogPosting author schema use first name only: **Chris**.
Bio is generic (no last initial or personal details). The SeeStew logo is the temporary editor avatar.

## Optional (not required)

1. **Editor photo** — only if you want one. A real headshot you own rights to use:
   - Square crop, at least 400×400
   - Save as `public/editor/chris.jpg` (or `.webp`)
   - Update `imageSrc` in `src/lib/editor-profile.ts` and set `imageIsPlaceholder: false`
2. **Bio tweak** — keep it generic; do not add a last name/initial or personal details on the public site.

## Where to update

| Field | File |
| --- | --- |
| Name, role, bio, image path | `src/lib/editor-profile.ts` |
| Temporary logo avatar | `siteConfig.logo` until an optional photo lands |
| About page copy | pulls from `editorProfile` automatically |

```bash
npm run build
```
