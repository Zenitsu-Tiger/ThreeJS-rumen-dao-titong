// 导入Three.js核心库
import * as THREE from 'three'
// 导入GLTF模型加载器，用于加载.glb/.gltf格式的3D模型文件
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 创建GLTF加载器实例
const loader = new GLTFLoader()

// 创建一个空的3D对象组，用于容纳加载的模型
const model = new THREE.Group()


// CubeTexture代表了立方体纹理对象，父类是纹理对象Texture
// 先设置路径
// 再加载6个方向的立方体贴图：x轴正负，y轴正负，z轴正负
const textureCube=new THREE.CubeTextureLoader()
.setPath('./环境贴图0/')
.load(['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg'])


loader.load('./metal/金属.glb',(gltf)=>{
  gltf.scene.traverse((child)=>{
    if(child.isMesh){
      child.material=new THREE.MeshStandardMaterial({
        roughness:0.5,
        metalness:1,
      })
      // 设置环境贴图属性的值为立方体纹理对象
      child.material.envMap=textureCube

      //envMapIntensity 用于设置模型表面反射周围环境贴图的能力
      child.material.envMapIntensity=1
    }
  })
  model.add(gltf.scene)
})






// 导出模型组，供其他模块使用
export default model