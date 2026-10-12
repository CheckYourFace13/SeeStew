/**
 * Email digest signup via SendFable embed (client-safe).
 * Chris provided form id: seestew-newsletter.
 * Disable with NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=false.
 * See docs/sendfable-seestew-setup.md.
 */

/** Real SendFable form id from Chris — not a fake local collector. */
export const SENDFABLE_FORM_ID = (
  process.env.NEXT_PUBLIC_SENDFABLE_FORM_ID || "seestew-newsletter"
).trim();

export const SENDFABLE_EMBED_SCRIPT = "https://sendfable.com/embed/form.js";

/** Explicit opt-out only; default on because the embed id is real. */
const explicitlyDisabled = process.env.NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED === "false";
const explicitlyEnabled = process.env.NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED === "true";
/** Ready when not disabled and form id present. Treat unset as on (embed provided). */
const flagOn = explicitlyEnabled || (!explicitlyDisabled && Boolean(SENDFABLE_FORM_ID));

export const emailSignupConfig = {
  enabled: flagOn,
  provider: "sendfable" as const,
  formId: SENDFABLE_FORM_ID,
  scriptSrc: SENDFABLE_EMBED_SCRIPT,
  poweredByUrl: "https://sendfable.com",
  newsletterHref: "/newsletter",
  /** Real public signup via SendFable embed only. */
  isReady: flagOn && Boolean(SENDFABLE_FORM_ID),
  mode: "embed" as const,
} as const;
