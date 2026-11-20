import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { loadFactory } from "./mesh.js";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(100));

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight, new THREE.AmbientLight(0xffffff, 0.4));

const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.set(92, 113, 85);

const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
const canvas = renderer.domElement;
document.body.appendChild(canvas);
const controls = new OrbitControls(camera, canvas);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.visibleEdgeColor.set(0x00ffff);
outlinePass.edgeThickness = 4;
outlinePass.edgeStrength = 6;
composer.addPass(outlinePass);

const fxaaPass = new ShaderPass(FXAAShader);
composer.addPass(fxaaPass);
composer.addPass(new OutputPass());

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = "label-layer";
document.body.appendChild(labelRenderer.domElement);

const labelElement = document.createElement("div");
labelElement.className = "device-label";
const label = new CSS2DObject(labelElement);
label.center.set(0.5, 1);


const drawingBufferSize = new THREE.Vector2();
function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(width, height);
  renderer.getDrawingBufferSize(drawingBufferSize);
  fxaaPass.uniforms.resolution.value.set(1 / drawingBufferSize.x, 1 / drawingBufferSize.y);
  labelRenderer.setSize(width, height);
}

resize();
window.addEventListener("resize", resize);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const deviceByMesh = new Map();
let devices = [];

loadFactory().then((factory) => {
  scene.add(factory);
  const storageTanks = factory.getObjectByName("存储罐");
  if (!storageTanks) {
    console.error("工厂模型中找不到存储罐分组。");
    return;
  }

  devices = storageTanks.children;
  for (const device of devices) {
    device.traverse((part) => {
      if (part.isMesh) deviceByMesh.set(part, device);
    });
  }
  factory.updateWorldMatrix(true, true);
}).catch((error) => {
  console.error("加载工厂模型失败：", error);
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  pointer.set((px / rect.width) * 2 - 1, 1 - (py / rect.height) * 2);

  camera.updateMatrixWorld();
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(devices, true);
  const device = hits.length > 0 ? deviceByMesh.get(hits[0].object) : undefined;
  outlinePass.selectedObjects = device ? [device] : [];

  const anchor = device?.getObjectByName(`${device.name}标注`);
  if (anchor) {
    labelElement.textContent = device.name;
    anchor.add(label);
  } else {
    label.removeFromParent();
  }
});

renderer.setAnimationLoop(() => {
  controls.update();
  composer.render();
  labelRenderer.render(scene, camera);
});
