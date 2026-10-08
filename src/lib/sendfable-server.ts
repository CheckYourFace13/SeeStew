/**
 * Server-only SendFable credentials. Do not import from client components.
 */

export const sendfableServerConfig = {
  apiKey: process.env.SENDFABLE_API_KEY?.trim() || "",
  audienceId: process.env.SENDFABLE_AUDIENCE_ID?.trim() || "",
  get hasApi() {
    return Boolean(this.apiKey && this.audienceId);
  },
} as const;
