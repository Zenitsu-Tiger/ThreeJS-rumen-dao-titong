import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const group = new THREE.Group();
const loader = new GLTFLoader();
const clock = new THREE.Clock();
let mixer = null;

// 将 GLTFLoader 回调风格包装成 Promise，便于并行加载
function loadModel(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

const modelConfigs = [
  {
    url: "./工厂.glb",
    name: "factory",
    position: [0, 0, 0],
    scale: 1,
    animation: {
      index: 0, // 工厂.glb 含 1 条动画：Action.001_大货车（时长 40s）
      loop: true,
      timeScale: 1,
    },
  },
  {
    url: "./士兵.glb",
    name: "soldier",
    position: [-30, 0, 30],
    scale: 5,
    rotationY: 180, // 角度制，下方通过 degToRad 转为弧度
    animation: {
      index: 1, // 若索引越界，下方用 Math.min 自动兜底
      loop: true,
      timeScale: 0.5, // 0.5 倍速慢放
    },
  },
];

Promise.all(modelConfigs.map((config) => loadModel(config.url)))
  .then((gltfs) => {
    console.log("所有模型加载完成");

    // 创建统一混合器（挂在顶层 group 上，由渲染循环统一 update）
    mixer = new THREE.AnimationMixer(group);

    gltfs.forEach((gltf, index) => {
      const config = modelConfigs[index];
      gltf.scene.position.set(...config.position);
      gltf.scene.scale.setScalar(config.scale);

      if (config.rotationY !== undefined) {
        gltf.scene.rotation.y = THREE.MathUtils.degToRad(config.rotationY);
      }

      group.add(gltf.scene);

      // 根据配置播放模型自带动画
      if (gltf.animations.length > 0 && config.animation) {
        const animIndex = Math.min(
          config.animation.index,
          gltf.animations.length - 1
        );

        // 关键修复 1：传入第 2 参数 gltf.scene（optionalRoot），将轨道查找严格限制在当前模型子树内，避免多模型同名节点串台
        const action = mixer.clipAction(
          gltf.animations[animIndex],
          gltf.scene
        );

        // 关键修复 2：使用 ?? 而不是 ||，避免 timeScale: 0 被误改回 1
        action.timeScale = config.animation.timeScale ?? 1;
        action.loop = config.animation.loop
          ? THREE.LoopRepeat
          : THREE.LoopOnce;
        action.clampWhenFinished = !config.animation.loop;
        action.play();

        console.log(
          `${config.name} 播放动画 ${animIndex} (${gltf.animations[animIndex].name}), 可用动画数: ${gltf.animations.length}`
        );
      }
    });

    // 关键修复 3：清空模型异步加载期间累积的时间差，防止第一帧动画直接跳进数秒
    clock.getDelta();
  })
  .catch((error) => {
    console.error("模型加载失败:", error);
  });

// 利用 ES Module 动态绑定特性导出 mixer 和 clock，主文件会在 mixer 赋值后自动拿到实例
export { mixer, clock };
export default group;