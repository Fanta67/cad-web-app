// In-memory part list store.

let parts = [];
let nextId = 1;
const listeners = new Set();

export function addPart(name, mesh) {
  const part = { id: `part-${nextId++}`, name, mesh };
  parts.push(part);
  for (const fn of listeners) {
    fn(listParts());
  }
  return part;
}

export function listParts() {
  return parts.slice();
}

export function clearParts() {
  parts = [];
  for (const fn of listeners) {
    fn(listParts());
  }
}

export function onPartsChanged(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
