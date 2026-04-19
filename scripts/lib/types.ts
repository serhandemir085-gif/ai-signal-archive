import type { JsonValue, Snapshot, Source, Update } from "../../src/lib/types.js";

export interface CandidateUpdate {
  sourceId: string;
  entityIds: string[];
  changeType: Update["changeType"];
  occurredAt: string;
  title: string;
  summary: string;
  oldValue: JsonValue | null;
  newValue: JsonValue | null;
  diff: Update["diff"];
  confidence: number;
  confidenceBadges: Update["confidenceBadges"];
  structured: boolean;
}

export interface ParserContext {
  source: Source;
  previousSnapshot?: Snapshot;
}

export interface ParserResult {
  snapshot: Snapshot;
  candidates: CandidateUpdate[];
}
