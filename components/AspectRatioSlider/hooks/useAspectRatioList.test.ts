import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAspectRatioList } from "./useAspectRatioList";

describe("useAspectRatioList", () => {
  it("returns base preset list when originalAspectRatioValue is undefined", () => {
    const { result } = renderHook(() => useAspectRatioList());

    const list = result.current;
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((r) => r.name !== "original")).toBe(true);
    expect(list).toEqual([...list].sort((a, b) => a.value - b.value));
    for (const item of list) {
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("value");
      expect(item).toHaveProperty("position");
    }
  });

  it("returns base preset list when originalAspectRatioValue is null (falsy)", () => {
    const { result } = renderHook(() => useAspectRatioList(undefined));

    expect(result.current.some((r) => r.name === "original")).toBe(false);
  });

  it("includes exactly one 'original' entry when originalAspectRatioValue is provided", () => {
    const originalValue = 1.5;
    const { result } = renderHook(() => useAspectRatioList(originalValue));

    const originals = result.current.filter((r) => r.name === "original");
    expect(originals).toHaveLength(1);
    expect(originals[0].value).toBe(originalValue);
    expect(originals[0]).toHaveProperty("position");
  });

  it("returns list sorted by value ascending", () => {
    const { result } = renderHook(() => useAspectRatioList(7 / 5));

    const list = result.current;
    for (let i = 1; i < list.length; i++) {
      expect(list[i].value).toBeGreaterThanOrEqual(list[i - 1].value);
    }
  });

  it("every entry has name, value, and position", () => {
    const { result } = renderHook(() => useAspectRatioList(16 / 9));

    for (const item of result.current) {
      expect(typeof item.name).toBe("string");
      expect(typeof item.value).toBe("number");
      expect(typeof item.position).toBe("number");
    }
  });

  it("filters out preset ratio when it is within threshold of original (avoids duplicate ticks)", () => {
    // 1:1 preset has value 1. Passing original 1.0 should filter out the "1:1" preset
    // but keep the "original" entry (POSITION_REPLACEMENT_THRESHOLD = 1/50 = 0.02).
    const { result } = renderHook(() => useAspectRatioList(1));

    const list = result.current;
    const entriesWithValueOne = list.filter((r) => Math.abs(r.value - 1) < 0.02);
    // Only "original" should remain, not also preset "1:1"
    expect(entriesWithValueOne).toHaveLength(1);
    expect(entriesWithValueOne[0].name).toBe("original");
  });

  it("keeps presets that are sufficiently far from original", () => {
    const { result } = renderHook(() => useAspectRatioList(1.5));

    const list = result.current;
    // 3:2 = 1.5 is within threshold of 1.5, so only "original" for that value
    const nearOnePointFive = list.filter((r) => Math.abs(r.value - 1.5) < 0.02);
    expect(nearOnePointFive).toHaveLength(1);
    expect(nearOnePointFive[0].name).toBe("original");

    // 1:1 = 1.0 is far from 1.5, so preset "1:1" should still be in the list
    const oneToOne = list.find((r) => r.name === "1:1");
    expect(oneToOne).toBeDefined();
    expect(oneToOne?.value).toBe(1);
  });

  it("handles original aspect ratio outside preset range (e.g. very portrait)", () => {
    const veryPortrait = 9 / 20; // 0.45, narrower than 9:16 (0.5625)
    const { result } = renderHook(() => useAspectRatioList(veryPortrait));

    const list = result.current;
    const original = list.find((r) => r.name === "original");
    expect(original).toBeDefined();
    expect(original?.value).toBe(veryPortrait);
    expect(list[0].value).toBe(veryPortrait);
  });

  it("handles original aspect ratio outside preset range (e.g. very landscape)", () => {
    const veryLandscape = 2; // 2:1, wider than 16:9
    const { result } = renderHook(() => useAspectRatioList(veryLandscape));

    const list = result.current;
    const original = list.find((r) => r.name === "original");
    expect(original).toBeDefined();
    expect(original?.value).toBe(veryLandscape);
    expect(list[list.length - 1].value).toBe(veryLandscape);
  });

  it("when originalAspectRatio is less than 9:16, includes original and places it at the minimum (portrait) end", () => {
    const nineSixteenths = 9 / 16;
    const lessThanNineSixteen = nineSixteenths - 0.1;
    const { result } = renderHook(() => useAspectRatioList(lessThanNineSixteen));

    const list = result.current;
    const original = list.find((r) => r.name === "original");
    expect(original).toBeDefined();
    expect(original?.value).toBe(lessThanNineSixteen);
    expect(lessThanNineSixteen).toBeLessThan(nineSixteenths);
    expect(list[0].value).toBe(lessThanNineSixteen);
    for (let i = 1; i < list.length; i++) {
      expect(list[i].value).toBeGreaterThanOrEqual(list[i - 1].value);
    }
  });

  it("when originalAspectRatio is more than 16:9, includes original and places it at the maximum (landscape) end", () => {
    const sixteenNinths = 16 / 9;
    const moreThanSixteenNinths = sixteenNinths + 1;
    const { result } = renderHook(() => useAspectRatioList(moreThanSixteenNinths));

    const list = result.current;
    const original = list.find((r) => r.name === "original");
    expect(original).toBeDefined();
    expect(original?.value).toBe(moreThanSixteenNinths);
    expect(moreThanSixteenNinths).toBeGreaterThan(sixteenNinths);
    expect(list[list.length - 1].value).toBe(moreThanSixteenNinths);
    for (let i = 1; i < list.length; i++) {
      expect(list[i].value).toBeGreaterThanOrEqual(list[i - 1].value);
    }
  });

  it("memoizes: same dependency returns same array reference", () => {
    const { result, rerender } = renderHook(() => useAspectRatioList(4 / 3));

    const first = result.current;
    rerender();
    const second = result.current;
    expect(second).toBe(first);
  });

  it("recomputes when originalAspectRatioValue changes", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value?: number }) => useAspectRatioList(value),
      { initialProps: { value: 1 } },
    );

    const withOne = result.current;
    const originalAtOne = withOne.find((r) => r.name === "original");
    expect(originalAtOne?.value).toBe(1);

    rerender({ value: 16 / 9 });
    const withSixteenNinths = result.current;
    const originalAt16_9 = withSixteenNinths.find((r) => r.name === "original");
    expect(originalAt16_9?.value).toBe(16 / 9);
    expect(withSixteenNinths).not.toBe(withOne);
  });
});
