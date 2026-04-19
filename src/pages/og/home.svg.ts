import { createOgSvg } from "@/lib/og";

export function GET() {
  return new Response(
    createOgSvg({
      eyebrow: "AI Signal Archive",
      title: "Track AI changes",
      summary: "Pricing moves, releases, features, and policy shifts archived with source-linked trust signals.",
      footer: "search-first archive / official-source bias / static-first build"
    }),
    {
      headers: {
        "content-type": "image/svg+xml"
      }
    }
  );
}
