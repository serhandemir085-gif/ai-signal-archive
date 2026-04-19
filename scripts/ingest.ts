import { resolve } from "node:path";
import { entitySchema, snapshotSchema, sourceSchema, updateSchema, type Snapshot, type Update } from "../src/lib/types.js";
import { readJson, writeJson } from "./lib/io.js";
import { runParser } from "./lib/parsers.js";
import { candidateToUpdate } from "./lib/publish.js";

const root = resolve(process.cwd());

async function loadInputs() {
  const [entities, sources, snapshots, updates] = await Promise.all([
    readJson<unknown[]>(resolve(root, "data/entities.json")),
    readJson<unknown[]>(resolve(root, "data/sources.json")),
    readJson<unknown[]>(resolve(root, "data/generated/snapshots.json")),
    readJson<unknown[]>(resolve(root, "data/generated/updates.json"))
  ]);

  return {
    entities: entitySchema.array().parse(entities),
    sources: sourceSchema.array().parse(sources),
    snapshots: snapshotSchema.array().parse(snapshots),
    updates: updateSchema.array().parse(updates)
  };
}

function signatureFor(update: Pick<Update, "changeType" | "entityIds" | "title">) {
  return `${update.changeType}:${update.entityIds.join(",")}:${update.title.toLowerCase()}`;
}

async function main() {
  const fullMode = process.argv.includes("--full");
  const { entities, sources, snapshots, updates } = await loadInputs();
  const entityIds = new Set(entities.map((entity) => entity.id));
  const nextSnapshots = new Map<string, Snapshot>(snapshots.map((snapshot) => [snapshot.sourceId, snapshot]));
  const nextUpdates = [...updates];
  const candidateBuffer: Array<{ update: Update; signature: string }> = [];

  for (const source of sources.filter((item) => item.enabled)) {
    if (!entityIds.has(source.entityId)) continue;

    try {
      const previousSnapshot = nextSnapshots.get(source.id);
      const result = await runParser({ source, previousSnapshot });
      const existingSnapshot = nextSnapshots.get(source.id);
      if (
        fullMode ||
        !existingSnapshot ||
        existingSnapshot.checksum !== result.snapshot.checksum ||
        JSON.stringify(existingSnapshot.extractedFields) !== JSON.stringify(result.snapshot.extractedFields)
      ) {
        nextSnapshots.set(source.id, result.snapshot);
      }

      for (const candidate of result.candidates) {
        const update = candidateToUpdate(candidate, [source], 1);
        const signature = signatureFor(update);
        const exists = nextUpdates.some(
          (item) => item.slug === update.slug || signatureFor(item) === signature
        );
        if (!exists) {
          candidateBuffer.push({ update, signature });
        }
      }
    } catch (error) {
      console.warn(`[ingest] skipped ${source.id}:`, error instanceof Error ? error.message : error);
    }
  }

  const grouped = new Map<string, Update[]>();
  for (const entry of candidateBuffer) {
    const group = grouped.get(entry.signature) ?? [];
    group.push(entry.update);
    grouped.set(entry.signature, group);
  }

  const published: Update[] = [];
  const quarantine: Update[] = [];
  for (const updatesForSignature of grouped.values()) {
    for (const update of updatesForSignature) {
      if (update.publishState === "published" || updatesForSignature.length > 1) {
        published.push({
          ...update,
          publishState: updatesForSignature.length > 1 ? "published" : update.publishState
        });
      } else {
        quarantine.push(update);
      }
    }
  }

  const mergedUpdates = [...nextUpdates, ...published]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  await Promise.all([
    writeJson(resolve(root, "data/generated/snapshots.json"), [...nextSnapshots.values()]),
    writeJson(resolve(root, "data/generated/updates.json"), mergedUpdates),
    writeJson(resolve(root, "data/generated/quarantine.json"), quarantine)
  ]);

  console.log(
    `[ingest] completed with ${published.length} published updates, ${quarantine.length} quarantined updates, ${nextSnapshots.size} snapshots`
  );
}

main().catch((error) => {
  console.error("[ingest] fatal", error);
  process.exitCode = 1;
});
