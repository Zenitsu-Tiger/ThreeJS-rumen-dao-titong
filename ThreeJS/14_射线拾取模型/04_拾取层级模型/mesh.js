import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export async function loadFactory() {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(new URL("./工厂.glb", import.meta.url).href);
  return gltf.scene;
}
