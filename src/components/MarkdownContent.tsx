import type { ReactNode } from "react";

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const bold = remaining.match(/^\*\*([^*]+)\*\*/);
    const link = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    const footnote = remaining.match(/^\[(\d+)\]/);

    if (bold) {
      parts.push(
        <strong key={key++} className="font-semibold text-ink">
          {bold[1]}
        </strong>
      );
      remaining = remaining.slice(bold[0].length);
    } else if (link) {
      parts.push(
        <a
          key={key++}
          href={link[2]}
          className="text-brand-mid underline hover:text-brand-bright"
          target={link[2].startsWith("http") ? "_blank" : undefined}
          rel={link[2].startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {link[1]}
        </a>
      );
      remaining = remaining.slice(link[0].length);
    } else if (footnote) {
      parts.push(
        <sup key={key++} className="text-brand-mid">
          [{footnote[1]}]
        </sup>
      );
      remaining = remaining.slice(footnote[0].length);
    } else {
      const nextSpecial = remaining.search(/\*\*|\[(\d+)\]|\[/);
      const chunk =
        nextSpecial === -1 ? remaining : remaining.slice(0, nextSpecial);
      parts.push(chunk);
      remaining = nextSpecial === -1 ? "" : remaining.slice(nextSpecial);
    }
  }

  return parts;
}

export function MarkdownContent({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div className="prose-history">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i}>{parseInline(trimmed.replace(/^##\s+/, ""))}</h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i}>{parseInline(trimmed.replace(/^###\s+/, ""))}</h3>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").map((l) => l.replace(/^\d+\.\s+/, ""));
          return (
            <ol key={i} className="list-decimal pl-6">
              {items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ol>
          );
        }
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((l) => l.replace(/^-\s+/, ""));
          return (
            <ul key={i}>
              {items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        }

        return <p key={i}>{parseInline(trimmed)}</p>;
      })}
    </div>
  );
}
