import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const group = new THREE.Group();

const group1 = new THREE.Group();
const group2 = new THREE.Group();
const loader = new GLTFLoader();
loader.load("./assets/工厂.glb", gltf => {
  const scene = gltf.scene;
  group1.add(scene);
});

const spriteMaterial = new THREE.SpriteMaterial({
  map: new THREE.TextureLoader().load("./assets/雨滴.png"),
});

for (let i = 0; i < 16000; i++) {
  // 共享材质，节省内存
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5, 0.5, 0.5);
  group2.add(sprite);
  // Math.random() 生成0-1的随机数，Math.random() - 0.5 生成-0.5-0.5的随机数
  sprite.position.set(
    1000 * (Math.random() - 0.5),
    1000 * Math.random(),
    1000 * (Math.random() - 0.5)
  );
}
const clock = new THREE.Clock();
function loop() {
  // loop()两次获取它的执行时间间隔
  const t = clock.getDelta();
  group2.children.forEach(sprite => {
    sprite.position.y -= t * 60;
    if (sprite.position.y < 0) {
      sprite.position.y = 600;
    }
  });
  requestAnimationFrame(loop);
}
loop();

group.add(group1);
group.add(group2);
export default group;
