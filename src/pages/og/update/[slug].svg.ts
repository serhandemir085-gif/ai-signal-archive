import type { GetStaticPaths } from "astro";
import { getDataBundle } from "@/lib/data";
import { createOgSvg } from "@/lib/og";
import type { Update } from "@/lib/types";

export const getStaticPaths: GetStaticPaths = async () =>
  getDataBundle().updates.map((update) => ({
    params: { slug: update.slug },
    props: { update }
  }));

export function GET({ props }: { props: { update: Update } }) {
  const { update } = props;
  return new Response(
    createOgSvg({
      eyebrow: update.changeType.replace("-", " "),
      title: update.title,
      summary: update.summary,
      footer: `${Math.round(update.confidence * 100)}% confidence / ${update.sourceIds.length} sources`
    }),
    {
      headers: { "content-type": "image/svg+xml" }
    }
  );
}
