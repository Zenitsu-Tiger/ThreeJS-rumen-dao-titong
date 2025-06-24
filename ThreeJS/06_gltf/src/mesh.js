// 导入Three.js核心库
import * as THREE from 'three'
// 引入GLTF加载器，用于加载3D模型文件
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 实例化GLTF加载器对象
const loader=new GLTFLoader()

// 创建一个组对象，用于管理多个3D对象
const model=new THREE.Group()

const texLoader=new THREE.TextureLoader()
// 加载地球纹理图片
const texture=texLoader.load('./phone/黑色.png')
texture.flipY=false
texture.colorSpace = THREE.SRGBColorSpace
console.log('texture.flipY',texture.flipY);

loader.load('/phone/手机模型.glb',(gltf)=>{
  const mesh=gltf.scene.children[0]
  mesh.material.map=texture

  console.log('mesh.material.map.flipY',mesh.material.map.flipY);
  
  model.add(gltf.scene)
})

// 导出模型组，供其他文件使用
export default model