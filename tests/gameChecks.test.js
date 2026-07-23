import { describe, it, expect } from "vitest";
import { validateStructure } from "../src/utils/structureValidator.js";

// The `contains` / `absent` code-pattern checks power game-level goals. They run
// as plain JS regexes and return before any Pyodide load, so they're fast and
// testable in the node test env.
describe("game code-pattern checks", () => {
  it("passes when every required pattern is present", async () => {
    const res = await validateStructure("screen.fill((240, 140, 60))", {
      contains: ["240,\\s*140,\\s*60"],
      failMessage: "nope",
    });
    expect(res.valid).toBe(true);
  });

  it("fails with the friendly message when a required pattern is missing", async () => {
    const res = await validateStructure("screen.fill((90, 160, 230))", {
      contains: ["240,\\s*140,\\s*60"],
      failMessage: "Change the color to sunset orange",
    });
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Change the color to sunset orange");
  });

  it("absent: fails when a banned pattern still appears", async () => {
    const res = await validateStructure("x += 3", {
      absent: ["x\\s*\\+=\\s*3"],
      failMessage: "still there",
    });
    expect(res.valid).toBe(false);
    expect(res.error).toBe("still there");
  });

  it("absent: passes once the banned pattern is gone", async () => {
    const res = await validateStructure("x += 8", { absent: ["x\\s*\\+=\\s*3"] });
    expect(res.valid).toBe(true);
  });

  it("no checks at all is valid", async () => {
    const res = await validateStructure("anything", undefined);
    expect(res.valid).toBe(true);
  });
});
