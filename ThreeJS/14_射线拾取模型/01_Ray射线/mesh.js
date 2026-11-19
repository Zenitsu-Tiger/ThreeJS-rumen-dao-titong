import * as THREE from "three";

const group = new THREE.Group();

// 1. 三角形的三个顶点：显示与求交共用这组数据
const p1 = new THREE.Vector3(100, 25, 0);
const p2 = new THREE.Vector3(100, -25, 25);
const p3 = new THREE.Vector3(100, -25, -25);

// 2. 把三个顶点交给几何体，画出参照三角形
const vertices = new Float32Array([
  p1.x, p1.y, p1.z,
  p2.x, p2.y, p2.z,
  p3.x, p3.y, p3.z,
]);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide, // 材质的面朝向设置，不控制下面的 Ray 求交
  wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
group.add(mesh);

// 3. 定义射线：从原点沿 +X 方向无限延伸
// Ray 是计算对象，本身不会在画面中显示
const ray = new THREE.Ray();
ray.origin.set(0, 0, 0);
ray.direction.set(5, 0, 0).normalize();
console.log("射线起点：", ray.origin);
console.log("归一化后的方向：", ray.direction);

// 4. 不剔除背面：正面或背面射入都参与求交
// point 是保存交点的容器；result 才是本次是否命中的返回结果
const point = new THREE.Vector3();
const result = ray.intersectTriangle(p1, p2, p3, false, point);
console.log("不剔除背面时的交点：", result);

// 5. 剔除背面：只接受从三角形正面射入
// 单独使用一个容器，避免后一次计算覆盖前一次保存的交点
const frontPoint = new THREE.Vector3();
const frontResult = ray.intersectTriangle(p1, p2, p3, true, frontPoint);
console.log("剔除背面时的交点：", frontResult);

export default group;
