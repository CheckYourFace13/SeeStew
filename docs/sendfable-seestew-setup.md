# SendFable setup for SeeStew

Public email signup stays **off** until you paste real SendFable details.  
There is no public SendFable HTTP API documentation in this repo, and hosted-form / API credentials are not configured yet.

Feature flag (keep false until tested end-to-end):

```env
NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=false
```

Contact form SMTP (`CONTACT_*` / `SMTP_*`) is separate and must not be used as a fake mailing list.

## What Chris needs to provide

From your [SendFable](https://sendfable.com) account (free plan is fine):

| Item | Env var | Notes |
| --- | --- | --- |
| **Hosted signup form URL** (preferred) | `NEXT_PUBLIC_SENDFABLE_SIGNUP_FORM_URL` | Publish a signup form in SendFable → copy the public URL. This URL is safe to expose (it is the public form). |
| **API key** (optional) | `SENDFABLE_API_KEY` | Only if SendFable gives you a server API. **Never** use `NEXT_PUBLIC_` for this. |
| **List / audience ID** (optional) | `SENDFABLE_AUDIENCE_ID` | Required with API key if using API signup. |
| **Double opt-in** | (SendFable setting) | Turn on in SendFable if available — confirm in dashboard. |
| **Weekly digest** | (SendFable campaign / schedule) | Create a weekly campaign in SendFable, or paste the draft from `npm run digest:draft`. |

### Recommended env block (Hostinger + `.env.local`)

```env
NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=false
NEXT_PUBLIC_SENDFABLE_SIGNUP_FORM_URL=
# Optional API path later (server-only; do not enable until API docs exist):
# SENDFABLE_API_KEY=
# SENDFABLE_AUDIENCE_ID=
```

When the hosted form URL is set **and** you have tested a real subscribe:

```env
NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=true
NEXT_PUBLIC_SENDFABLE_SIGNUP_FORM_URL=https://…your-sendfable-form…
```

Then redeploy. Signup blocks appear on the homepage (below main content), article pages (after related links), and a compact footer CTA. Copy includes “Powered by SendFable” → https://sendfable.com.

## After enabling

1. Subscribe with a personal address; confirm double opt-in if enabled.
2. Run `npm run digest:draft` and paste into a SendFable campaign, or schedule automation in SendFable.
3. Update `/privacy` only if signup is live (the page should mention SendFable handles list/digest delivery). With the flag off, privacy must **not** claim an email list exists.
4. Run `npm run check:email-signup`.

## Weekly digest (manual until API automation exists)

```bash
npm run digest:draft
```

Writes `docs/latest-weekly-digest.md` from the last 7 days of articles (and notes videos/shorts when available). Paste into SendFable and send.

## Acceptance

- [ ] Flag false → no signup UI
- [ ] Flag true + form URL → real SendFable signup, not a decorative form
- [ ] No `info@seestew.com` / `mailto:`
- [ ] SMTP contact unchanged
- [ ] “Powered by SendFable” links to https://sendfable.com
