import { describe, expect, it } from "vitest";
import { toAspectRatio } from "./toAspectRatio";
import { toLogPosition } from "./toLogPosition";

describe("toLogPosition", () => {
  const min = 9 / 16;
  const max = 16 / 9;

  it("returns 0 when ratio equals min", () => {
    expect(toLogPosition(min, min, max)).toBe(0);
  });

  it("returns 1 when ratio equals max", () => {
    expect(toLogPosition(max, min, max)).toBe(1);
  });

  it("returns 0.5 for the geometric mean of min and max", () => {
    const geometricMean = Math.sqrt(min * max);
    const position = toLogPosition(geometricMean, min, max);
    expect(position).toBeCloseTo(0.5, 10);
  });

  it("handles 1:1 aspect ratio correctly", () => {
    const position = toLogPosition(1.0, min, max);
    expect(position).toBeGreaterThan(0);
    expect(position).toBeLessThan(1);
    // On logarithmic scale, 1.0 is not the midpoint, but should be between min and max
    expect(position).toBeGreaterThan(0.2);
    expect(position).toBeLessThan(0.8);
  });

  it("handles common aspect ratios", () => {
    expect(toLogPosition(16 / 9, min, max)).toBeGreaterThan(0.5);
    expect(toLogPosition(4 / 3, min, max)).toBeGreaterThan(0);
    expect(toLogPosition(3 / 4, min, max)).toBeLessThan(0.5);
  });

  it("is monotonic - larger ratios produce larger positions", () => {
    const pos1 = toLogPosition(0.75, min, max);
    const pos2 = toLogPosition(1.0, min, max);
    const pos3 = toLogPosition(1.5, min, max);
    expect(pos1).toBeLessThan(pos2);
    expect(pos2).toBeLessThan(pos3);
  });

  it("handles edge case with very small min", () => {
    const verySmallMin = 0.1;
    const position = toLogPosition(verySmallMin, verySmallMin, max);
    expect(position).toBe(0);
  });

  it("handles edge case with very large max", () => {
    const veryLargeMax = 10.0;
    const position = toLogPosition(veryLargeMax, min, veryLargeMax);
    expect(position).toBe(1);
  });
});

describe("toLogPosition and toAspectRatio round-trip", () => {
  const min = 9 / 16;
  const max = 16 / 9;

  it("round-trips correctly for min value", () => {
    const original = min;
    const position = toLogPosition(original, min, max);
    const result = toAspectRatio(position, min, max);
    expect(result).toBeCloseTo(original, 10);
  });

  it("round-trips correctly for max value", () => {
    const original = max;
    const position = toLogPosition(original, min, max);
    const result = toAspectRatio(position, min, max);
    expect(result).toBeCloseTo(original, 10);
  });

  it("round-trips correctly for 1:1 aspect ratio", () => {
    const original = 1.0;
    const position = toLogPosition(original, min, max);
    const result = toAspectRatio(position, min, max);
    expect(result).toBeCloseTo(original, 10);
  });

  it("round-trips correctly for common aspect ratios", () => {
    const ratios = [16 / 9, 4 / 3, 3 / 4, 2 / 3, 3 / 2];
    ratios.forEach((ratio) => {
      const position = toLogPosition(ratio, min, max);
      const result = toAspectRatio(position, min, max);
      expect(result).toBeCloseTo(ratio, 10);
    });
  });

  it("round-trips correctly for various positions", () => {
    const positions = [0, 0.25, 0.5, 0.75, 1];
    positions.forEach((position) => {
      const ratio = toAspectRatio(position, min, max);
      const result = toLogPosition(ratio, min, max);
      expect(result).toBeCloseTo(position, 10);
    });
  });
});
