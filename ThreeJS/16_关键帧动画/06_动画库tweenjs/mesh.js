import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader=new GLTFLoader()
const group=new THREE.Group()
loader.load('./工厂.glb',(gltf)=>{
  const model=gltf.scene
  model.position.set(0,0,0)
  group.add(model)
})

export default group