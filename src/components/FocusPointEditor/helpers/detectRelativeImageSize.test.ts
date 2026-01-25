import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectProportionalImageHeight } from "./detectRelativeImageSize";

describe("detectProportionalImageHeight", () => {
  const originalClientHeight = Object.getOwnPropertyDescriptor(
    document.documentElement,
    "clientHeight",
  );

  beforeEach(() => {
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalClientHeight) {
      Object.defineProperty(document.documentElement, "clientHeight", originalClientHeight);
    }
  });

  it("returns undefined when aspectRatio is undefined", () => {
    expect(detectProportionalImageHeight({})).toBeUndefined();
    expect(detectProportionalImageHeight({ aspectRatio: undefined })).toBeUndefined();
  });

  it("computes height as percentage of viewport from area ratio and aspect ratio", () => {
    const aspectRatio = 16 / 9;
    const result = detectProportionalImageHeight({ aspectRatio });
    expect(result).toBeCloseTo(47.43, 2);
  });

  it("returns a positive number for valid aspect ratio", () => {
    const result = detectProportionalImageHeight({ aspectRatio: 1 });
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(0);
  });
});
