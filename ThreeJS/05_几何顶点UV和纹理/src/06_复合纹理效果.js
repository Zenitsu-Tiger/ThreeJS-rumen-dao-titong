import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const gui = new GUI();
// 创建一个更合适的平面几何体 - 正方形更容易看到纹理
const geometry = new THREE.PlaneGeometry(100, 100);
const textureLoader = new THREE.TextureLoader();

// 修复路径 - 在 Vite 中，src/assets 应该从 /src/assets 开始
const texture = textureLoader.load(
  '/src/assets/CityNewYork002_COL_VAR1_1K.png'
);
texture.colorSpace = THREE.SRGBColorSpace;
/* 各类贴图类型,贴图类型之间可以复合使用 */
// 创建ao贴图
const aoMap = textureLoader.load('/src/assets/CityNewYork002_AO_1K.jpg');
// 透明度贴图
const alphaMap = textureLoader.load('/src/assets/height.jpg');
// 光照贴图
const lightMap = textureLoader.load('/src/assets/colors.png');
// 高光贴图
const specularMap = textureLoader.load(
  '/src/assets/CityNewYork002_GLOSS_1K.jpg'
);
// 添加纹理加载完成的回调，确保纹理正确加载
texture.onLoad = function () {
  console.log('纹理加载成功');
};

texture.onError = function () {
  console.error('纹理加载失败');
};

// 设置纹理的重复和包装模式
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);

const material = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.DoubleSide, // 双面显示，确保能看到纹理
  aoMap: aoMap,
  aoMapIntensity: 1,
  reflectivity: 0.1,
  // alphaMap: alphaMap,
  // lightMap: lightMap,
  specularMap: specularMap,
  transparent: true,
});

const mesh = new THREE.Mesh(geometry, material);
gui.add(material, 'aoMapIntensity').min(0).max(1).step(0.01).name('ao贴图强度');
gui
  .add(texture, 'colorSpace', {
    sRGB: THREE.SRGBColorSpace,
    Linear: THREE.LinearSRGBColorSpace,
  })
  .name('贴图颜色空间')
  .onChange(() => {
    texture.needsUpdate = true;
  });
export { mesh, texture };
