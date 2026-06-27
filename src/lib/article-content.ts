/** Remove trailing ## Sources block when references render separately in the UI. */
export function stripMarkdownSourcesSection(content: string): string {
  return content.replace(/\n##\s*Sources[\s\S]*$/i, "").trim();
}

/** Drop generic AI-style section labels without changing article prose. */
export function stripBoilerplateSectionHeadings(content: string): string {
  return content
    .replace(/^##\s*Introduction\s*$/gim, "")
    .replace(/^##\s*Conclusion\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Full display pipeline for article body markdown. */
export function prepareArticleBodyForDisplay(
  content: string,
  options?: { stripSources?: boolean }
): string {
  let body = content;
  if (options?.stripSources !== false && /\n##\s*Sources\b/i.test(body)) {
    body = stripMarkdownSourcesSection(body);
  }
  return stripBoilerplateSectionHeadings(body);
}
