import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { World } from 'cannon-es';

console.log('CANNON', CANNON);
console.log('World', World);

// 创建碰撞体材质
const sphereMaterial = new CANNON.Material();

// 物理小球和网格小球一一对应
const body = new CANNON.Body({
  // 碰撞体质量，单位是kg
  mass: 0.3,
  // 碰撞体的三维空间中的位置
  position: new CANNON.Vec3(0, 100, 0),
  shape: new CANNON.Sphere(10),
  material: sphereMaterial,
});
body.position.y = 100;

// CANNON.World创建了物理世界，可以添加body，设置重力，设置物理引擎
const world = new CANNON.World();
// 设置重力，重量也是kg，所以重力是-9.8kg
world.gravity.set(0, -9.8, 0);

world.addBody(body);

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
    restitution: 0.7,
  }
);
world.addContactMaterial(contactMaterial);

// 物理球体
const textureCube = new THREE.CubeTextureLoader()
  .setPath('./环境贴图4/')
  .load(['px.jpg', 'nx.jpg', 'ny.jpg', 'py.jpg', 'pz.jpg', 'nz.jpg']);

const box = new THREE.SphereGeometry(10);
const material = new THREE.MeshBasicMaterial({
  envMap: textureCube,
  colorSpace: THREE.SRGBColorSpace,
  envMapIntensity: 1,
});
const mesh = new THREE.Mesh(box, material);
mesh.position.y = 100;

export default mesh;
export { world, body };
