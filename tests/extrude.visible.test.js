import { describe, expect, it } from "vitest";
import { extrude } from "../src/kernel/extrude.js";
import {
  boundingBox,
  computeVolume,
  hasNaN,
  isManifold,
  signedVolume,
  triangleCount,
} from "../src/kernel/mesh.js";
import { SKETCHES, profileArea } from "../src/sketches.js";

const REL_TOL = 1e-6;

function expectCloseTo(actual, expected, tol = REL_TOL) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(
    tol * Math.max(1, Math.abs(expected)),
  );
}

describe("extrude (visible)", () => {
  it("extrudes a box profile to the right volume", () => {
    const mesh = extrude(SKETCHES.box100x50, { depth: 10 });
    expectCloseTo(computeVolume(mesh), profileArea(SKETCHES.box100x50) * 10);
    expect(triangleCount(mesh)).toBe(12);
  });

  it("spans z in [0, depth] when not centered", () => {
    const mesh = extrude(SKETCHES.box100x50, { depth: 10 });
    expect(boundingBox(mesh)).toEqual({
      min: [0, 0, 0],
      max: [100, 50, 10],
    });
  });

  it("spans z symmetrically when centered", () => {
    const mesh = extrude(SKETCHES.box100x50, { depth: 10, centered: true });
    const { min, max } = boundingBox(mesh);
    expect(min[0]).toBe(0);
    expect(max[0]).toBe(100);
    expect(min[1]).toBe(0);
    expect(max[1]).toBe(50);
    expectCloseTo(min[2], -5);
    expectCloseTo(max[2], 5);
    expectCloseTo(computeVolume(mesh), profileArea(SKETCHES.box100x50) * 10);
  });

  it("handles a concave profile with a hole", () => {
    const mesh = extrude(SKETCHES.lBracket, { depth: 5 });
    // L area 2700 minus 10x10 hole = 2600; volume = 2600 * 5.
    expectCloseTo(profileArea(SKETCHES.lBracket), 2600);
    expectCloseTo(computeVolume(mesh), 2600 * 5);
    expect(isManifold(mesh)).toBe(true);
    expect(signedVolume(mesh)).toBeGreaterThan(0);
    expect(hasNaN(mesh)).toBe(false);
  });

  it("produces outward winding and no duplicates on the box", () => {
    const mesh = extrude(SKETCHES.box100x50, { depth: 7.5 });
    expect(isManifold(mesh)).toBe(true);
    expect(signedVolume(mesh)).toBeGreaterThan(0);
    expect(hasNaN(mesh)).toBe(false);
    const seen = new Set();
    for (let i = 0; i < mesh.positions.length; i += 3) {
      const key = `${mesh.positions[i]},${mesh.positions[i + 1]},${
        mesh.positions[i + 2]
      }`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});
