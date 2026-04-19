import type { GetStaticPaths } from "astro";
import { getDataBundle } from "@/lib/data";
import { createOgSvg } from "@/lib/og";
import type { Entity } from "@/lib/types";

export const getStaticPaths: GetStaticPaths = async () =>
  getDataBundle().entities.map((entity) => ({
    params: { slug: entity.slug },
    props: { entity }
  }));

export function GET({ props }: { props: { entity: Entity } }) {
  const { entity } = props;
  return new Response(
    createOgSvg({
      eyebrow: entity.kind === "org" ? "Organization tracker" : "Product tracker",
      title: entity.displayName,
      summary: entity.summary,
      footer: `${entity.category.toLowerCase()} / ${entity.cluster.toLowerCase()} / ai changes archive`
    }),
    {
      headers: { "content-type": "image/svg+xml" }
    }
  );
}
