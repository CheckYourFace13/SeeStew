import { AdSlot } from "@/components/AdSlot";
import { MarkdownContent } from "@/components/MarkdownContent";

/** Renders story body with a single mid-article ad when content is long enough. */
export function ArticleBody({ content }: { content: string }) {
  const sections = content.split(/(?=^## )/m).filter(Boolean);
  const wordCount = content.split(/\s+/).length;
  const showMidAd = wordCount >= 600 && sections.length >= 2;
  const midIndex = Math.floor(sections.length / 2);

  if (!showMidAd) {
    return (
      <div className="prose-history">
        <MarkdownContent content={content} />
      </div>
    );
  }

  return (
    <div className="prose-history">
      {sections.map((section, i) => (
        <div key={i}>
          <MarkdownContent content={section} />
          {i === midIndex - 1 && (
            <AdSlot className="my-10" format="rectangle" label="Advertisement" />
          )}
        </div>
      ))}
    </div>
  );
}
