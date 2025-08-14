import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// 创建碰撞体材质
const sphereMaterial = new CANNON.Material();

// CANNON.World创建了物理世界，可以添加body，设置重力，设置物理引擎
const world = new CANNON.World();
// 设置重力，重量也是kg，所以重力是-9.8kg
world.gravity.set(0, -9.8, 0);

const groundMaterial = new CANNON.Material();
const groundBody = new CANNON.Body({
  // 设置为0始终保持静止，避免受到力的碰撞影响或者加速度影响
  mass: 0,
  shape: new CANNON.Plane(),
  material: groundMaterial,
});
// 让地面把正面朝上 沿着y轴正方向
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// 关联材质: 控制两种材质碰撞或者接触时候的碰撞接触特点
const contactMaterial = new CANNON.ContactMaterial(
  sphereMaterial,
  groundMaterial,
  {
    // 摩擦力
    friction: 0.1,
    // 弹性
    restitution: 0.2,
  }
);
world.addContactMaterial(contactMaterial);

const loader = new GLTFLoader();
const gltf = await loader.loadAsync('./hydratohedron.glb');

mesh.position.y = 5;
// mesh顶点位置数据
const pos = mesh.geometry.attributes.position;
// mesh顶点索引数据
const index = mesh.geometry.index.array;

// 所有三角形顶点位置数据
const vertices = [];
// 所有三角形面的索引值
const faces = [];

for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i);
  const y = pos.getY(i);
  const z = pos.getZ(i);
  vertices.push(new CANNON.Vec3(x, y, z));
}

for (let i = 0; i < index.length; i += 3) {
  const a = index[i];
  const b = index[i + 1];
  const c = index[i + 2];
  faces.push([a, b, c]);
}

const audio = new Audio('./xm3244.wav');
let audioEnabled = false;

// 获取提示元素
const audioPrompt = document.getElementById('audioPrompt');

// 启用音频函数
function enableAudio() {
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audioEnabled = true;
      console.log('音频已启用');
      // 隐藏提示
      if (audioPrompt) {
        audioPrompt.classList.add('hidden');
      }
    })
    .catch(err => {
      console.log('音频启用失败:', err);
    });
}

// 监听提示按钮点击
if (audioPrompt) {
  audioPrompt.addEventListener('click', enableAudio);
}
const box3 = new THREE.Box3();
box3.expandByObject(mesh);
const size = new THREE.Vector3();
box3.getSize(size);

const boxMaterial = new CANNON.Material();
const shape = new CANNON.ConvexPolyhedron({
  // 定点位置数据
  vertices: vertices,
  // 三角形面的顶点索引数据
  faces: faces,
});

// 物理小球和网格小球一一对应
const body = new CANNON.Body({
  // 碰撞体质量，单位是kg
  mass: 0.3,
  shape: shape,
  material: boxMaterial,
});
body.position.y = 5;
body.addEventListener('collide', event => {
  console.log('collide', event);
  // 获取碰撞信息
  const contact = event.contact;
  // 获取沿法线的冲击速度
  const v = contact.getImpactVelocityAlongNormal();
  console.log('碰撞速度的大小', v);

  // 只有在音频启用后才播放
  if (audioEnabled) {
    // 碰撞越狠，声音越大
    const volume = Math.min(v / 10, 1);
    audio.volume = volume;
    audio.currentTime = 0; // 重置播放位置
    audio.play().catch(err => {
      console.log('音频播放失败:', err);
    });
  }
});
// 设置箱子网格模型和物理碰撞体的初始角度
mesh.rotation.set(Math.PI / 3, Math.PI / 3, Math.PI / 3);
body.quaternion.setFromEuler(Math.PI / 3, Math.PI / 3, Math.PI / 3);
world.addBody(body);

export default mesh;
export { world, body };
