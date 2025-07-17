import * as THREE from 'three';

function createSprite(obj, state) {
  const textureLoader = new THREE.TextureLoader();

  let texture = null;
  if (state === '警告') {
    texture = textureLoader.load('./警告.png');
  } else {
    texture = textureLoader.load('./故障.png');
  }

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(5, 5, 1);
  sprite.position.y = 5 / 2;
  obj.add(sprite);
}

export default createSprite;
