// 引入Three.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const model = new THREE.Group();

const loader = new GLTFLoader();
const person = new THREE.Group();
model.add(person);
loader.load('../人.glb', function (gltf) {
  gltf.scene.scale.set(10, 10, 10);
  person.add(gltf.scene);
});

const geometry = new THREE.BoxGeometry(5, 5, 5);
geometry.translate(0, 0.2, 0);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
model.add(mesh);

// 已知条件
person.position.set(0, 0, 20); //人位置
mesh.position.set(2, 0, -30); //物体位置

// a向量:render正前方沿着z轴负半轴
const a = new THREE.Vector3(0, 0, -1);
// 人前方扇形半径
const R = 20;
// 人前方扇形角度
const angle = 60;

// 方法3：最精确的扇形绘制
function createPreciseSector() {
  const vertices = []; // 存储所有顶点的坐标
  const indices = []; // 存储三角形的顶点索引

  // 添加中心点
  vertices.push(0, 0, 0);

  // 计算扇形的顶点
  const segments = 32;
  const halfAngleRad = THREE.MathUtils.degToRad(angle / 2);

  for (let i = 0; i <= segments; i++) {
    const currentAngle = -halfAngleRad + (halfAngleRad * 2 * i) / segments;
    const x = Math.sin(currentAngle) * R;
    const z = -Math.cos(currentAngle) * R; // 注意z轴方向
    vertices.push(x, 0, z);
  }

  // 创建三角形索引
  for (let i = 0; i < segments; i++) {
    indices.push(0, i + 1, i + 2);
  }

  const sectorGeometry = new THREE.BufferGeometry();
  sectorGeometry.setIndex(indices);
  sectorGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  sectorGeometry.computeVertexNormals();

  const sectorMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });

  const sector = new THREE.Mesh(sectorGeometry, sectorMaterial);
  sector.position.copy(person.position);

  return sector;
}

// 添加扇形可视化到场景
const sectorVisualization = createPreciseSector();
model.add(sectorVisualization);

// 可选：添加扇形边界线
function createSectorOutline() {
  const points = [];
  const halfAngleRad = THREE.MathUtils.degToRad(angle / 2);

  // 左边界线
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(
    new THREE.Vector3(
      Math.sin(-halfAngleRad) * R,
      0,
      -Math.cos(-halfAngleRad) * R
    )
  );

  // 右边界线
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(
    new THREE.Vector3(
      Math.sin(halfAngleRad) * R,
      0,
      -Math.cos(halfAngleRad) * R
    )
  );

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 2,
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  lines.position.copy(person.position);

  return lines;
}

// 添加边界线
const sectorOutline = createSectorOutline();
model.add(sectorOutline);

// 人指向物体的向量
const b = mesh.position.clone().sub(person.position);
// 物体和人之间的距离
const L = b.length();
b.normalize();
// 向量a和b的夹角余弦值
const cos = a.dot(b);
const rad = THREE.MathUtils.degToRad(angle);
// 目标的角度范围的对应余弦值
const rangeCos = Math.cos(rad / 2);
if (L < R) {
  if (cos > rangeCos) {
    console.log('物体在扇形的范围内');
    // 可以改变物体颜色表示在范围内
    mesh.material.color.setHex(0x00ff00); // 绿色表示在范围内
  } else {
    console.log('物体在扇形范围外');
    mesh.material.color.setHex(0xff0000); // 红色表示在范围外
  }
} else {
  console.log('物体在扇形范围外');
  mesh.material.color.setHex(0xff0000); // 红色表示在范围外
}

export default model;
