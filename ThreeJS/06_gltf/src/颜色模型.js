// 导入Three.js核心库
import * as THREE from 'three'
// 引入GLTF加载器，用于加载3D模型文件
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 实例化GLTF加载器对象
const loader=new GLTFLoader()

// 创建一个组对象，用于管理多个3D对象
const model=new THREE.Group()

// 异步加载GLTF模型文件
loader.load('/工厂.gltf',(gltf)=>{
  // 加载成功后，将模型场景添加到组中
  model.add(gltf.scene)
})

// 创建一个球体几何体，半径为20
const geometry=new THREE.SphereGeometry(20)

// 实例化纹理加载器
const texLoader=new THREE.TextureLoader()

// 加载地球纹理图片
const texture=texLoader.load('./earth.jpg')

// 设置纹理的色彩空间为sRGB（适用于照片类纹理）
texture.colorSpace = THREE.SRGBColorSpace

// 打印纹理色彩空间信息，用于调试
console.log('texture.colorSpace',texture.colorSpace);

// 创建Lambert材质（漫反射材质，适合不反光的表面）
const material=new THREE.MeshLambertMaterial({
  map:texture  // 应用地球纹理
})

// 创建网格对象，结合几何体和材质
const mesh=new THREE.Mesh(geometry,material)

// 将球体向上移动50个单位
mesh.position.y+=50

// 设置球体可以投射阴影
mesh.castShadow = true;

// 设置球体可以接收其他物体的阴影
mesh.receiveShadow = true;

// 将球体添加到模型组中
model.add(mesh)

// 导出模型组，供其他文件使用
export default model