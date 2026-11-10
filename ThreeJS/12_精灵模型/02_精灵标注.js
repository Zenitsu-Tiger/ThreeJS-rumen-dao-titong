import * as THREE from "three";

// 立方体：100 高，整体上移 50 → 底面 y = 0，顶面 y = 100
const geometry = new THREE.BoxGeometry(25, 100, 50);
geometry.translate(0, 50, 0);
const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
const mesh = new THREE.Mesh(geometry, material);

// 光点贴图（SpriteMaterial 默认 transparent = true，png 透明部分自动隐藏）
const texture = new THREE.TextureLoader().load("./assets/光点.png");
const spriteMaterial = new THREE.SpriteMaterial({
  // color: 0x00ffff, // 打开后颜色 × 贴图，光点变青色
  map: texture,
});

// 光点：10 × 10，中心 y = 105 → 底边 105 - 5 = 100，刚好贴着立方体顶面
const sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(10, 10, 1);
sprite.position.set(0, 105, 0);

const group = new THREE.Group();
group.add(mesh);
group.add(sprite);

export default group;
