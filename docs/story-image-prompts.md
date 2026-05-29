# Story image prompts

SeeStew card images live at `public/stories/<slug>/card.jpg` (16:9 crop in UI). Prefer **Library of Congress**, **NARA**, or **Smithsonian** downloads; use this file only when archival search does not yield a strong card.

**Status (last audit):** All 18 published articles have local `card.jpg` files. No purple `/stories/defaults/*.svg` placeholders should appear on story cards.

Optional upgrades (current images work but could be more on-topic):

| Slug | Current file | Notes |
|------|----------------|-------|
| `operation-midnight-climax` | `/stories/operation-midnight-climax/card.jpg` (~28 KB) | Generic 1950s street scene; consider a period interior or documentary still if licensing allows. |
| `goldsboro-nuclear-accident-1961` | `/stories/goldsboro-nuclear-accident-1961/card.jpg` (~2 MB) | Verify subject is B-52 / SAC era; replace if not clearly aviation-related. |

---

## Generation prompts (if replacing or adding art)

Use **1792×1024** or **1920×1080**, 16:9, photographic or lithograph style — **no text overlays**, **no modern cartoon style**.

### operation-midnight-climax

- **Title:** Operation Midnight Climax: When the CIA Ran Secret LSD Brothels
- **Current image path:** `/stories/operation-midnight-climax/card.jpg`
- **Recommended filename:** `public/stories/operation-midnight-climax/card.jpg`
- **Image prompt:** 1950s San Francisco Telegraph Hill at night, rain-slick street, muted sodium vapor glow, one ordinary apartment building with lit windows, cinematic black-and-white documentary still, no readable signage, no people in foreground, 16:9
- **Alt text:** San Francisco street at night in the 1950s, evoking the era of CIA safe-house experiments

### goldsboro-nuclear-accident-1961

- **Title:** The Night Two Hydrogen Bombs Fell on North Carolina
- **Current image path:** `/stories/goldsboro-nuclear-accident-1961/card.jpg`
- **Recommended filename:** `public/stories/goldsboro-nuclear-accident-1961/card.jpg`
- **Image prompt:** U.S. Air Force B-52 Stratofortress on a night alert runway, winter 1961, harsh floodlights, ice on tarmac, sepia-black-and-white archival photo look, wide 16:9 composition, no mushroom cloud, no explosion
- **Alt text:** U.S. Air Force B-52 bomber on alert at night, evoking the 1961 Goldsboro nuclear accident

---

## Completed local assets (reference)

| Slug | Local path | Source |
|------|------------|--------|
| `battle-of-los-angeles-1942` | `/stories/battle-of-los-angeles-1942/card.jpg` | Library of Congress |
| `black-sox-scandal-1919` | `/stories/black-sox-scandal-1919/card.jpg` | Library of Congress |
| `black-tom-explosion-1916` | `/stories/black-tom-explosion-1916/card.jpg` | Library of Congress |
| `bleeding-kansas-1856` | `/stories/bleeding-kansas-1856/card.jpg` | Library of Congress |
| `bonus-army-1932` | `/stories/bonus-army-1932/card.jpg` | Library of Congress |
| `demon-core-los-alamos` | `/stories/demon-core-los-alamos/card.jpg` | Los Alamos National Laboratory / Wikimedia Commons |
| `ghost-army-wwii` | `/stories/ghost-army-wwii/card.jpg` | Library of Congress |
| `goldsboro-nuclear-accident-1961` | `/stories/goldsboro-nuclear-accident-1961/card.jpg` | Library of Congress |
| `great-molasses-flood-1919` | `/stories/great-molasses-flood-1919/card.jpg` | Library of Congress |
| `great-moon-hoax-1835` | `/stories/great-moon-hoax-1835/card.jpg` | Library of Congress (Moon Hoax lithograph) |
| `johnstown-flood-1889` | `/stories/johnstown-flood-1889/card.jpg` | Library of Congress |
| `new-london-school-explosion-1937` | `/stories/new-london-school-explosion-1937/card.jpg` | Library of Congress |
| `operation-midnight-climax` | `/stories/operation-midnight-climax/card.jpg` | Library of Congress |
| `port-chicago-explosion-1944` | `/stories/port-chicago-explosion-1944/card.jpg` | Library of Congress |
| `radium-girls-1920s` | `/stories/radium-girls-1920s/card.jpg` | Library of Congress |
| `st-francis-dam-disaster-1928` | `/stories/st-francis-dam-disaster-1928/card.jpg` | Library of Congress |
| `teapot-dome-scandal-1920s` | `/stories/teapot-dome-scandal-1920s/card.jpg` | Library of Congress |
| `uss-indianapolis-1945` | `/stories/uss-indianapolis-1945/card.jpg` | Library of Congress |

Videos and shorts use YouTube `hqdefault` / API thumbnails — no local card files required.
