import { NextResponse } from "next/server";
import {
  isEmailConfigured,
  isValidEmail,
  sendContactEmail,
} from "@/lib/email";

const MAX_NAME = 120;
const MAX_MESSAGE = 4000;
const HUMAN_ANSWER = "7";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
  humanCheck?: string;
};

function genericError(status: number) {
  return NextResponse.json(
    { ok: false, message: "Something went wrong. Please try again." },
    { status }
  );
}

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return genericError(400);
  }

  const honeypot = (body.website ?? "").trim();
  if (honeypot.length > 0) {
    return NextResponse.json({ ok: true, message: "Thank you. We will be in touch." });
  }

  const human = (body.humanCheck ?? "").trim();
  if (human !== HUMAN_ANSWER) {
    return genericError(400);
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return genericError(400);
  }
  if (name.length > MAX_NAME || message.length > MAX_MESSAGE) {
    return genericError(400);
  }
  if (!isValidEmail(email)) {
    return genericError(400);
  }

  if (!isEmailConfigured()) {
    console.error("[contact] Missing SMTP or CONTACT_TO_EMAIL environment variables");
    return genericError(503);
  }

  const sent = await sendContactEmail({ name, email, message });
  if (!sent) {
    return genericError(502);
  }

  return NextResponse.json({
    ok: true,
    message: "Thank you. We received your message and will respond when we can.",
  });
}
