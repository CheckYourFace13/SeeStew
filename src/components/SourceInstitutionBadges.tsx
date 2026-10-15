import { institutionsFromReferences } from "@/lib/source-institutions";
import type { ArticleReference } from "@/lib/articles";

/** Compact chips linking to Sources — only for accurately matched institutions. */
export function SourceInstitutionBadges({
  references,
}: {
  references: ArticleReference[] | undefined;
}) {
  const chips = institutionsFromReferences(references);
  if (chips.length === 0) return null;

  return (
    <ul
      className="mt-3 flex flex-wrap gap-2"
      aria-label="Recognizable archival sources cited"
    >
      {chips.map((chip) => (
        <li key={chip.id}>
          <a
            href={chip.href}
            className="inline-flex items-center rounded-md border border-brand-wash bg-white px-2.5 py-1 text-xs font-medium text-ink hover:border-brand-mid hover:text-brand-mid"
          >
            {chip.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
