/**
 * Email digest signup via SendFable (client-safe config).
 * Public UI stays off until NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=true AND
 * a hosted form URL is present. API keys live only in server modules.
 * See docs/sendfable-seestew-setup.md.
 */

const flagEnabled = process.env.NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED === "true";

/**
 * Hosted SendFable signup form URL.
 * Prefer NEXT_PUBLIC_ so the client component can link without a server round-trip.
 * Server-only SENDFABLE_SIGNUP_FORM_URL is also accepted at build time when inlined.
 */
export const sendfableSignupFormUrl = (
  process.env.NEXT_PUBLIC_SENDFABLE_SIGNUP_FORM_URL ||
  process.env.SENDFABLE_SIGNUP_FORM_URL ||
  ""
).trim();

const hasHostedForm = Boolean(sendfableSignupFormUrl);

export const emailSignupConfig = {
  enabled: flagEnabled,
  provider: "sendfable" as const,
  poweredByUrl: "https://sendfable.com",
  hasHostedForm,
  /** Ready for a real public signup (hosted SendFable form). */
  isReady: flagEnabled && hasHostedForm,
  mode: hasHostedForm ? ("hosted" as const) : ("off" as const),
} as const;
