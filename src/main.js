import { boxMesh } from "./kernel/primitives.js";
import { addPart, listParts, onPartsChanged } from "./parts.js";
import { downloadStl } from "./export/stl.js";
import { initOperationsPanel, registerOperation } from "./ui/operationsPanel.js";
import { renderTranslateForm } from "./ui/translateForm.js";
import { initViewer, renderParts } from "./viewer.js";

registerOperation({
  id: "translate",
  title: "Translate",
  renderForm: renderTranslateForm,
});

function renderPartList(parts) {
  const list = document.getElementById("parts");
  list.replaceChildren();
  for (const part of parts) {
    const item = document.createElement("li");
    item.textContent = `${part.name} (${part.mesh.indices.length / 3} tris)`;
    list.appendChild(item);
  }
  renderParts(parts);
}

function main() {
  initViewer(document.getElementById("viewport"));
  initOperationsPanel(
    document.getElementById("operations"),
    document.getElementById("op-form"),
  );
  onPartsChanged(renderPartList);
  document.getElementById("export-stl").addEventListener("click", () => {
    downloadStl(listParts());
  });
  // Seed part so translate and export work before any extrude exists.
  addPart("Demo box", boxMesh(40, 30, 20));
  renderPartList(listParts());
}

main();
