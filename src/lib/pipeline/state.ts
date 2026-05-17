import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

type PipelineState = {
  processedVideoIds: string[];
  lastRun: string | null;
};

const STATE_PATH = join(process.cwd(), "content", "pipeline-state.json");

export function readPipelineState(): PipelineState {
  if (!existsSync(STATE_PATH)) {
    return { processedVideoIds: [], lastRun: null };
  }
  return JSON.parse(readFileSync(STATE_PATH, "utf-8")) as PipelineState;
}

export function writePipelineState(state: PipelineState): void {
  mkdirSync(join(process.cwd(), "content"), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

export function markVideoProcessed(videoId: string): void {
  const state = readPipelineState();
  if (!state.processedVideoIds.includes(videoId)) {
    state.processedVideoIds.push(videoId);
  }
  state.lastRun = new Date().toISOString();
  writePipelineState(state);
}
