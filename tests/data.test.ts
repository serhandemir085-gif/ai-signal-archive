import { describe, expect, it } from "vitest";
import { getArchiveDays, getDataBundle, getFeaturedUpdates, getProviderRadar } from "../src/lib/data.js";

describe("data bundle", () => {
  it("loads the seeded entities and updates", () => {
    const bundle = getDataBundle();
    expect(bundle.entities.length).toBeGreaterThanOrEqual(28);
    expect(bundle.updates.length).toBeGreaterThan(0);
  });

  it("derives archive days and provider radar entries", () => {
    expect(getArchiveDays().length).toBeGreaterThan(0);
    expect(getProviderRadar().length).toBeGreaterThan(0);
    expect(getFeaturedUpdates().length).toBeGreaterThan(0);
  });
});
