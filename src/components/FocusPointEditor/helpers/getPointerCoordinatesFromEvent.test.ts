import { describe, expect, it } from "vitest";
import { getPointerCoordinatesFromEvent } from "./getPointerCoordinatesFromEvent";

describe("getPointerCoordinatesFromEvent", () => {
  it("maps clientX and clientY to { x, y }", () => {
    expect(getPointerCoordinatesFromEvent({ clientX: 100, clientY: 200 })).toEqual({
      x: 100,
      y: 200,
    });
    expect(getPointerCoordinatesFromEvent({ clientX: 0, clientY: 0 })).toEqual({
      x: 0,
      y: 0,
    });
  });
});
