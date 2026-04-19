import * as cheerio from "cheerio";
import type { Snapshot } from "../../src/lib/types.js";
import type { CandidateUpdate, ParserContext, ParserResult } from "./types.js";
import { checksum } from "./hash.js";
import { fetchText } from "./fetch.js";
import { stripTags, truncate } from "./text.js";

type PricingMatcher = {
  key: string;
  label: string;
  pattern: RegExp;
};

const pricingMatchers: Record<string, PricingMatcher[]> = {
  "src-openai-pricing": [
    {
      key: "gpt-4-1-input",
      label: "GPT-4.1 input / 1M tokens",
      pattern: /GPT-4\.1[\s\S]{0,400}?\$([0-9]+(?:\.[0-9]+)?)\s*\/\s*1M/i
    },
    {
      key: "batch-discount",
      label: "Batch discount",
      pattern: /Batch API[\s\S]{0,200}?([0-9]{1,3}%)/i
    }
  ],
  "src-anthropic-pricing": [
    {
      key: "claude-3-7-sonnet-input",
      label: "Claude 3.7 Sonnet input / 1M tokens",
      pattern: /Claude(?:\s+3\.7)?\s+Sonnet[\s\S]{0,500}?\$([0-9]+(?:\.[0-9]+)?)\s*\/\s*MTok/i
    },
    {
      key: "context-window",
      label: "Context window",
      pattern: /(200K)/i
    }
  ]
};

function buildSnapshot(sourceId: string, fetchedAt: string, rawReference: string, extractedFields: Record<string, string>) {
  return {
    sourceId,
    fetchedAt,
    checksum: checksum(JSON.stringify(extractedFields)),
    extractedFields,
    rawReference
  } satisfies Snapshot;
}

function buildPricingCandidates(context: ParserContext, snapshot: Snapshot): CandidateUpdate[] {
  if (!context.previousSnapshot) return [];

  const candidates: CandidateUpdate[] = [];
  const previous = context.previousSnapshot.extractedFields;
  const current = snapshot.extractedFields;
  const diff = Object.entries(current)
    .filter(([key, value]) => previous[key] && previous[key] !== value)
    .map(([key, value]) => ({
      label: key,
      old: String(previous[key]),
      new: String(value)
    }));

  if (!diff.length) return [];

  candidates.push({
    sourceId: context.source.id,
    entityIds: [context.source.entityId],
    changeType: diff.some((item) => item.label.includes("context")) ? "context-window" : "pricing",
    occurredAt: snapshot.fetchedAt,
    title: `${context.source.entityId.replace(/^org-/, "").replace(/-/g, " ")} pricing surface changed`,
    summary: "Structured fields on the official pricing surface changed between snapshots.",
    oldValue: previous,
    newValue: current,
    diff,
    confidence: context.source.trustScore,
    confidenceBadges: ["Official", "Auto-Detected", "High Confidence"],
    structured: true
  });

  return candidates;
}

export async function parsePricingPage(context: ParserContext): Promise<ParserResult> {
  const html = await fetchText(context.source.canonicalUrl);
  const matchers = pricingMatchers[context.source.id] ?? [];
  const extractedFields = Object.fromEntries(
    matchers
      .map((matcher) => {
        const match = html.match(matcher.pattern);
        if (!match) return null;
        const value =
          (matcher.key.includes("input") || matcher.key.includes("output")) && !match[1].startsWith("$")
            ? `$${match[1]}`
            : match[1];
        return [matcher.key, value];
      })
      .filter((entry): entry is [string, string] => Boolean(entry))
  );

  const snapshot = buildSnapshot(context.source.id, new Date().toISOString(), context.source.canonicalUrl, extractedFields);
  return {
    snapshot,
    candidates: buildPricingCandidates(context, snapshot)
  };
}

function extractFeedEntries(xml: string) {
  const $ = cheerio.load(xml, { xmlMode: true });
  const atomEntries = $("entry")
    .slice(0, 4)
    .toArray()
    .map((entry) => {
      const node = $(entry);
      const title = stripTags(node.find("title").first().text());
      const summary = stripTags(node.find("summary, content").first().text());
      const link = node.find("link").first().attr("href") ?? "";
      const published = node.find("updated, published").first().text();
      return { title, summary, link, published };
    });

  if (atomEntries.length) return atomEntries;

  return $("item")
    .slice(0, 4)
    .toArray()
    .map((item) => {
      const node = $(item);
      return {
        title: stripTags(node.find("title").first().text()),
        summary: stripTags(node.find("description").first().text()),
        link: node.find("link").first().text(),
        published: node.find("pubDate").first().text()
      };
    });
}

function buildFeedCandidate(context: ParserContext, latest: { title: string; summary: string; link: string; published: string }) {
  return {
    sourceId: context.source.id,
    entityIds: [context.source.entityId],
    changeType: context.source.sourceType === "github" ? "release-note" : "feature",
    occurredAt: latest.published ? new Date(latest.published).toISOString() : new Date().toISOString(),
    title: latest.title,
    summary: truncate(latest.summary || "Official feed item detected from an allowlisted source.", 200),
    oldValue: context.previousSnapshot?.extractedFields ?? null,
    newValue: { latestTitle: latest.title, latestLink: latest.link },
    diff: context.previousSnapshot
      ? [
          {
            label: "Latest feed item",
            old: String(context.previousSnapshot.extractedFields.latestTitle ?? "none"),
            new: latest.title
          }
        ]
      : [],
    confidence: context.source.trustScore,
    confidenceBadges:
      context.source.sourceType === "github"
        ? ["Official", "Auto-Detected", "High Confidence"]
        : ["Official", "Auto-Detected"],
    structured: false
  } satisfies CandidateUpdate;
}

export async function parseFeed(context: ParserContext): Promise<ParserResult> {
  const xml = await fetchText(context.source.canonicalUrl);
  const entries = extractFeedEntries(xml);
  const latest = entries[0];
  const extractedFields: Record<string, string> = latest
    ? {
        latestTitle: latest.title,
        latestLink: latest.link,
        latestPublished: latest.published
      }
    : {};

  const snapshot = buildSnapshot(context.source.id, new Date().toISOString(), context.source.canonicalUrl, extractedFields);
  const changed =
    latest &&
    (!context.previousSnapshot ||
      context.previousSnapshot.extractedFields.latestLink !== latest.link ||
      context.previousSnapshot.extractedFields.latestTitle !== latest.title);

  return {
    snapshot,
    candidates: latest && changed ? [buildFeedCandidate(context, latest)] : []
  };
}

export async function runParser(context: ParserContext): Promise<ParserResult> {
  switch (context.source.parserType) {
    case "pricing-table":
      return parsePricingPage(context);
    case "rss-feed":
    case "github-releases":
      return parseFeed(context);
    default:
      return {
        snapshot:
          context.previousSnapshot ??
          buildSnapshot(context.source.id, new Date().toISOString(), context.source.canonicalUrl, {}),
        candidates: []
      };
  }
}
