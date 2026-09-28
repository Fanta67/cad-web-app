# CAD Web App

Minimal browser-based parametric CAD app: a Three.js viewer, an operations
panel, a part list, and STL export. Built as a reusable scaffold for agentic
coding tasks — each task asks the agent to implement one modeling operation
end to end (geometry kernel + UI wiring + export).

## Setup

```bash
npm install
npm run dev      # app on http://localhost:5173
```

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                     |
| `npm run build`   | Production build                               |
| `npm test`        | Unit tests (vitest)                            |
| `npm run test:e2e`| Browser tests (playwright; needs `npx playwright install chromium`) |
| `npm run lint`    | ESLint                                         |

## Architecture

```
src/
  kernel/        Pure geometry code. NEVER imports from src/ui (enforced by tests).
    mesh.js        Mesh helpers: createMesh, signedVolume/computeVolume,
                   boundingBox, isManifold, hasNaN, mergeVertices
    primitives.js  boxMesh (outward winding, manifold)
    translate.js   REFERENCE operation: translateMesh(mesh, dx, dy, dz)
    extrude.js     STUB for the extrude task (throws until implemented)
  ui/
    operationsPanel.js  Operation registry + toolbar (buttons get data-testid `op-<id>`)
    translateForm.js    REFERENCE form: data-testid inputs, live preview, commit on Apply
  export/stl.js  ASCII STL export over the part list (no per-operation changes needed)
  sketches.js    Sample 2D profiles (box, L-bracket with hole) + area helpers
  parts.js       In-memory part store
  viewer.js      Three.js scene: committed parts + translucent preview
  main.js        Bootstrapping + demo seed part
tests/
  translate.test.js       Reference-operation tests (pass on a fresh scaffold)
  architecture.test.js    Kernel/UI import-direction guard
  extrude.visible.test.js Visible extrude contract (fails until implemented)
  e2e/extrude-ui.spec.js  Browser test: drive the extrude form, export STL
```

Mesh shape: `{ positions: Float32Array, indices: Uint32Array }`, flat
`[x, y, z, ...]` positions and triangle index triples with outward-facing
winding (counter-clockwise seen from outside the solid).

## The extrude task contract

`extrude(profile, options)` in `src/kernel/extrude.js`:

- Input profile: `{ outer: [[x,y],...] }` counter-clockwise, optional
  `holes: [[[x,y],...]]` clockwise.
- Options: `{ depth: number > 0, centered?: boolean }` along +Z.
- Output: manifold triangle mesh, outward winding, welded vertices, no NaN.
- Must handle concave polygons and holes (`earcut` is already a dependency).

The UI form (`src/ui/extrudeForm.js`, mirroring `translateForm.js`) needs
`data-testid` attributes the e2e test drives: `op-extrude` (provided by the
registry), `extrude-profile`, `extrude-depth`, `extrude-apply`.

## License

MIT.
