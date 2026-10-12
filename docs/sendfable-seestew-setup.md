# SendFable setup for SeeStew

## Live embed (configured)

Chris provided the SendFable form embed:

```html
<div data-sendfable-form="seestew-newsletter"></div>
<script src="https://sendfable.com/embed/form.js" async></script>
```

SeeStew implements this via:

- `src/lib/email-signup.ts` — form id `seestew-newsletter`
- `src/components/SendFableEmbed.tsx` — mounts the div + loads `form.js` once (`id="sendfable-embed"`, `lazyOnload`)
- `src/components/EmailDigestSignup.tsx` — homepage / article CTAs
- `src/app/newsletter/page.tsx` — dedicated landing page

Disable signup UI:

```env
NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=false
```

Optional override for form id:

```env
NEXT_PUBLIC_SENDFABLE_FORM_ID=seestew-newsletter
```

No local email collection. No Resend. SMTP contact form stays separate.

## Weekly digest

```bash
npm run digest:draft
```

Writes `docs/latest-weekly-digest.md` for pasting into a SendFable campaign until API automation exists.

## Acceptance

- [x] Real SendFable embed (not a fake form)
- [x] Script loads once per page
- [x] Privacy mentions SendFable
- [x] Powered by SendFable → https://sendfable.com
- [ ] Chris confirms a test subscribe in the live embed
