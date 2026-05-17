import type { FaqItem } from "@/lib/seo";

export function FaqSection({ faqs, title = "Common questions" }: { faqs: FaqItem[]; title?: string }) {
  return (
    <section className="rounded-xl border border-surface-muted bg-surface p-6 md:p-8" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-heading text-2xl font-semibold text-brand-primary">
        {title}
      </h2>
      <dl className="mt-6 space-y-6">
        {faqs.map((f) => (
          <div key={f.question}>
            <dt className="font-heading font-semibold text-brand-primary">{f.question}</dt>
            <dd className="mt-2 text-ink-muted">{f.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
