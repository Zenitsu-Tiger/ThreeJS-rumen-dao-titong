import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const group = new THREE.Group();

// ---------- 工厂模型 ----------
const factoryGroup = new THREE.Group();
const loader = new GLTFLoader();
loader.load("./assets/工厂.glb", (gltf) => {
  factoryGroup.add(gltf.scene);
});

// ---------- 雨滴 ----------
const rainGroup = new THREE.Group();

const RAIN_COUNT = 16000; // 雨滴数量
const RAIN_AREA = 1000; // 下雨区域：x、z 方向各 1000 宽（-500 ~ 500）
const RAIN_TOP = 600; // 雨滴最高高度：出生和重生都用这个值
const RAIN_SPEED = 60; // 下落速度：每秒 60 个单位

// 所有雨滴共享一个材质，节省内存
const spriteMaterial = new THREE.SpriteMaterial({
  map: new THREE.TextureLoader().load("./assets/雨滴.png"),
});

for (let i = 0; i < RAIN_COUNT; i++) {
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5, 0.5, 1); // 精灵默认 1×1，缩放后就是 0.5×0.5
  // Math.random() - 0.5 → -0.5 ~ 0.5，乘 1000 → -500 ~ 500
  sprite.position.set(
    RAIN_AREA * (Math.random() - 0.5),
    RAIN_TOP * Math.random(), // 0 ~ 600
    RAIN_AREA * (Math.random() - 0.5)
  );
  rainGroup.add(sprite);
}

// 每帧下落：距离 = 速度 × 两帧之间的秒数
const clock = new THREE.Clock();
function loop() {
  const t = clock.getDelta(); // 距离上一次调用过了多少秒
  rainGroup.children.forEach((sprite) => {
    sprite.position.y -= t * RAIN_SPEED;
    if (sprite.position.y < 0) {
      sprite.position.y = RAIN_TOP; // 落到地面，回到顶部重新下
    }
  });
  requestAnimationFrame(loop);
}
loop();

group.add(factoryGroup);
group.add(rainGroup);
export default group;
