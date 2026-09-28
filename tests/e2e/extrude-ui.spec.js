import { test, expect } from "@playwright/test";

test("extrude via UI adds a part and exports STL", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("op-extrude").click();
  await page.getByTestId("extrude-profile").selectOption("lBracket");
  await page.getByTestId("extrude-depth").fill("10");
  await page.getByTestId("extrude-apply").click();
  await expect(page.getByTestId("parts")).toContainText("L-bracket");

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-stl").click();
  const download = await downloadPromise;
  const path = await download.path();
  const { readFileSync } = await import("node:fs");
  const stl = readFileSync(path, "utf8");
  expect(stl).toContain("facet normal");
  expect(stl).toContain("endsolid");
});
