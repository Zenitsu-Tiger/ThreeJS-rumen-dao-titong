import * as THREE from "three";

// 精灵材质
const spriteMaterial = new THREE.SpriteMaterial({
  color: 0xffffff,
});
// 精灵模型：自带 1×1 平面，scale 是多少就是多大
const sprite = new THREE.Sprite(spriteMaterial);
// 20 × 20：配合正投影相机 s = 10（上下 20），刚好上下填满画布
sprite.scale.set(20, 20, 1); // 第三个值对平面没有影响
// 位置，默认是 (0, 0, 0)
sprite.position.set(0, 0, 0);

const group = new THREE.Group();
group.add(sprite);

export default group;
