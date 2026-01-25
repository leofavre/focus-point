import { describe, expect, it } from "vitest";
import { cssObjectPositionStringToObject } from "./cssObjectPositionStringToObject";

describe("cssObjectPositionStringToObject", () => {
  it("parses 'x% y%' into { x, y }", () => {
    expect(cssObjectPositionStringToObject("50% 50%")).toEqual({ x: 50, y: 50 });
    expect(cssObjectPositionStringToObject("0% 0%")).toEqual({ x: 0, y: 0 });
    expect(cssObjectPositionStringToObject("100% 100%")).toEqual({ x: 100, y: 100 });
  });

  it("strips '%' and returns numbers", () => {
    const result = cssObjectPositionStringToObject("25.35% 75.65%");
    expect(result).toEqual({ x: 25.35, y: 75.65 });
    expect(typeof result.x).toBe("number");
    expect(typeof result.y).toBe("number");
  });
});
