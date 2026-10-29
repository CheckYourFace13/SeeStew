#!/usr/bin/env node
/**
 * Regression: validate:articles must honor format:"quick-read".
 * Today's 2026-10-29 QR run generated a valid companion then failed this check.
 */

import { validateArticleFile, validateStory } from "./article-validation.mjs";

const qr = {
  title: "The Molasses Flood Plaque Came a Century Late",
  excerpt: "Boston waited until 2019 for a permanent plaque marking the 1919 disaster.",
  category: "Weird America",
  format: "quick-read",
  content: `${"Word ".repeat(280)}\n\nThe plaque went up in 2019 [1] after a century [2].\n\n## Sources\n\n1. Great Molasses Flood — *Encyclopaedia Britannica*. [Link](https://www.britannica.com/topic/Great-Molasses-Flood)\n2. A Deadly Tsunami of Molasses — *NPR*. [Link](https://www.npr.org/2019/01/15/685154620/a-deadly-tsunami-of-molasses-in-bostons-north-end)`,
  references: [
    {
      title: "Great Molasses Flood",
      publisher: "Encyclopaedia Britannica",
      url: "https://www.britannica.com/topic/Great-Molasses-Flood",
    },
    {
      title: "A Deadly Tsunami of Molasses",
      publisher: "NPR",
      url: "https://www.npr.org/2019/01/15/685154620/a-deadly-tsunami-of-molasses-in-bostons-north-end",
    },
  ],
};

let failed = 0;
const asFile = validateArticleFile(qr);
if (!asFile.ok) {
  console.error(`FAIL: validateArticleFile rejected a valid Quick Read: ${asFile.errors.join("; ")}`);
  failed++;
} else {
  console.log("PASS: validateArticleFile honors format=quick-read");
}

const { format: _fmt, ...qrBody } = qr;
const asFull = validateStory(qrBody, { format: "full" });
if (asFull.ok) {
  console.error("FAIL: full-story rules should reject a ~280-word Quick Read");
  failed++;
} else {
  console.log("PASS: full-story rules still reject short Quick Reads");
}

if (failed) process.exit(1);
console.log("Quick Read file-validation regressions passed.");
