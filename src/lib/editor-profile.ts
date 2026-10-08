import { siteConfig } from "./config";

/**
 * Named editor for bylines and BlogPosting author schema.
 * Photo: temporary site avatar until Chris supplies a real editor photo.
 * TODO (Chris): replace bio with a final 2–3 sentence personal bio + real photo
 * under public/editor/ (see docs/editor-profile-todo.md).
 */
export const editorProfile = {
  name: "Chris P.",
  role: "Editor",
  organization: siteConfig.name,
  /** Compact byline, e.g. "Chris P., Editor, SeeStew" */
  byline: "Chris P., Editor, SeeStew",
  bio: "Chris edits SeeStew, a daily American history site focused on hard-to-believe true stories with named sources. He reviews story framing, source lists, and corrections before publication.",
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
