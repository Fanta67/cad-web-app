// ASCII STL export. Consumes the part list; no per-operation changes needed.

function facetNormal(p, a, b, c) {
  const ux = p[b * 3] - p[a * 3];
  const uy = p[b * 3 + 1] - p[a * 3 + 1];
  const uz = p[b * 3 + 2] - p[a * 3 + 2];
  const vx = p[c * 3] - p[a * 3];
  const vy = p[c * 3 + 1] - p[a * 3 + 1];
  const vz = p[c * 3 + 2] - p[a * 3 + 2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz);
  if (len === 0) {
    return [0, 0, 0];
  }
  return [nx / len, ny / len, nz / len];
}

export function meshToStlAscii(name, mesh) {
  const { positions, indices } = mesh;
  const lines = [`solid ${name}`];
  for (let t = 0; t < indices.length; t += 3) {
    const a = indices[t];
    const b = indices[t + 1];
    const c = indices[t + 2];
    const [nx, ny, nz] = facetNormal(positions, a, b, c);
    lines.push(`  facet normal ${nx} ${ny} ${nz}`);
    lines.push("    outer loop");
    for (const v of [a, b, c]) {
      lines.push(
        `      vertex ${positions[v * 3]} ${positions[v * 3 + 1]} ${
          positions[v * 3 + 2]
        }`,
      );
    }
    lines.push("    endloop");
    lines.push("  endfacet");
  }
  lines.push(`endsolid ${name}`);
  return lines.join("\n");
}

export function partsToStlAscii(parts) {
  return parts.map((p) => meshToStlAscii(p.name, p.mesh)).join("\n");
}

export function downloadStl(parts, filename = "parts.stl") {
  const text = partsToStlAscii(parts);
  const blob = new Blob([text], { type: "model/stl" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
