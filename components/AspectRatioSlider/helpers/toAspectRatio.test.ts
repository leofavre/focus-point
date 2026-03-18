import { describe, expect, it } from "vitest";
import { toAspectRatio } from "./toAspectRatio";

describe("toAspectRatio", () => {
  const min = 9 / 16;
  const max = 16 / 9;

  it("returns min when position is 0", () => {
    expect(toAspectRatio(0, min, max)).toBeCloseTo(min, 10);
  });

  it("returns max when position is 1", () => {
    expect(toAspectRatio(1, min, max)).toBeCloseTo(max, 10);
  });

  it("returns geometric mean when position is 0.5", () => {
    const expected = Math.sqrt(min * max);
    const result = toAspectRatio(0.5, min, max);
    expect(result).toBeCloseTo(expected, 10);
  });

  it("handles intermediate positions correctly", () => {
    const position = 0.25;
    const result = toAspectRatio(position, min, max);
    expect(result).toBeGreaterThan(min);
    expect(result).toBeLessThan(max);
  });

  it("is monotonic - larger positions produce larger ratios", () => {
    const ratio1 = toAspectRatio(0.25, min, max);
    const ratio2 = toAspectRatio(0.5, min, max);
    const ratio3 = toAspectRatio(0.75, min, max);
    expect(ratio1).toBeLessThan(ratio2);
    expect(ratio2).toBeLessThan(ratio3);
  });

  it("handles edge case with very small min", () => {
    const verySmallMin = 0.1;
    const result = toAspectRatio(0, verySmallMin, max);
    expect(result).toBeCloseTo(verySmallMin, 10);
  });

  it("handles edge case with very large max", () => {
    const veryLargeMax = 10.0;
    const result = toAspectRatio(1, min, veryLargeMax);
    expect(result).toBeCloseTo(veryLargeMax, 10);
  });
});
