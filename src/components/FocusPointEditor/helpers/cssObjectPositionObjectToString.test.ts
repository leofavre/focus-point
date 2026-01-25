import { describe, expect, it } from "vitest";
import { cssObjectPositionObjectToString } from "./cssObjectPositionObjectToString";

describe("cssObjectPositionObjectToString", () => {
  it("formats x and y as 'x% y%'", () => {
    expect(cssObjectPositionObjectToString({ x: 50, y: 50 })).toBe("50% 50%");
    expect(cssObjectPositionObjectToString({ x: 0, y: 0 })).toBe("0% 0%");
    expect(cssObjectPositionObjectToString({ x: 100, y: 100 })).toBe("100% 100%");
  });

  it("clamps values to 0-100", () => {
    expect(cssObjectPositionObjectToString({ x: -10, y: 50 })).toBe("0% 50%");
    expect(cssObjectPositionObjectToString({ x: 50, y: 150 })).toBe("50% 100%");
  });

  it("rounds to two decimals", () => {
    expect(cssObjectPositionObjectToString({ x: 33.333, y: 66.666 })).toBe("33.33% 66.67%");
  });

  it("rounds to two decimals with padding", () => {
    expect(cssObjectPositionObjectToString({ x: 33.3, y: 66.6 })).toBe("33.30% 66.60%");
  });
});
