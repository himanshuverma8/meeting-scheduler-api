import { describe, it, expect } from "vitest";
import { merge, subtract, chunk, computeSlots } from "./availability.engine";

describe("merge", () => {
  it("keeps non-overlapping unsorted intervals separate", () => {
    expect(merge([[1,2],[5,6],[3,4]])).toEqual([[1,2],[3,4],[5,6]]);
  });
});

describe("subtract", () => {
  it("splits a window around a middle block", () => {
    expect(subtract([750, 960], [[770, 820]])).toEqual([[750, 770], [820, 960]]);
  });
});


it("ignores a block entirely before the window", () => {
  expect(subtract([750, 960], [[600, 700]])).toEqual([[750, 960]]);
});
it("clips a gap that would run past the window end", () => {
  expect(subtract([750, 960], [[980, 1000]])).toEqual([[750, 960]]);
});

it("blocks the part of a window covered by a block starting before it", () => {
  expect(subtract([750, 960], [[740, 800]])).toEqual([[800, 960]]);
});

describe("chunk", () => {
  it("slices a gap into duration-sized slots", () => {
    expect(chunk([820, 960], 30)).toEqual([820, 850, 880, 910]);
  });
  it("returns nothing when the gap is smaller than the duration", () => {
    expect(chunk([750, 770], 30)).toEqual([]);
  });
  it("keeps a slot that ends exactly at the gap end", () => {
    expect(chunk([930, 960], 30)).toEqual([930]);
  });
});

describe("computeSlots", () => {
  it("computes the full dry-run scenario end to end", () => {
    const slots = computeSlots({
      now: 720,
      window: [660, 960],
      bookings: [[780, 810]],
      config: { duration: 30, bufferBefore: 10, bufferAfter: 10, minNotice: 30, maxDays: 999999 },
      queryStart: 660,
      queryEnd: 960,
    });
    expect(slots).toEqual([820, 850, 880, 910]);
  });
});
