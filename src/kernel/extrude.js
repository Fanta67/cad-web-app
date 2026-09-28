/**
 * Extrude a 2D profile into a manifold solid. STUB - implement this.
 *
 * @param {object} profile
 * @param {Array<[number, number]>} profile.outer outer ring, counter-clockwise
 * @param {Array<Array<[number, number]>>} [profile.holes] inner rings, clockwise
 * @param {object} options
 * @param {number} options.depth extrusion depth, must be > 0
 * @param {boolean} [options.centered] when true, span z in
 *   [-depth/2, +depth/2]; otherwise [0, depth]
 * @returns {{positions: Float32Array, indices: Uint32Array}} outward winding,
 *   no duplicate vertices, no NaN/Infinity
 */
export function extrude(profile, options) {
  void profile;
  void options;
  throw new Error("extrude() is not implemented yet");
}
