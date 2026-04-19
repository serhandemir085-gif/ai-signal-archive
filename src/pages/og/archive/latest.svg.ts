import { createOgSvg } from "@/lib/og";

export function GET() {
  return new Response(
    createOgSvg({
      eyebrow: "Daily archive",
      title: "Latest signal window",
      summary: "The freshest archived slice of AI product motion, grouped for fast scanning and comparison.",
      footer: "archive / daily timeline / premium editorial UI"
    }),
    {
      headers: { "content-type": "image/svg+xml" }
    }
  );
}
