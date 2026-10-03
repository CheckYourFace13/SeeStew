# Security audit follow-up (2026-10)

## Actions taken

| Package | Action | Result |
|---|---|---|
| `nodemailer` | Upgraded `^9` → `^10.0.14` | Production SMTP advisory cleared |
| `brace-expansion` (transitive) | `npm audit fix` (no `--force`) | Cleared |
| `braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next` | **Not force-upgraded** | Remains (see below) |

## Remaining findings

### `braces` (high) — **dev-only**

- **Advisory:** GHSA-vfj7-8cjw-p6xm / CVE-2026-93687 (stack exhaustion via deeply nested brace patterns).
- **Production exposure:** None. Reachable only through the ESLint / Next lint toolchain (`eslint-config-next`), not the Next.js production server or contact form.
- **Why it remains:** No patched `braces` release above 3.0.3 exists yet. `npm audit fix --force` would install `eslint-config-next@14.2.35`, a **breaking downgrade** from Next 15.
- **Next safe action:** Watch [micromatch/braces#70](https://github.com/micromatch/braces/issues/70) and npm for `braces@>3.0.3`; then `npm update` / re-audit. Do not run `audit fix --force`.

## Contact / SMTP

After the nodemailer upgrade, `src/lib/email.ts` still uses `nodemailer.createTransport` with the same SMTP env vars (`CONTACT_TO_EMAIL`, `SMTP_*`). Build must pass before deploy.
