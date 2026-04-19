import { describe, expect, it, vi, afterEach } from "vitest";
import { parseFeed, parsePricingPage } from "../scripts/lib/parsers.js";
import type { Snapshot, Source } from "../src/lib/types.js";

const openAiPricingSource: Source = {
  id: "src-openai-pricing",
  entityId: "org-openai",
  sourceType: "pricing",
  canonicalUrl: "https://openai.com/api/pricing/",
  parserType: "pricing-table",
  trustScore: 0.98,
  pollFrequency: "daily",
  enabled: true
};

const githubSource: Source = {
  id: "src-ollama-releases",
  entityId: "org-ollama",
  sourceType: "github",
  canonicalUrl: "https://github.com/ollama/ollama/releases.atom",
  parserType: "github-releases",
  trustScore: 0.94,
  pollFrequency: "hourly",
  enabled: true
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parsers", () => {
  it("creates a pricing diff from structured fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => `
          <html>
            <body>
              <section>
                <h2>GPT-4.1</h2>
                <p>$3.00 / 1M input tokens</p>
                <p>Batch API gives you 50% savings</p>
              </section>
            </body>
          </html>
        `
      })
    );

    const previousSnapshot: Snapshot = {
      sourceId: "src-openai-pricing",
      fetchedAt: "2026-04-18T07:17:00.000Z",
      checksum: "old",
      extractedFields: {
        "gpt-4-1-input": "$2.50",
        "batch-discount": "25%"
      },
      rawReference: "seed"
    };

    const result = await parsePricingPage({
      source: openAiPricingSource,
      previousSnapshot
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.changeType).toBe("pricing");
    expect(result.candidates[0]?.diff[0]?.new).toBe("$3.00");
  });

  it("creates a release-note candidate from feed movement", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => `
          <feed>
            <entry>
              <title>v0.6.0</title>
              <link href="https://github.com/ollama/ollama/releases/tag/v0.6.0" />
              <updated>2026-04-19T08:00:00Z</updated>
              <summary>New model tags and memory controls</summary>
            </entry>
          </feed>
        `
      })
    );

    const previousSnapshot: Snapshot = {
      sourceId: "src-ollama-releases",
      fetchedAt: "2026-04-18T08:00:00.000Z",
      checksum: "old",
      extractedFields: {
        latestTitle: "v0.5.9",
        latestLink: "https://github.com/ollama/ollama/releases/tag/v0.5.9",
        latestPublished: "2026-04-18T08:00:00Z"
      },
      rawReference: "seed"
    };

    const result = await parseFeed({
      source: githubSource,
      previousSnapshot
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.title).toBe("v0.6.0");
    expect(result.candidates[0]?.changeType).toBe("release-note");
  });
});
