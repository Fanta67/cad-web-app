import { addPart } from "../parts.js";
import { previewMesh, renderParts } from "../viewer.js";
import { listParts } from "../parts.js";

// Operation registry. New operations register { id, title, renderForm } and
// get a toolbar button (data-testid `op-<id>`) plus form helpers.
const operations = [];

export function registerOperation(operation) {
  operations.push(operation);
}

function commitPart(name, mesh) {
  previewMesh(null);
  addPart(name, mesh);
  renderParts(listParts());
}

export function initOperationsPanel(opsEl, formEl) {
  for (const op of operations) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = op.title;
    button.dataset.testid = `op-${op.id}`;
    button.addEventListener("click", () => {
      previewMesh(null);
      formEl.replaceChildren();
      op.renderForm(formEl, { preview: previewMesh, commit: commitPart });
    });
    opsEl.appendChild(button);
  }
}
