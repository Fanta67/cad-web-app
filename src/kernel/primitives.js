import { createMesh } from "./mesh.js";

/**
 * Axis-aligned box centered at the origin. Outward winding, manifold.
 *
 * @param {number} w width along X
 * @param {number} h height along Y
 * @param {number} d depth along Z
 */
export function boxMesh(w, h, d) {
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;
  const positions = [
    -x, -y, -z, // 0
    x, -y, -z, // 1
    x, y, -z, // 2
    -x, y, -z, // 3
    -x, -y, z, // 4
    x, -y, z, // 5
    x, y, z, // 6
    -x, y, z, // 7
  ];
  const indices = [
    // -z
    0, 2, 1, 0, 3, 2,
    // +z
    4, 5, 6, 4, 6, 7,
    // -y
    0, 1, 5, 0, 5, 4,
    // +y
    3, 7, 6, 3, 6, 2,
    // -x
    0, 4, 7, 0, 7, 3,
    // +x
    1, 2, 6, 1, 6, 5,
  ];
  return createMesh(positions, indices);
}
