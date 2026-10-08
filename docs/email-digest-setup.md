# Weekly email digest — SeeStew

**Provider:** SendFable (preferred).  
**Status:** Signup UI is off until credentials/form URL exist.

See the full checklist: [docs/sendfable-seestew-setup.md](./sendfable-seestew-setup.md)

```env
NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=false
SENDFABLE_SIGNUP_FORM_URL=
```

Draft this week’s email anytime:

```bash
npm run digest:draft
```

Output: `docs/latest-weekly-digest.md` — paste into SendFable.

Do not use the SMTP contact form as a mailing list. Do not expose `info@seestew.com`.
