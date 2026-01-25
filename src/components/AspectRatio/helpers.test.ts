import { describe, expect, it } from "vitest";
import { ASPECT_RATIO_PRECISION } from "./constants";
import { toAspectRatio, toPreciseAspectRatio } from "./helpers";

describe("toPreciseAspectRatio", () => {
  it("scales aspect ratio by precision and rounds to integer", () => {
    expect(toPreciseAspectRatio(1)).toBe(ASPECT_RATIO_PRECISION);
    expect(toPreciseAspectRatio(16 / 9)).toBe(Math.round((16 / 9) * ASPECT_RATIO_PRECISION));
  });

  it("rounds fractional results", () => {
    const precise = toPreciseAspectRatio(4 / 3);
    expect(Number.isInteger(precise)).toBe(true);
  });
});

describe("toAspectRatio", () => {
  it("converts precise value back to decimal aspect ratio", () => {
    expect(toAspectRatio(ASPECT_RATIO_PRECISION)).toBe(1);
    expect(toAspectRatio(0)).toBe(0);
  });

  it("round-trips with toPreciseAspectRatio", () => {
    const ratio = 16 / 9;
    expect(toAspectRatio(toPreciseAspectRatio(ratio))).toBeCloseTo(ratio, 4);
  });
});
