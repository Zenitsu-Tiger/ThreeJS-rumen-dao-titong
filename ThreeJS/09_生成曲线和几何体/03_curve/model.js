import * as THREE from "three";

const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-50, 20, 90),
  new THREE.Vector3(-10, 40, 40),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(70, 0, 80),
]);

// 三维样条曲线
const pointsArr = path.getPoints(30);
// 参数分别代表：路径、圆管的段数、圆管的半径、圆管的圆周分段数、是否闭合
const geometry = new THREE.TubeGeometry(path, 30, 3, 8, false);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(geometry, material);

const group = new THREE.Group();
group.add(mesh);
export default group;
