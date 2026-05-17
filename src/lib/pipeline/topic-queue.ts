import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { chatCompletion } from "./openrouter";
import { topicDiscoveryPrompt, WRITER_SYSTEM } from "./prompts";

export type QueuedTopic = {
  title: string;
  hook: string;
  era: string;
  status: "pending" | "published";
};

type QueueFile = { topics: QueuedTopic[] };

const QUEUE_PATH = join(process.cwd(), "content", "story-queue.json");

export function readTopicQueue(): QueueFile {
  if (!existsSync(QUEUE_PATH)) return { topics: [] };
  return JSON.parse(readFileSync(QUEUE_PATH, "utf-8")) as QueueFile;
}

export function writeTopicQueue(queue: QueueFile): void {
  mkdirSync(join(process.cwd(), "content"), { recursive: true });
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), "utf-8");
}

export function getPendingTopics(): QueuedTopic[] {
  return readTopicQueue().topics.filter((t) => t.status === "pending");
}

export function markTopicPublished(title: string): void {
  const queue = readTopicQueue();
  const item = queue.topics.find((t) => t.title === title);
  if (item) item.status = "published";
  writeTopicQueue(queue);
}

export async function refillTopicQueue(
  usedTitles: string[],
  targetPending = 5
): Promise<void> {
  const queue = readTopicQueue();
  const pending = queue.topics.filter((t) => t.status === "pending").length;
  if (pending >= targetPending) return;

  const need = targetPending - pending;
  const raw = await chatCompletion(
    [
      { role: "system", content: WRITER_SYSTEM },
      {
        role: "user",
        content: topicDiscoveryPrompt(need + 2, usedTitles),
      },
    ],
    { maxTokens: 2000, temperature: 0.8 }
  );

  const parsed = JSON.parse(raw) as {
    topics?: Array<{ title: string; hook: string; era: string }>;
  };

  for (const t of parsed.topics ?? []) {
    if (!t.title || queue.topics.some((q) => q.title === t.title)) continue;
    queue.topics.push({
      title: t.title,
      hook: t.hook ?? "",
      era: t.era ?? "",
      status: "pending",
    });
  }

  writeTopicQueue(queue);
}
