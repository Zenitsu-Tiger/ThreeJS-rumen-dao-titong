import * as THREE from 'three'
// 引入GLTF加载器
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 实例化一个加载器对象
const loader=new GLTFLoader()

const model=new THREE.Group()
loader.load('/小区积木.glb',(gltf)=>{
const mesh1=gltf.scene.getObjectByName('1号楼')
mesh1.material.color.set(0xff0000)

mesh1.material.name='楼房材质'


const mesh2=gltf.scene.getObjectByName('2号楼')
console.log('mesh2.material.name',mesh2.material.name);


gltf.scene.getObjectByName('小区房子').traverse(child=>{
  if(child.isMesh){
    child.material=child.material.clone()
  }
})


mesh1.material.color.set(0x00ff00)
mesh2.material.color.set(0x0000ff)

  model.add(gltf.scene)
})

export default model