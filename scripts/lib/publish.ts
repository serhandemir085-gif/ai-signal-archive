import type { Source, Update } from "../../src/lib/types.js";
import type { CandidateUpdate } from "./types.js";
import { slugify } from "./text.js";

function getTrustScore(candidate: CandidateUpdate, sources: Source[]) {
  return Math.max(...sources.map((source) => source.trustScore), candidate.confidence);
}

export function shouldPublish(candidate: CandidateUpdate, corroboratingCount: number, sources: Source[]) {
  const trust = getTrustScore(candidate, sources);
  return (candidate.structured && trust >= 0.9) || (trust >= 0.7 && corroboratingCount >= 2);
}

export function candidateToUpdate(
  candidate: CandidateUpdate,
  sources: Source[],
  corroboratingCount: number
): Update {
  const publishState = shouldPublish(candidate, corroboratingCount, sources) ? "published" : "quarantine";
  const titleSlug = slugify(candidate.title);
  const primaryDate = candidate.occurredAt.slice(0, 10);

  return {
    id: `upd-${primaryDate}-${titleSlug}`,
    slug: `${titleSlug}-${primaryDate.replace(/-/g, "")}`,
    entityIds: candidate.entityIds,
    changeType: candidate.changeType,
    occurredAt: candidate.occurredAt,
    detectedAt: new Date().toISOString(),
    title: candidate.title,
    summary: candidate.summary,
    oldValue: candidate.oldValue,
    newValue: candidate.newValue,
    diff: candidate.diff,
    confidence: candidate.confidence,
    confidenceBadges: candidate.confidenceBadges,
    sourceIds: sources.map((source) => source.id),
    publishState,
    featured: false
  };
}
