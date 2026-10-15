import type { ArticleReference } from "@/lib/articles";

/**
 * Recognizable institutional sources — matched from publisher + URL only.
 * Never label a source “primary” here; that claim is editorial, not automatic.
 */

export type SourceInstitution = {
  id: string;
  label: string;
  /** First matching reference URL for linking into #refs */
  href: string;
};

const INSTITUTION_RULES: Array<{
  id: string;
  label: string;
  test: (publisher: string, url: string) => boolean;
}> = [
  {
    id: "loc",
    label: "Library of Congress",
    test: (p, u) => /library of congress/i.test(p) || /loc\.gov/i.test(u),
  },
  {
    id: "nara",
    label: "National Archives",
    test: (p, u) =>
      /national archives/i.test(p) ||
      /archives\.gov/i.test(u) ||
      /\bnara\b/i.test(p),
  },
  {
    id: "nps",
    label: "National Park Service",
    test: (p, u) => /national park service/i.test(p) || /nps\.gov/i.test(u),
  },
  {
    id: "smithsonian",
    label: "Smithsonian",
    test: (p, u) => /smithsonian/i.test(p) || /si\.edu/i.test(u),
  },
];

/** Compact chips for institutions actually present in this article’s references. */
export function institutionsFromReferences(
  references: ArticleReference[] | undefined
): SourceInstitution[] {
  if (!references?.length) return [];
  const found: SourceInstitution[] = [];
  const seen = new Set<string>();

  for (const rule of INSTITUTION_RULES) {
    for (const ref of references) {
      const publisher = ref.publisher || "";
      const url = ref.url || "";
      if (!rule.test(publisher, url)) continue;
      if (seen.has(rule.id)) break;
      seen.add(rule.id);
      found.push({ id: rule.id, label: rule.label, href: "#refs-heading" });
      break;
    }
  }
  return found;
}
