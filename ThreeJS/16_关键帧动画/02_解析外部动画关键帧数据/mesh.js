import * as THREE from 'three';
const group = new THREE.Group();
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const loader = new GLTFLoader();
let mixer = null;

// 将加载过程包装成Promise
function loadModel(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

const modelConfigs = [
  {
    url: './工厂.glb',
    name: 'factory',
    position: [0, 0, 0],
    scale: 1,
    animation: {
      index: 0, // 播放第0个动画
      loop: true, // 是否循环
      timeScale: 1, // 播放速度
    },
  },
  {
    url: './士兵.glb',
    name: 'soldier',
    position: [-30, 0, 30],
    scale: 5,
    rotationY: 180,
    animation: {
      index: 1, // 播放第1个动画（如果有的话）
      loop: true,
      timeScale: 0.5, // 播放速度减半
    },
  },
];

Promise.all(modelConfigs.map(config => loadModel(config.url)))
  .then(gltfs => {
    console.log('所有模型加载完成');

    // 创建混合器
    mixer = new THREE.AnimationMixer(group);

    gltfs.forEach((gltf, index) => {
      const config = modelConfigs[index];
      gltf.scene.position.set(...config.position);
      gltf.scene.scale.setScalar(config.scale);

      // 设置旋转
      if (config.rotationY !== undefined) {
        gltf.scene.rotation.y = THREE.MathUtils.degToRad(config.rotationY);
      }

      group.add(gltf.scene);

      // 根据配置播放指定动画
      if (gltf.animations.length > 0 && config.animation) {
        const animIndex = Math.min(
          config.animation.index,
          gltf.animations.length - 1
        );
        const action = mixer.clipAction(gltf.animations[animIndex]);

        // 设置动画属性
        action.timeScale = config.animation.timeScale || 1;
        action.loop = config.animation.loop ? THREE.LoopRepeat : THREE.LoopOnce;
        action.play();

        console.log(
          `${config.name} 播放动画 ${animIndex}, 可用动画数: ${gltf.animations.length}`
        );
      }
    });
  })
  .catch(error => {
    console.error('模型加载失败:', error);
  });

const clock = new THREE.Clock();

// 导出 mixer 和 clock，让主文件来控制动画更新
export { mixer, clock };
export default group;
