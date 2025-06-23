import * as THREE from 'three'
// 引入GLTF加载器
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 实例化一个加载器对象
const loader=new GLTFLoader()

const model=new THREE.Group()
loader.load('/工厂.gltf',(gltf)=>{
  console.log(gltf)
  model.add(gltf.scene)
})

export default model