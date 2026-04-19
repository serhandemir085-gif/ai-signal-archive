import { describe, expect, it } from "vitest";
import { candidateToUpdate, shouldPublish } from "../scripts/lib/publish.js";
import type { CandidateUpdate } from "../scripts/lib/types.js";
import type { Source } from "../src/lib/types.js";

const officialSource: Source = {
  id: "src-openai-pricing",
  entityId: "org-openai",
  sourceType: "pricing",
  canonicalUrl: "https://openai.com/api/pricing/",
  parserType: "pricing-table",
  trustScore: 0.98,
  pollFrequency: "daily",
  enabled: true
};

describe("publish rules", () => {
  it("publishes structured high-trust candidates", () => {
    const candidate: CandidateUpdate = {
      sourceId: officialSource.id,
      entityIds: ["org-openai"],
      changeType: "pricing",
      occurredAt: "2026-04-19T09:00:00.000Z",
      title: "Pricing surface changed",
      summary: "Structured pricing change.",
      oldValue: { price: "$2.50" },
      newValue: { price: "$3.00" },
      diff: [{ label: "Price", old: "$2.50", new: "$3.00" }],
      confidence: 0.98,
      confidenceBadges: ["Official", "High Confidence", "Auto-Detected"],
      structured: true
    };

    expect(shouldPublish(candidate, 1, [officialSource])).toBe(true);
    expect(candidateToUpdate(candidate, [officialSource], 1).publishState).toBe("published");
  });

  it("quarantines lower-trust single-source candidates", () => {
    const source = { ...officialSource, trustScore: 0.72 };
    const candidate: CandidateUpdate = {
      sourceId: source.id,
      entityIds: ["org-openai"],
      changeType: "feature",
      occurredAt: "2026-04-19T09:00:00.000Z",
      title: "UI copy changed",
      summary: "Unverified single-source change.",
      oldValue: null,
      newValue: null,
      diff: [],
      confidence: 0.72,
      confidenceBadges: ["Needs Review"],
      structured: false
    };

    expect(shouldPublish(candidate, 1, [source])).toBe(false);
    expect(candidateToUpdate(candidate, [source], 1).publishState).toBe("quarantine");
  });
});
