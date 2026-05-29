"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-brand-wash bg-white px-4 py-3 text-ink placeholder:text-ink-soft focus:border-brand-bright focus:outline-none";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [humanCheck, setHumanCheck] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
          humanCheck,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };

      if (res.ok && data.ok) {
        setStatus("success");
        setFeedback(data.message ?? "Thank you. We received your message.");
        setName("");
        setEmail("");
        setMessage("");
        setHumanCheck("");
        setWebsite("");
        return;
      }

      setStatus("error");
      setFeedback(data.message ?? "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setFeedback("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`mt-1.5 resize-y ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="contact-human" className="block text-sm font-medium text-ink">
          What is 4 + 3?
        </label>
        <input
          id="contact-human"
          name="humanCheck"
          type="text"
          required
          inputMode="numeric"
          autoComplete="off"
          value={humanCheck}
          onChange={(e) => setHumanCheck(e.target.value)}
          className={`mt-1.5 max-w-[8rem] ${inputClass}`}
          aria-describedby="contact-human-hint"
        />
        <p id="contact-human-hint" className="mt-1 text-xs text-ink-muted">
          Simple check to reduce automated spam.
        </p>
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Company website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>

      {feedback && (
        <p
          role="status"
          className={`text-sm ${status === "success" ? "text-brand-mid" : "text-brand-pink"}`}
        >
          {feedback}
        </p>
      )}
    </form>
  );
}
