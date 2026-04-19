import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getDataBundle } from "@/lib/data";
import { siteConfig } from "@/lib/site";

export async function GET(context: APIContext) {
  const { updates } = getDataBundle();

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site ?? siteConfig.defaultUrl,
    items: updates.slice(0, 30).map((update) => ({
      title: update.title,
      description: update.summary,
      link: `/updates/${update.slug}/`,
      pubDate: new Date(update.occurredAt)
    }))
  });
}
