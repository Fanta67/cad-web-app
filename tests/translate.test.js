import { describe, expect, it } from "vitest";
import {
  boundingBox,
  computeVolume,
  isManifold,
  signedVolume,
  triangleCount,
} from "../src/kernel/mesh.js";
import { boxMesh } from "../src/kernel/primitives.js";
import { translateMesh } from "../src/kernel/translate.js";

describe("translate (reference operation)", () => {
  it("shifts every vertex by (dx, dy, dz)", () => {
    const mesh = boxMesh(10, 20, 30);
    const moved = translateMesh(mesh, 5, -7, 2.5);
    expect(moved.positions).toHaveLength(mesh.positions.length);
    for (let i = 0; i < mesh.positions.length; i += 3) {
      expect(moved.positions[i]).toBeCloseTo(mesh.positions[i] + 5, 9);
      expect(moved.positions[i + 1]).toBeCloseTo(mesh.positions[i + 1] - 7, 9);
      expect(moved.positions[i + 2]).toBeCloseTo(mesh.positions[i + 2] + 2.5, 9);
    }
    expect(Array.from(moved.indices)).toEqual(Array.from(mesh.indices));
  });

  it("preserves volume, winding, and manifoldness", () => {
    const mesh = boxMesh(10, 20, 30);
    const moved = translateMesh(mesh, 100, 200, 300);
    expect(computeVolume(moved)).toBeCloseTo(10 * 20 * 30, 6);
    expect(signedVolume(moved)).toBeGreaterThan(0);
    expect(isManifold(moved)).toBe(true);
    expect(triangleCount(moved)).toBe(12);
  });

  it("moves the bounding box", () => {
    const moved = translateMesh(boxMesh(10, 10, 10), 3, 4, 5);
    expect(boundingBox(moved)).toEqual({
      min: [-2, -1, 0],
      max: [8, 9, 10],
    });
  });

  it("defaults to zero offset", () => {
    const mesh = boxMesh(4, 5, 6);
    const moved = translateMesh(mesh);
    expect(Array.from(moved.positions)).toEqual(Array.from(mesh.positions));
  });

  it("rejects non-finite offsets", () => {
    const mesh = boxMesh(4, 5, 6);
    expect(() => translateMesh(mesh, NaN, 0, 0)).toThrow();
    expect(() => translateMesh(mesh, 0, Infinity, 0)).toThrow();
  });
});
