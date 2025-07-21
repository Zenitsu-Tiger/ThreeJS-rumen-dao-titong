import * as THREE from 'three';
import { TextureLoader } from 'three';
import TWEEN from '@tweenjs/tween.js';
const group = new THREE.Group();

const textureLoader = new TextureLoader();

const earthGeometry = new THREE.SphereGeometry(1, 32, 32);

const earthTexture = textureLoader.load('./earth.jpg');

const earthMaterial = new THREE.MeshLambertMaterial({
  map: earthTexture,
});

const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.scale.set(10, 10, 10);
// 模型淡入
// 开启透明
earthMaterial.transparent = true;
// 初始完全透明
earthMaterial.opacity = 0.0;

new TWEEN.Tween(earthMaterial)
  .to({ opacity: 1.0 }, 3000)
  .onUpdate(obj => (earthMaterial.opacity = obj.opacity))
  .onComplete(() => (earthMaterial.transparent = false))
  .start()
  .easing(TWEEN.Easing.Quadratic.Out);

export default earthMesh;
