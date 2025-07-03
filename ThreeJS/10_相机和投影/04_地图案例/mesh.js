import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"

const loader=new GLTFLoader()
loader.load("./assets/工厂.glb",(gltf)=>{
  const model=gltf.scene
  group.add(model)
})
const group = new THREE.Group();



export default group;
