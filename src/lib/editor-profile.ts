import { siteConfig } from "./config";

/**
 * Named editor for bylines and BlogPosting author schema.
 * Public name is first name only. Photo: temporary site avatar (optional later).
 * See docs/editor-profile-todo.md.
 */
export const editorProfile = {
  name: "Chris",
  role: "Editor",
  organization: siteConfig.name,
  /** Bio-box label, e.g. "Chris, Editor, SeeStew" */
  byline: "Chris, Editor, SeeStew",
  bio: "Chris edits SeeStew, a daily American history site focused on hard-to-believe true stories with named sources. Each story is reviewed for clear framing, source links, and corrections before publication.",
  /** Temporary: site logo as editor avatar — not a personal photo. */
  imageSrc: siteConfig.logo,
  imageAlt: "SeeStew editor avatar",
  imageIsPlaceholder: true,
  aboutHref: "/about",
  editorialHref: "/editorial",
  contactHref: "/contact",
  sameAs: [
    siteConfig.social.youtubeUrl,
    siteConfig.social.instagramUrl,
    siteConfig.social.tiktokUrl,
  ].filter(Boolean),
} as const;

export function buildPersonAuthorJsonLd() {
  return {
    "@type": "Person" as const,
    name: editorProfile.name,
    jobTitle: editorProfile.role,
    description: editorProfile.bio,
    url: `${siteConfig.url}${editorProfile.aboutHref}`,
    image: `${siteConfig.url}${editorProfile.imageSrc}`,
    worksFor: {
      "@type": "Organization" as const,
      name: editorProfile.organization,
      url: siteConfig.url,
    },
  };
}
