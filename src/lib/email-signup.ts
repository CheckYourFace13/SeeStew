/**
 * Public email signup is disabled until a real provider is configured.
 * See docs/email-digest-setup.md.
 */
export const emailSignupConfig = {
  enabled: process.env.NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED === "true",
} as const;
