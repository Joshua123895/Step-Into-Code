import { describe, it, expect } from "vitest";
import { mergeSavedCodes } from "../src/lib/savedCode.js";

describe("saved-code merge on login", () => {
  it("this device's code wins on conflict; cloud fills untouched levels", () => {
    const cloud = {
      python: { 1: "cloud-1", 2: "cloud-2" },
      "data-structures": { 5: "cloud-ds-5" },
    };
    const local = {
      python: { 1: "local-1" }, // conflict on python.1 -> local wins
    };
    const merged = mergeSavedCodes(cloud, local);
    expect(merged.python[1]).toBe("local-1"); // local wins
    expect(merged.python[2]).toBe("cloud-2"); // cloud fills in
    expect(merged["data-structures"][5]).toBe("cloud-ds-5"); // cloud-only track kept
  });

  it("handles empty cloud or empty local", () => {
    expect(mergeSavedCodes({}, { a: { 1: "x" } })).toEqual({ a: { 1: "x" } });
    expect(mergeSavedCodes({ a: { 1: "y" } }, {})).toEqual({ a: { 1: "y" } });
  });
});
