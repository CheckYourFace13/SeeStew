import nodemailer from "nodemailer";

/** Server-only email configuration (never import from client components). */
export const emailConfig = {
  contactToEmail: process.env.CONTACT_TO_EMAIL ?? "",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? "465"),
  smtpSecure: process.env.SMTP_SECURE !== "false",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
} as const;

export function isEmailConfigured(): boolean {
  const { contactToEmail, smtpHost, smtpUser, smtpPass } = emailConfig;
  return Boolean(contactToEmail && smtpHost && smtpUser && smtpPass);
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

  const transporter = nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort,
    secure: emailConfig.smtpSecure,
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPass,
    },
  });

  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    "",
    payload.message,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: `SeeStew Contact Form <${emailConfig.smtpUser}>`,
      to: emailConfig.contactToEmail,
      replyTo: payload.email,
      subject: "New SeeStew contact form message",
      text,
    });
    return true;
  } catch (err) {
    console.error("[contact] SMTP send failed:", err);
    return false;
  }
}
