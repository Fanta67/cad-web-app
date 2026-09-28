import { translateMesh } from "../kernel/translate.js";
import { listParts } from "../parts.js";

// REFERENCE form: new operation forms should follow this shape — inputs with
// data-testid attributes, live preview on change, commit on Apply.
export function renderTranslateForm(container, { preview, commit }) {
  const form = document.createElement("form");

  const partLabel = document.createElement("label");
  partLabel.textContent = "Part";
  const partSelect = document.createElement("select");
  partSelect.dataset.testid = "translate-part";
  for (const part of listParts()) {
    const option = document.createElement("option");
    option.value = part.id;
    option.textContent = part.name;
    partSelect.appendChild(option);
  }
  partLabel.appendChild(partSelect);

  const fields = {};
  for (const axis of ["dx", "dy", "dz"]) {
    const label = document.createElement("label");
    label.textContent = axis;
    const input = document.createElement("input");
    input.type = "number";
    input.value = "0";
    input.dataset.testid = `translate-${axis}`;
    label.appendChild(input);
    fields[axis] = input;
    form.appendChild(label);
  }
  form.prepend(partLabel);

  const apply = document.createElement("button");
  apply.type = "submit";
  apply.textContent = "Apply";
  apply.dataset.testid = "translate-apply";
  form.appendChild(apply);

  const currentMesh = () => {
    const part = listParts().find((p) => p.id === partSelect.value);
    if (!part) {
      return null;
    }
    const dx = Number(fields.dx.value);
    const dy = Number(fields.dy.value);
    const dz = Number(fields.dz.value);
    if (![dx, dy, dz].every(Number.isFinite)) {
      return null;
    }
    return { part, mesh: translateMesh(part.mesh, dx, dy, dz) };
  };

  form.addEventListener("input", () => {
    const result = currentMesh();
    preview(result ? result.mesh : null);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = currentMesh();
    if (result) {
      commit(`${result.part.name} translated`, result.mesh);
    }
  });

  container.appendChild(form);
}
