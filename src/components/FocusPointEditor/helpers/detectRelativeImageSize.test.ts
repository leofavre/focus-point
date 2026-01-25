import { describe, expect, it } from "vitest";
import { detectProportionalImageHeight } from "./detectRelativeImageSize";

describe("detectProportionalImageHeight", () => {
  it("returns undefined when aspectRatio is undefined", () => {
    expect(detectProportionalImageHeight({})).toBeUndefined();
    expect(detectProportionalImageHeight({ aspectRatio: undefined })).toBeUndefined();
  });

  it("returns a positive number for valid aspect ratio", () => {
    const result = detectProportionalImageHeight({ aspectRatio: 1 });
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(0);
  });

  it("computes height as percentage of the container's smaller dimension", () => {
    const aspectRatio = 16 / 9;
    const result = detectProportionalImageHeight({ aspectRatio });
    expect(result).toBeCloseTo(47.43, 2);
  });
});
