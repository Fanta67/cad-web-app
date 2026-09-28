// Minimal mesh helpers.
//
// Mesh shape: { positions, indices }
//   positions: flat [x, y, z, ...] (length is a multiple of 3)
//   indices: flat [a, b, c, ...] triangle corners into positions (multiple of 3)
// Outward-facing winding: counter-clockwise when viewed from outside the solid.

export function createMesh(positions, indices) {
  const pos = Array.from(positions ?? []);
  const idx = Array.from(indices ?? []);
  if (pos.length % 3 !== 0) {
    throw new Error(`positions length ${pos.length} is not a multiple of 3`);
  }
  if (idx.length % 3 !== 0) {
    throw new Error(`indices length ${idx.length} is not a multiple of 3`);
  }
  const vertexCount = pos.length / 3;
  for (const i of idx) {
    if (!Number.isInteger(i) || i < 0 || i >= vertexCount) {
      throw new Error(`index ${i} out of range for ${vertexCount} vertices`);
    }
  }
  return { positions: Float32Array.from(pos), indices: Uint32Array.from(idx) };
}

export function triangleCount(mesh) {
  return mesh.indices.length / 3;
}

function triangleSignedVolume(p, a, b, c) {
  const ax = p[a * 3];
  const ay = p[a * 3 + 1];
  const az = p[a * 3 + 2];
  const bx = p[b * 3];
  const by = p[b * 3 + 1];
  const bz = p[b * 3 + 2];
  const cx = p[c * 3];
  const cy = p[c * 3 + 1];
  const cz = p[c * 3 + 2];
  // v0 . (v1 x v2) / 6
  const crossX = by * cz - bz * cy;
  const crossY = bz * cx - bx * cz;
  const crossZ = bx * cy - by * cx;
  return (ax * crossX + ay * crossY + az * crossZ) / 6;
}

/**
 * Signed volume of a closed mesh. Positive when winding is outward-facing,
 * negative when inward. Zero for degenerate or non-closed input.
 */
export function signedVolume(mesh) {
  let total = 0;
  const { positions, indices } = mesh;
  for (let t = 0; t < indices.length; t += 3) {
    total += triangleSignedVolume(
      positions,
      indices[t],
      indices[t + 1],
      indices[t + 2],
    );
  }
  return total;
}

export function computeVolume(mesh) {
  return Math.abs(signedVolume(mesh));
}

export function boundingBox(mesh) {
  const { positions } = mesh;
  if (positions.length === 0) {
    throw new Error("cannot compute bounding box of an empty mesh");
  }
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const v = positions[i + axis];
      if (v < min[axis]) min[axis] = v;
      if (v > max[axis]) max[axis] = v;
    }
  }
  return { min, max };
}

/**
 * A mesh is manifold when every undirected edge is shared by exactly
 * two triangles.
 */
export function isManifold(mesh) {
  const { indices } = mesh;
  const counts = new Map();
  for (let t = 0; t < indices.length; t += 3) {
    const tri = [indices[t], indices[t + 1], indices[t + 2]];
    for (let e = 0; e < 3; e += 1) {
      const a = tri[e];
      const b = tri[(e + 1) % 3];
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  if (counts.size === 0) {
    return false;
  }
  for (const count of counts.values()) {
    if (count !== 2) {
      return false;
    }
  }
  return true;
}

export function hasNaN(mesh) {
  for (const v of mesh.positions) {
    if (!Number.isFinite(v)) {
      return true;
    }
  }
  return false;
}

/**
 * Weld vertices closer than `tol`, remap indices, and drop degenerate
 * triangles (fewer than 3 distinct vertices).
 */
export function mergeVertices(mesh, tol = 1e-9) {
  const { positions, indices } = mesh;
  const vertexCount = positions.length / 3;
  const keyOf = (i) => {
    const q = (v) => Math.round(v / tol);
    return `${q(positions[i * 3])},${q(positions[i * 3 + 1])},${q(
      positions[i * 3 + 2],
    )}`;
  };
  const remap = new Array(vertexCount);
  const seen = new Map();
  const welded = [];
  for (let i = 0; i < vertexCount; i += 1) {
    const key = keyOf(i);
    if (seen.has(key)) {
      remap[i] = seen.get(key);
    } else {
      const fresh = welded.length / 3;
      seen.set(key, fresh);
      remap[i] = fresh;
      welded.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    }
  }
  const outIndices = [];
  for (let t = 0; t < indices.length; t += 3) {
    const tri = new Set([
      remap[indices[t]],
      remap[indices[t + 1]],
      remap[indices[t + 2]],
    ]);
    if (tri.size === 3) {
      outIndices.push(...tri);
    }
  }
  return createMesh(welded, outIndices);
}
