import { describe, expect, it } from "vitest";
import { scaleDimensionsToContainRect } from "./scaleDimensionToContainRect";

describe("scaleDimensionsToContainRect", () => {
  it("scales source to contain rect, preserving aspect ratio (same height)", () => {
    const source = { width: 800, height: 600 };
    const rect = { width: 400, height: 400 };
    const result = scaleDimensionsToContainRect({ source, rect });
    expect(result.height).toBe(400);
    expect(result.width).toBeCloseTo(533.33, 2);
  });

  it("scales source to contain rect, preserving aspect ratio (same width)", () => {
    const source = { width: 400, height: 400 };
    const rect = { width: 800, height: 600 };
    const result = scaleDimensionsToContainRect({ source, rect });
    expect(result.width).toBe(800);
    expect(result.height).toBe(800);
  });

  it("handles zero source height (avoids dividing by zero)", () => {
    const source = { width: 100, height: 0 };
    const rect = { width: 50, height: 50 };
    const result = scaleDimensionsToContainRect({ source, rect });
    expect(result.width).toBe(0);
    expect(result.height).toBe(50);
  });

  it("handles zero source width (avoids dividing by zero)", () => {
    const source = { width: 0, height: 100 };
    const rect = { width: 50, height: 50 };
    const result = scaleDimensionsToContainRect({ source, rect });
    expect(result.width).toBe(50);
    expect(result.height).toBe(0);
  });
});
