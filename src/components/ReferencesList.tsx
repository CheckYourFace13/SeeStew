import type { ArticleReference } from "@/lib/articles";

export function ReferencesList({ references }: { references: ArticleReference[] }) {
  if (!references?.length) return null;

  return (
    <section
      className="mt-12 rounded-xl border border-brand-wash bg-surface-muted p-6"
      aria-labelledby="refs-heading"
    >
      <h2 id="refs-heading" className="font-heading text-xl font-bold text-ink">
        Sources &amp; further reading
      </h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-ink-muted">
        {references.map((ref, i) => (
          <li key={`${ref.url}-${i}`}>
            <cite className="not-italic">
              <span className="font-medium text-ink">{ref.title}</span>
              {ref.publisher && (
                <span className="text-ink-muted"> — {ref.publisher}</span>
              )}
              {ref.year && <span className="text-ink-muted"> ({ref.year})</span>}
            </cite>
            .{" "}
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-mid underline break-all"
            >
              {ref.url.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
