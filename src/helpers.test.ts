import { describe, expect, it, vi } from "vitest";
import {
  clamp,
  createKeyboardShortcutHandler,
  roundWithTwoDecimals,
  toPercentage,
} from "./helpers";

describe("clamp", () => {
  it("returns value when within min and max", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("returns min when value is below min", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(-100, 5, 10)).toBe(5);
  });

  it("returns max when value is above max", () => {
    expect(clamp(11, 0, 10)).toBe(10);
    expect(clamp(100, 0, 10)).toBe(10);
  });
});

describe("roundWithTwoDecimals", () => {
  it("rounds to two decimal places", () => {
    expect(roundWithTwoDecimals(1.234)).toBe(1.23);
    expect(roundWithTwoDecimals(1.235)).toBe(1.24);
    expect(roundWithTwoDecimals(1.999)).toBe(2);
  });

  it("handles integers", () => {
    expect(roundWithTwoDecimals(5)).toBe(5);
  });

  it("avoids floating-point drift", () => {
    expect(roundWithTwoDecimals(0.1 + 0.2)).toBe(0.3);
  });
});

describe("toPercentage", () => {
  it("computes (a / b) * 100 correctly", () => {
    expect(toPercentage(1, 4)).toBe(25);
    expect(toPercentage(50, 200)).toBe(25);
    expect(toPercentage(0, 100)).toBe(0);
    expect(toPercentage(100, 100)).toBe(100);
    expect(toPercentage(4, 7)).toBeCloseTo(57.14, 2);
  });

  it("returns 0 when b is 0", () => {
    expect(toPercentage(1, 0)).toBe(0);
    expect(toPercentage(50, 0)).toBe(0);
  });

  it("returns 0 when b is negative", () => {
    expect(toPercentage(1, -1)).toBe(0);
  });
});

describe("createKeyboardShortcutHandler", () => {
  it("calls callback when matching key is pressed (lowercase)", () => {
    const callback = vi.fn();
    const handler = createKeyboardShortcutHandler({ u: callback });

    const preventDefault = vi.fn();
    const event = { key: "u", preventDefault } as unknown as KeyboardEvent;
    handler(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("calls callback when matching key is pressed (uppercase)", () => {
    const callback = vi.fn();
    const handler = createKeyboardShortcutHandler({ u: callback });

    const preventDefault = vi.fn();
    const event = { key: "U", preventDefault } as unknown as KeyboardEvent;
    handler(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("does not call callback when key does not match", () => {
    const callback = vi.fn();
    const handler = createKeyboardShortcutHandler({ u: callback });

    const preventDefault = vi.fn();
    const event = { key: "x", preventDefault } as unknown as KeyboardEvent;
    handler(event);

    expect(callback).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("handles multiple keys mapping to the same callback", () => {
    const callback = vi.fn();
    const handler = createKeyboardShortcutHandler({
      c: callback,
      d: callback,
    });

    const preventDefault1 = vi.fn();
    const event1 = { key: "c", preventDefault: preventDefault1 } as unknown as KeyboardEvent;
    handler(event1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(preventDefault1).toHaveBeenCalledTimes(1);

    const preventDefault2 = vi.fn();
    const event2 = { key: "D", preventDefault: preventDefault2 } as unknown as KeyboardEvent;
    handler(event2);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(preventDefault2).toHaveBeenCalledTimes(1);
  });

  it("handles multiple different callbacks", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const handler = createKeyboardShortcutHandler({
      a: callback1,
      b: callback2,
    });

    const preventDefault1 = vi.fn();
    const event1 = { key: "a", preventDefault: preventDefault1 } as unknown as KeyboardEvent;
    handler(event1);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
    expect(preventDefault1).toHaveBeenCalledTimes(1);

    const preventDefault2 = vi.fn();
    const event2 = { key: "B", preventDefault: preventDefault2 } as unknown as KeyboardEvent;
    handler(event2);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(preventDefault2).toHaveBeenCalledTimes(1);
  });

  it("is case-insensitive for key map entries", () => {
    const callback = vi.fn();
    const handler = createKeyboardShortcutHandler({ U: callback });

    const preventDefault = vi.fn();
    const event = { key: "u", preventDefault } as unknown as KeyboardEvent;
    handler(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
