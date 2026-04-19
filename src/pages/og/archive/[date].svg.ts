import type { GetStaticPaths } from "astro";
import { getArchiveDays } from "@/lib/data";
import { createOgSvg } from "@/lib/og";

type ArchiveDay = ReturnType<typeof getArchiveDays>[number];

export const getStaticPaths: GetStaticPaths = async () =>
  getArchiveDays().map((day) => ({
    params: { date: day.day },
    props: { day }
  }));

export function GET({ props }: { props: { day: ArchiveDay } }) {
  const { day } = props;
  return new Response(
    createOgSvg({
      eyebrow: "Archive day",
      title: day.day,
      summary: `${day.count} published changes grouped into one source-linked daily archive page.`,
      footer: "daily archive / source-linked / structured diffs"
    }),
    {
      headers: { "content-type": "image/svg+xml" }
    }
  );
}
