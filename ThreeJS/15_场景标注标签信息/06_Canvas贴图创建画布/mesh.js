import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import createCanvas from './canvas.js';

const loader = new GLTFLoader();
const group = new THREE.Group();
loader.load('./工厂.glb', gltf => {
  const scene = gltf.scene;
  group.add(scene);
  const canvasLoct = ['设备A', '设备B', '停车场'];
  const img = new Image();
  img.src = './标签箭头背景.png';
  img.onload = () => {
    for (let i = 0; i < canvasLoct.length; i++) {
      const canvas = createCanvas(img, canvasLoct[i]);

      // 必须等图片加载完成后才能执行以下代码
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      const y = 4;

      const x = (canvas.width / canvas.height) * y;
      sprite.scale.set(x, y, 1);

      sprite.position.y = y / 2;
      const obj = gltf.scene.getObjectByName(canvasLoct[i] + '标注');
      obj.add(sprite);
    }
  };
});

export default group;
