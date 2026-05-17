import { existsSync } from "fs";
import { join } from "path";
import { getAllArticles, saveArticle } from "@/lib/articles";
import { pipelineConfig } from "@/lib/config";
import { getYouTubeVideos } from "@/lib/youtube";
import {
  getPendingTopics,
  markTopicPublished,
  refillTopicQueue,
} from "./topic-queue";
import { markVideoProcessed, readPipelineState } from "./state";
import {
  buildArticleFromVideo,
  buildArticleFromVideoFallback,
  buildObscureStory,
} from "./story-writer";
import { validateArticleForPublish } from "./validate-story";

export type PipelineResult = {
  ok: boolean;
  published: string[];
  skipped: string[];
  message: string;
};

const hasOpenRouter = () => Boolean(pipelineConfig.openRouterApiKey);

async function publishArticle(article: Awaited<ReturnType<typeof buildArticleFromVideo>>) {
  const validation = validateArticleForPublish(article);
  if (!validation.ok) {
    console.error(`Story rejected (${article.slug}):`, validation.errors.join("; "));
    return false;
  }
  const filePath = join(process.cwd(), "content", "articles", `${article.slug}.json`);
  if (existsSync(filePath)) return false;
  saveArticle(article);
  return true;
}

export async function runStoryPipeline(): Promise<PipelineResult> {
  const published: string[] = [];
  const skipped: string[] = [];
  const existing = getAllArticles();
  const existingSlugs = new Set(existing.map((a) => a.slug));
  const existingVideoIds = new Set(
    existing.map((a) => a.relatedVideoId || a.sourceVideoId).filter(Boolean)
  );
  const usedTitles = existing.map((a) => a.title);
  const state = readPipelineState();
  const budget = pipelineConfig.maxStoriesPerRun;

  if (hasOpenRouter()) {
    await refillTopicQueue(usedTitles, 5);
  }

  // 1) New YouTube documentaries → companion articles
  const videos = await getYouTubeVideos();
  const videoCandidates = videos.filter(
    (v) =>
      v.format === "long" &&
      !state.processedVideoIds.includes(v.id) &&
      !existingVideoIds.has(v.id)
  );

  for (const video of videoCandidates) {
    if (published.length >= budget) break;

    try {
      const article = hasOpenRouter()
        ? await buildArticleFromVideo(video)
        : buildArticleFromVideoFallback(video);

      if (existingSlugs.has(article.slug)) {
        skipped.push(video.id);
        markVideoProcessed(video.id);
        continue;
      }

      if (await publishArticle(article)) {
        published.push(article.slug);
        existingSlugs.add(article.slug);
        markVideoProcessed(video.id);
      } else {
        skipped.push(video.id);
        markVideoProcessed(video.id);
      }
    } catch (err) {
      skipped.push(video.id);
      console.error(`Video article failed ${video.id}:`, err);
    }
  }

  // 2) Obscure history stories (queue + fresh ideas)
  if (hasOpenRouter()) {
    const pending = getPendingTopics();
    const obscureSlots = Math.max(1, budget - published.length);

    for (let i = 0; i < obscureSlots && published.length < budget; i++) {
      const topic = pending[i];
      try {
        const article = await buildObscureStory(
          usedTitles,
          topic?.title
        );

        if (existingSlugs.has(article.slug)) {
          if (topic) markTopicPublished(topic.title);
          continue;
        }

        if (await publishArticle(article)) {
          published.push(article.slug);
          existingSlugs.add(article.slug);
          usedTitles.push(article.title);
          if (topic) markTopicPublished(topic.title);
        }
      } catch (err) {
        console.error("Obscure story failed:", err);
      }
    }
  }

  return {
    ok: true,
    published,
    skipped,
    message:
      published.length > 0
        ? `Published: ${published.join(", ")}. New story URLs appear within ~10 minutes (ISR) without a full rebuild.`
        : hasOpenRouter()
          ? "Nothing new to publish this run."
          : "Set OPENROUTER_API_KEY for AI stories, or waiting on new YouTube videos.",
  };
}
