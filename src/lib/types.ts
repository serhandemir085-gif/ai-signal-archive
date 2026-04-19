import { z } from "zod";

export const entityKindSchema = z.enum(["org", "product", "model"]);
export const changeTypeSchema = z.enum([
  "pricing",
  "model-release",
  "feature",
  "policy",
  "deprecation",
  "availability",
  "context-window",
  "rate-limit",
  "release-note"
]);
export const sourceTypeSchema = z.enum([
  "docs",
  "pricing",
  "changelog",
  "status",
  "github",
  "social"
]);
export const parserTypeSchema = z.enum([
  "pricing-table",
  "rss-feed",
  "github-releases",
  "verified-social-feed",
  "seed"
]);
export const publishStateSchema = z.enum(["published", "quarantine"]);
export const confidenceBadgeSchema = z.enum([
  "High Confidence",
  "Official",
  "Verified Social",
  "Auto-Detected",
  "Needs Review"
]);
export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema)
  ])
);

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export const entitySchema = z.object({
  id: z.string(),
  kind: entityKindSchema,
  slug: z.string(),
  displayName: z.string(),
  category: z.string(),
  cluster: z.string(),
  summary: z.string(),
  website: z.url(),
  parentOrg: z.string().nullable().optional(),
  status: z.enum(["tracking", "watching", "seed-only"]),
  featured: z.boolean().default(false),
  tags: z.array(z.string()),
  heroMetric: z
    .object({
      label: z.string(),
      value: z.string()
    })
    .nullable()
    .default(null)
});

export const sourceSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  sourceType: sourceTypeSchema,
  canonicalUrl: z.url(),
  parserType: parserTypeSchema,
  trustScore: z.number().min(0).max(1),
  pollFrequency: z.enum(["hourly", "daily", "weekly"]),
  enabled: z.boolean().default(true),
  notes: z.string().optional()
});

export const snapshotSchema = z.object({
  sourceId: z.string(),
  fetchedAt: z.string(),
  checksum: z.string(),
  extractedFields: z.record(z.string(), jsonValueSchema),
  rawReference: z.string()
});

export const diffItemSchema = z.object({
  label: z.string(),
  old: z.string(),
  new: z.string()
});

export const updateSchema = z.object({
  id: z.string(),
  slug: z.string(),
  entityIds: z.array(z.string()),
  changeType: changeTypeSchema,
  occurredAt: z.string(),
  detectedAt: z.string(),
  title: z.string(),
  summary: z.string(),
  oldValue: jsonValueSchema.nullable(),
  newValue: jsonValueSchema.nullable(),
  diff: z.array(diffItemSchema).default([]),
  confidence: z.number().min(0).max(1),
  confidenceBadges: z.array(confidenceBadgeSchema).default([]),
  sourceIds: z.array(z.string()),
  publishState: publishStateSchema,
  featured: z.boolean().default(false)
});

export const taxonomySchema = z.object({
  categories: z.array(z.string()),
  clusters: z.array(z.string()),
  changeTypes: z.array(changeTypeSchema),
  trustBadges: z.array(confidenceBadgeSchema)
});

export const comparisonRowSchema = z.object({
  label: z.string(),
  values: z.record(z.string(), z.string()),
  notes: z.string().optional()
});

export const comparisonSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  entities: z.array(z.string()),
  dimensions: z.array(
    z.object({
      slug: z.string(),
      label: z.string(),
      summary: z.string(),
      rows: z.array(comparisonRowSchema)
    })
  )
});

export type Entity = z.infer<typeof entitySchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export type Update = z.infer<typeof updateSchema>;
export type Taxonomy = z.infer<typeof taxonomySchema>;
export type Comparison = z.infer<typeof comparisonSchema>;

export interface DataBundle {
  entities: Entity[];
  sources: Source[];
  snapshots: Snapshot[];
  updates: Update[];
  taxonomy: Taxonomy;
  comparisons: Comparison[];
}
