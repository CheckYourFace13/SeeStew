#!/usr/bin/env node
/**
 * Resize/recompress local story cards larger than 400KB to max 1200px.
 * Preserves JPEG; does not convert formats or touch credits/alt.
 */

import { readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const ROOT = join(process.cwd(), "public", "stories");
const MAX_BYTES = 400 * 1024;
const MAX_EDGE = 1200;
const QUALITY = 78;

async function main() {
  const dirs = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory());
  let changed = 0;
  for (const d of dirs) {
    const file = join(ROOT, d.name, "card.jpg");
    let st;
    try {
      st = statSync(file);
    } catch {
      continue;
    }
    if (st.size <= MAX_BYTES) continue;
    const before = st.size;
    const img = sharp(file);
    const meta = await img.metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    let pipeline = sharp(file);
    if (w > MAX_EDGE || h > MAX_EDGE) {
      pipeline = pipeline.resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    const buf = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    if (buf.length < before * 0.95) {
      const tmp = `${file}.tmp.jpg`;
      writeFileSync(tmp, buf);
      try {
        unlinkSync(file);
      } catch {
        /* Windows may lock; overwrite via rename */
      }
      try {
        renameSync(tmp, file);
      } catch {
        try {
          writeFileSync(file, buf);
        } catch (e) {
          console.warn(`${d.name}: locked, skipped (${e.message})`);
          try {
            unlinkSync(tmp);
          } catch {
            /* ignore */
          }
          continue;
        }
        try {
          unlinkSync(tmp);
        } catch {
          /* ignore */
        }
      }
      changed++;
      console.log(
        `${d.name}: ${Math.round(before / 1024)}KB → ${Math.round(buf.length / 1024)}KB (${w}x${h})`
      );
    } else {
      console.log(`${d.name}: skipped (no meaningful savings)`);
    }
  }
  console.log(`Compressed ${changed} oversized card(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
