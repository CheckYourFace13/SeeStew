/** Remove trailing ## Sources block when references render separately in the UI. */
export function stripMarkdownSourcesSection(content: string): string {
  return content.replace(/\n##\s*Sources[\s\S]*$/i, "").trim();
}
