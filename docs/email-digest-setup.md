# Weekly email digest — setup (not live yet)

SeeStew does **not** show a public email signup until a provider is configured end-to-end.  
Feature flag (keep off until tested):

```env
NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=false
```

No SendFable, Mailchimp, Buttondown, or similar keys are present in the repo today. Contact uses SMTP only (`CONTACT_*` / `SMTP_*`) and must stay as-is — do not route list signup through the contact inbox as a fake list.

## Recommended path (when ready)

Pick one provider that supports double opt-in and a simple embed/API:

| Option | Notes |
| --- | --- |
| **Buttondown** | Simple API, double opt-in, good for newsletters |
| **Mailchimp** | Audience + automation; heavier |
| **Beehiiv / ConvertKit** | Fine if you already use them |
| **SendFable** | Only if you already have an account and API docs — not configured here |

### Environment variables (example)

Add to Hostinger Node env (and local `.env.local`) when you have real values:

```env
NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=true
EMAIL_PROVIDER=buttondown
EMAIL_PROVIDER_API_KEY=
EMAIL_LIST_OR_AUDIENCE_ID=
# Optional webhook secret if the provider signs signup events
EMAIL_SIGNUP_WEBHOOK_SECRET=
```

Server-only keys must never use the `NEXT_PUBLIC_` prefix.

### Implementation checklist (when keys exist)

1. Add a small API route (e.g. `POST /api/newsletter`) that:
   - Validates email format
   - Applies bot protection (honeypot + rate limit; Cloudflare Turnstile optional)
   - Calls the provider API with double opt-in if supported
   - Never returns or logs the full subscriber list
2. Render a signup block only when `NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED === "true"`.
3. Copy must be privacy-safe: what you send (weekly new stories), how to unsubscribe, link to `/privacy`. No public `mailto:` and no `info@seestew.com`.
4. Weekly digest automation: provider automation or a cron that sends the last 7 days of `/articles` titles + links (from sitemap or `content/articles`).
5. Document a test path: use a personal address, confirm double opt-in email, confirm one digest, unsubscribe.

### Acceptance

- [ ] Flag false → no signup UI anywhere
- [ ] Flag true → real provider call, double opt-in if available
- [ ] No fake “join 10,000 readers” language
- [ ] SMTP contact form still works unchanged

Until then: leave the flag false and do not add a decorative form.
