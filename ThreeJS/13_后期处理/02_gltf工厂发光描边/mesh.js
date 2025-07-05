import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const group=new THREE.Group()
const loader=new GLTFLoader()
loader.load('./assets/工厂.glb',(gltf)=>{
  const mesh=gltf.scene
  group.add(mesh)
})

export default group