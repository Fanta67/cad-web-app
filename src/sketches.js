// Sample 2D sketch profiles. Outer rings are counter-clockwise, holes clockwise.

export const SKETCHES = {
  box100x50: {
    name: "Box 100x50",
    outer: [
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 50],
    ],
    holes: [],
  },
  lBracket: {
    name: "L-bracket",
    outer: [
      [0, 0],
      [60, 0],
      [60, 30],
      [30, 30],
      [30, 60],
      [0, 60],
    ],
    holes: [
      [
        [10, 10],
        [10, 20],
        [20, 20],
        [20, 10],
      ],
    ],
  },
};

/** Signed polygon area (shoelace). Positive for CCW rings. */
export function ringArea(ring) {
  let total = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    total += x1 * y2 - x2 * y1;
  }
  return total / 2;
}

/** Net profile area: outer minus holes. */
export function profileArea(profile) {
  let area = Math.abs(ringArea(profile.outer));
  for (const hole of profile.holes ?? []) {
    area -= Math.abs(ringArea(hole));
  }
  return area;
}
