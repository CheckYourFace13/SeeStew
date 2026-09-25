# AdSense readiness — September 25, 2026

## Why

Google AdSense is still “Getting ready” on seestew.com. ads.txt is already Authorized and was left unchanged. This pass adds the missing FAQ, tightens trust signals on articles, and stops the daily story job from failing on an empty queue.

## Routes and files

- Added `/faq` with the full visible FAQ and matching FAQPage JSON-LD.
- Homepage FAQ is a short teaser that links to `/faq` (no homepage FAQPage schema).
- Footer links: Stories, Videos, Shorts, Topics, About, Editorial, FAQ, Contact, Privacy, Terms. Credit remains iScream Studio.
- Article byline already had the date, “By SeeStew,” and editorial standards. Added “Corrections? Contact us.”
- Removed the ad slot that sat above the article body. Ads stay after the story and mid-body on long articles. No ads on contact, privacy, terms, or FAQ.
- Sitemap includes `/faq`. `/blog` remains a permanent redirect to `/articles`.
- `npm run check:article-quality` now fails thin stories (under about 800 words of prose), leftover prompts, `/blog` canonicals, duplicate Sources headings, and public email/mailto. Wired into the deploy workflow and the daily generator.
- Daily Story Generator: queue had 0 pending topics, so “Generate daily story” exited immediately. Added 16 pending U.S. history topics. IndexNow stays `continue-on-error`.
- Dependency patches via `npm audit fix` (no `--force`): Next.js, nodemailer, sharp, js-yaml. Count went from 4 (1 critical, 3 high) to 0.

## ads.txt

Left as:

`google.com, pub-9572509189594279, DIRECT, f08c47fec0942fa0`

## Verification (local)

- `npm run validate:queue` — 105 items, 16 pending, 0 failed
- `npm run check:article-quality` — 102 articles passed
- `npm run check:story-images` — 102 articles passed
- `npm audit` — 0 vulnerabilities (was 4: 1 critical, 3 high). Installed next 15.5.26, nodemailer 9.1.1, sharp 0.35.4
- `npm run build` — passed; `/faq` is a static route

## Manual AdSense step

In AdSense, request a review when the dashboard offers it. ads.txt is already Authorized. No further ads.txt edit is required.
