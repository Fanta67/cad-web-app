import { createMesh } from "./mesh.js";

/**
 * REFERENCE operation: translate every vertex of a mesh by (dx, dy, dz).
 * New operations should follow this shape: pure kernel function over meshes.
 *
 * @param {{positions: ArrayLike<number>, indices: ArrayLike<number>}} mesh
 * @param {number} dx
 * @param {number} dy
 * @param {number} dz
 */
export function translateMesh(mesh, dx = 0, dy = 0, dz = 0) {
  for (const [label, v] of [
    ["dx", dx],
    ["dy", dy],
    ["dz", dz],
  ]) {
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new Error(`${label} must be a finite number, got ${v}`);
    }
  }
  const positions = new Float32Array(mesh.positions.length);
  for (let i = 0; i < mesh.positions.length; i += 3) {
    positions[i] = mesh.positions[i] + dx;
    positions[i + 1] = mesh.positions[i + 1] + dy;
    positions[i + 2] = mesh.positions[i + 2] + dz;
  }
  return createMesh(positions, Array.from(mesh.indices));
}
