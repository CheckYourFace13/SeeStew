import type { YouTubeVideo } from "./youtube";
import { siteConfig } from "./config";

const EDITORIAL: Record<string, string> = {
  BrNGqid8_tY: `Theodore Roosevelt took office in 1901 after William McKinley was shot. He believed the United States had to act like a great power, not just talk like one.

His **Big Stick** line meant keeping a strong navy and using it when diplomacy stalled. He brokered peace between Russia and Japan, sent the Great White Fleet around the world, and told European powers to stay out of Latin American affairs through the Roosevelt Corollary.

The film above walks through TR's ranch years, his fights with trusts, and the foreign crises that still come up in debates over when America should intervene abroad.`,

  mLuyPuMyVMc: `Before Jamestown dominated the story, France tried to hold **Fort Caroline** near today's Jacksonville. René Goulaine de Laudonnière led the effort. Hunger, mutiny, and Spanish hostility nearly ended it several times.

In 1565 Pedro Menéndez destroyed the French post and founded St. Augustine. The clash was about religion, empire, and who controlled the Atlantic coast.

If you want more on early colonial rivalry, subscribe on [YouTube](${siteConfig.social.youtubeSubscribeUrl}) or catch the short version on [@see.stew](${siteConfig.social.instagramUrl}).`,

  HCzHfSU_95E: `Antonio Pigafetta sailed with Magellan and lived to write one of the only eyewitness accounts of the first voyage around the world. His notes describe islands, rulers, and shipboard discipline in detail most officials never bothered to record.

Magellan died in the Philippines. Pigafetta made it home to Italy and finished the journal that historians still cite.

The full piece runs above. Clips from the same story run on [Instagram](${siteConfig.social.instagramUrl}) and [TikTok](${siteConfig.social.tiktokUrl}).`,
};

function paragraphsFromDescription(description: string): string {
  const cleaned = description
    .replace(/#\w+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned || cleaned.length < 40) {
    return "";
  }

  const chunks = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 20);
  return chunks
    .slice(0, 4)
    .map((p) => p.trim())
    .join("\n\n");
}

function defaultEditorial(video: YouTubeVideo): string {
  const fromDesc = paragraphsFromDescription(video.description);
  const lead =
    video.format === "short"
      ? `This is a SeeStew short on **${video.title}**. It is pulled straight from our [YouTube channel](${siteConfig.social.youtubeUrl}) and plays here so you can watch without switching apps.`
      : `**${video.title}** is a SeeStew documentary on American history. We host it here with notes and links; the upload also lives on [YouTube](${siteConfig.social.youtubeSubscribeUrl}) where you can subscribe for the next release.`;

  const body =
    fromDesc ||
    (video.format === "short"
      ? "We post these when a story needs a quick hook before the full episode goes up. Check the long-form section on this site or the main channel feed for the complete version."
      : "The episode covers the people, laws, and fights involved, with sources called out in the video description on YouTube.");

  const footer = `More on this period is in our [articles](/articles). Follow [@see.stew](${siteConfig.social.instagramUrl}) on Instagram and [TikTok](${siteConfig.social.tiktokUrl}) for daily clips.`;

  return `${lead}\n\n${body}\n\n${footer}`;
}

export function getVideoEditorial(video: YouTubeVideo): string {
  return EDITORIAL[video.id] ?? defaultEditorial(video);
}
