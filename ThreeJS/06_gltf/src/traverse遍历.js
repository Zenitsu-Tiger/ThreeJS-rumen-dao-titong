import * as THREE from 'three'
// 引入GLTF加载器
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 实例化一个加载器对象
const loader=new GLTFLoader()

const model=new THREE.Group()
loader.load('/小区积木.glb',(gltf)=>{
// 遍历模型的所有子节点
gltf.scene.traverse(child=>{
if(child.isMesh){
  // 查看threejs渲染gltf默认材质
  console.log('child.name',child.material);
  child.material=new THREE.MeshLambertMaterial({
    color:0xffffff
  })
}
})
  model.add(gltf.scene)
})

export default model