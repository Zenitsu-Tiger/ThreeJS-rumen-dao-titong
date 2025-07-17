import * as THREE from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'


const group = new THREE.Group();
const loader=new GLTFLoader()
loader.load('./工厂.glb',(gltf)=>{
    console.log(gltf)
    const model=gltf.scene
    group.add(model)
})


export default group