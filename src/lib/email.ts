/** Server-only email configuration (never import from client components). */
export const emailConfig = {
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  contactToEmail: process.env.CONTACT_TO_EMAIL ?? "",
} as const;

export function isEmailConfigured(): boolean {
  const { resendApiKey, emailFrom, contactToEmail } = emailConfig;
  return Boolean(resendApiKey && emailFrom && contactToEmail);
}

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export async function sendContactEmail(payload: ContactPayload): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  const { resendApiKey, emailFrom, contactToEmail } = emailConfig;
  const subject = `SeeStew contact: ${payload.name.slice(0, 80)}`;
  const text = [
    `Name: ${payload.name}`,
    `Reply-To: ${payload.email}`,
    "",
    payload.message,
  ].join("\n");

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Reply-To:</strong> ${escapeHtml(payload.email)}</p>
    <hr />
    <p>${escapeHtml(payload.message).replace(/\n/g, "<br />")}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [contactToEmail],
      reply_to: payload.email,
      subject,
      text,
      html,
    }),
  });

  return res.ok;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
