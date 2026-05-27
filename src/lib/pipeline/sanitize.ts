const AI_PHRASES = [
  /\bdelve\b/gi,
  /\btapestry\b/gi,
  /\blandscape of\b/gi,
  /\bpivotal\b/gi,
  /\btestament to\b/gi,
  /\bfostering\b/gi,
  /\bunderscores\b/gi,
  /\bit's worth noting\b/gi,
  /\bin conclusion\b/gi,
  /\brich history\b/gi,
  /\bever-evolving\b/gi,
  /\bcontinues to captivate\b/gi,
  /\bgroundbreaking\b/gi,
  /\bgame-changer\b/gi,
  /\bunlock the\b/gi,
  /\bharness the power\b/gi,
  /\bas an ai\b/gi,
  /\blanguage model\b/gi,
  /\bchatgpt\b/gi,
];

export function stripAiPhrases(text: string): string {
  let out = text;
  for (const re of AI_PHRASES) {
    out = out.replace(re, "");
  }
  return out.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
