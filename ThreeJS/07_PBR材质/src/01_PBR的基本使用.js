// 导入Three.js核心库
import * as THREE from 'three'
// 导入GLTF模型加载器，用于加载.glb/.gltf格式的3D模型文件
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 创建GLTF加载器实例
const loader = new GLTFLoader()

// 创建一个空的3D对象组，用于容纳加载的模型
const model = new THREE.Group()

// 异步加载3D模型文件
loader.load('./metal/金属.glb', (gltf) => {
  // 遍历加载的模型场景中的所有子对象
  gltf.scene.traverse((child) => {
    // 判断当前子对象是否为网格对象(Mesh)
    if (child.isMesh) {
      // 为网格对象设置新的PBR标准材质
      child.material = new THREE.MeshStandardMaterial({
        roughness: 0.5,  // 粗糙度：0.5表示半光滑表面
        metalness: 1,    // 金属度：1表示完全金属材质
      })
    }
  })
  // 将加载完成的3D场景添加到模型组中
  model.add(gltf.scene)
})

// 导出模型组，供其他模块使用
export default model