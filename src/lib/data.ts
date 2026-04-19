import comparisons from "../../data/comparisons.json";
import entities from "../../data/entities.json";
import sources from "../../data/sources.json";
import taxonomy from "../../data/taxonomy.json";
import snapshots from "../../data/generated/snapshots.json";
import updates from "../../data/generated/updates.json";
import { compareDesc, formatArchiveParts, isWithinDays, toIsoDay } from "@/lib/date";
import {
  comparisonSchema,
  entitySchema,
  snapshotSchema,
  sourceSchema,
  taxonomySchema,
  updateSchema,
  type Comparison,
  type DataBundle,
  type Entity,
  type Source,
  type Update
} from "@/lib/types";

const bundle: DataBundle = {
  entities: entitySchema.array().parse(entities),
  sources: sourceSchema.array().parse(sources),
  snapshots: snapshotSchema.array().parse(snapshots),
  updates: updateSchema.array().parse(updates).sort((a, b) => compareDesc(a.occurredAt, b.occurredAt)),
  taxonomy: taxonomySchema.parse(taxonomy),
  comparisons: comparisonSchema.array().parse(comparisons)
};

export function getDataBundle() {
  return bundle;
}

export function getReferenceDate() {
  return bundle.updates[0]?.occurredAt ?? new Date().toISOString();
}

export function getTodayUpdates() {
  const day = toIsoDay(getReferenceDate());
  return bundle.updates.filter((item) => toIsoDay(item.occurredAt) === day && item.publishState === "published");
}

export function getWeekUpdates() {
  const reference = getReferenceDate();
  return bundle.updates.filter(
    (item) => item.publishState === "published" && isWithinDays(item.occurredAt, reference, 7)
  );
}

export function getFeaturedUpdates() {
  const featured = bundle.updates.filter((item) => item.featured && item.publishState === "published");
  return featured.length ? featured : bundle.updates.slice(0, 3);
}

export function getEntityBySlug(slug: string) {
  return bundle.entities.find((entity) => entity.slug === slug);
}

export function getEntityById(id: string) {
  return bundle.entities.find((entity) => entity.id === id);
}

export function getSourceById(id: string) {
  return bundle.sources.find((source) => source.id === id);
}

export function getUpdateBySlug(slug: string) {
  return bundle.updates.find((update) => update.slug === slug);
}

export function getUpdatesForEntity(entityId: string) {
  return bundle.updates.filter((update) => update.entityIds.includes(entityId) && update.publishState === "published");
}

export function getUpdatesByChangeType(changeType: Update["changeType"]) {
  return bundle.updates.filter((update) => update.changeType === changeType && update.publishState === "published");
}

export function getArchiveDays() {
  const groups = new Map<string, Update[]>();
  for (const update of bundle.updates.filter((item) => item.publishState === "published")) {
    const day = toIsoDay(update.occurredAt);
    const group = groups.get(day) ?? [];
    group.push(update);
    groups.set(day, group);
  }
  return [...groups.entries()]
    .map(([day, items]) => ({
      day,
      parts: formatArchiveParts(day),
      count: items.length,
      items: items.sort((a, b) => compareDesc(a.occurredAt, b.occurredAt))
    }))
    .sort((a, b) => compareDesc(a.day, b.day));
}

export function getArchiveDay(year: string, month: string, day: string) {
  const key = `${year}-${month}-${day}`;
  return getArchiveDays().find((entry) => entry.day === key);
}

export function getProviderRadar() {
  const reference = getReferenceDate();
  return bundle.entities
    .filter((entity) => entity.kind === "org")
    .map((entity) => {
      const updates = getUpdatesForEntity(entity.id);
      const last7 = updates.filter((update) => isWithinDays(update.occurredAt, reference, 7)).length;
      const last30 = updates.filter((update) => isWithinDays(update.occurredAt, reference, 30)).length;
      return { entity, last7, last30 };
    })
    .filter((entry) => entry.last30 > 0)
    .sort((a, b) => b.last30 - a.last30)
    .slice(0, 8);
}

export function getSourcesForEntity(entityId: string) {
  return bundle.sources.filter((source) => source.entityId === entityId);
}

export function getComparison(slug: string): Comparison | undefined {
  return bundle.comparisons.find((comparison) => comparison.slug === slug);
}

export function getChangeTypeDescription(changeType: Update["changeType"]) {
  const descriptions: Record<Update["changeType"], string> = {
    pricing: "Official price list movements across model and plan surfaces.",
    "model-release": "New model launches, refreshes, and major capability drops.",
    feature: "Feature rollouts, interface changes, and workflow enhancements.",
    policy: "Policy, safety, and usage condition changes with product impact.",
    deprecation: "Sunsets, migration windows, and removed capabilities.",
    availability: "Geography, plan, or platform availability changes.",
    "context-window": "Context-length movements for flagship and assistant models.",
    "rate-limit": "Throughput ceilings, request caps, and queue changes.",
    "release-note": "Notable notes from official changelog and release feeds."
  };

  return descriptions[changeType];
}

export function resolveEntities(entityIds: string[]) {
  return entityIds
    .map((entityId) => getEntityById(entityId))
    .filter((entity): entity is Entity => Boolean(entity));
}

export function resolveSources(sourceIds: string[]) {
  return sourceIds
    .map((sourceId) => getSourceById(sourceId))
    .filter((source): source is Source => Boolean(source));
}
