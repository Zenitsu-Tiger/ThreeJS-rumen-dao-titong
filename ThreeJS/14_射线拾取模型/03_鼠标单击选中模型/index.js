import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { group } from "./mesh.js";

const scene = new THREE.Scene();
scene.add(group);
scene.add(new THREE.AxesHelper(100));

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight, new THREE.AmbientLight(0xffffff, 0.4));

const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(92, 113, 85);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

const canvas = renderer.domElement;
document.body.appendChild(canvas);
new OrbitControls(camera, canvas);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  pointer.set((px / rect.width) * 2 - 1, -(py / rect.height) * 2 + 1);

  camera.updateMatrixWorld();
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(group.children);
  const nearest = intersects[0];
  if (!nearest) return;

  nearest.object.material.color.set(0x00ff00);
  const second = intersects.find((hit) => hit.object !== nearest.object);
  if (second) second.object.material.color.set(0x0000ff);
});

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
