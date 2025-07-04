import * as THREE from "three";

const geometry = new THREE.BoxGeometry(25, 100, 50);
const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
geometry.translate(0, 50, 0);
const mesh = new THREE.Mesh(geometry, material);

const texture = new THREE.TextureLoader().load("./assets/光点.png");
const spriteMaterial = new THREE.SpriteMaterial({
  // color: 0x00ffff,
  map: texture,
});
const sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(10, 10, 1);
sprite.position.set(0, 105, 0);

const group = new THREE.Group();

group.add(mesh);
group.add(sprite);

export default group;
