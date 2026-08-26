import { llmsTxt } from "@/lib/agent-content";
import { siteUrl } from "@/lib/site";

export async function GET() {
  return new Response(llmsTxt(siteUrl()), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
