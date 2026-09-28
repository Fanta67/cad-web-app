import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const kernelDir = join(here, "..", "src", "kernel");

describe("architecture", () => {
  it("kernel modules never import from UI code", () => {
    const files = readdirSync(kernelDir).filter((f) => f.endsWith(".js"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(join(kernelDir, file), "utf8");
      expect(source).not.toMatch(/from\s+['"]\.\.\/ui\//);
      expect(source).not.toMatch(/from\s+['"]\.\/ui\//);
    }
  });
});
