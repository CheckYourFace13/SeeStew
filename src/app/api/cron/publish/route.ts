import { NextRequest, NextResponse } from "next/server";
import { pipelineConfig } from "@/lib/config";
import { runStoryPipeline } from "@/lib/pipeline/run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const secret = request.nextUrl.searchParams.get("secret");

  const token = auth?.replace("Bearer ", "") ?? secret ?? "";
  if (!pipelineConfig.cronSecret || token !== pipelineConfig.cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runStoryPipeline();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
