import * as THREE from "three";
// 创建精灵材质
const spriteMaterial = new THREE.SpriteMaterial({
  color: 0xffffff,
});
// 创建精灵模型对象
const sprite = new THREE.Sprite(spriteMaterial);
// 设置精灵模型对象的缩放
sprite.scale.set(20, 20, 20);
// 设置精灵模型对象的位置，默认是0,0,0
sprite.position.set(0, 0, 0);

const group = new THREE.Group();
group.add(sprite);

export default group;
