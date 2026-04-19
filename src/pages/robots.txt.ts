import { getSiteUrl } from "@/lib/site";

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /search/\n\nSitemap: ${getSiteUrl("/sitemap-index.xml")}\n`,
    {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    }
  );
}
