import type { GetStaticPaths } from "astro";
import { getDataBundle, getChangeTypeDescription } from "@/lib/data";
import { createOgSvg } from "@/lib/og";
import type { Update } from "@/lib/types";

export const getStaticPaths: GetStaticPaths = async () =>
  getDataBundle().taxonomy.changeTypes.map((slug) => ({
    params: { slug },
    props: { slug }
  }));

export function GET({ props }: { props: { slug: Update["changeType"] } }) {
  const { slug } = props;
  return new Response(
    createOgSvg({
      eyebrow: "Change hub",
      title: slug.replace("-", " "),
      summary: getChangeTypeDescription(slug),
      footer: "pricing / releases / policy / availability"
    }),
    {
      headers: { "content-type": "image/svg+xml" }
    }
  );
}
