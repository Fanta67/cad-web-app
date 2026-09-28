import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let renderer = null;
let scene = null;
let camera = null;
let partsGroup = null;
let previewObject = null;

const PART_COLORS = [0x4f8ff7, 0x55b668, 0xf2a541, 0xc65df0, 0xef6461];

export function initViewer(canvas) {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
  camera.position.set(120, 90, 140);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(25, 20, 0);
  controls.update();
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const directional = new THREE.DirectionalLight(0xffffff, 1.2);
  directional.position.set(100, 150, 80);
  scene.add(directional);
  const grid = new THREE.GridHelper(400, 40, 0xcccccc, 0xe4e4e7);
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);
  partsGroup = new THREE.Group();
  scene.add(partsGroup);

  const resize = () => {
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 600;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  window.addEventListener("resize", resize);
  resize();
}

function disposeGroup(group) {
  for (const child of [...group.children]) {
    group.remove(child);
    child.geometry?.dispose();
    child.material?.dispose();
  }
}

function meshToObject(mesh, color, { transparent = false } = {}) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(Float32Array.from(mesh.positions), 3),
  );
  geometry.setIndex(Array.from(mesh.indices));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.1,
    roughness: 0.6,
    transparent,
    opacity: transparent ? 0.55 : 1,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

export function renderParts(parts) {
  if (!renderer) {
    return;
  }
  disposeGroup(partsGroup);
  parts.forEach((part, i) => {
    partsGroup.add(
      meshToObject(part.mesh, PART_COLORS[i % PART_COLORS.length]),
    );
  });
  renderer.render(scene, camera);
}

/** Show a translucent preview mesh; pass null to clear. */
export function previewMesh(mesh) {
  if (!renderer) {
    return;
  }
  if (previewObject) {
    scene.remove(previewObject);
    previewObject.geometry.dispose();
    previewObject.material.dispose();
    previewObject = null;
  }
  if (mesh) {
    previewObject = meshToObject(mesh, 0x22c55e, { transparent: true });
    scene.add(previewObject);
  }
  renderer.render(scene, camera);
}
