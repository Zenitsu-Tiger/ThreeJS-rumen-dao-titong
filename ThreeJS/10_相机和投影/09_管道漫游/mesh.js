import * as THREE from "three";

const group = new THREE.Group();

const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-50, 20, 90),
  new THREE.Vector3(-10, 40, 40),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(90, -40, 60),
  new THREE.Vector3(120, 30, 30),
]);

/**
 * 参数解析:
 * path: 路径曲线
 * 200: 管道分段数（影响平滑度）
 * 5: 管道半径
 * 30: 管道截面分段数（影响圆形度）
 */
const geometry = new THREE.TubeGeometry(path, 200, 5, 30);
const texLoader = new THREE.TextureLoader();
const texture = texLoader.load("./diffuse.jpg");
texture.encoding = THREE.sRGBEncoding; // ✅ 告诉 three.js 这是sRGB纹理

texture.wrapS = THREE.RepeatWrapping; // 允许纹理在S轴（水平方向）上重复

texture.repeat.x = 10;
const material = new THREE.MeshLambertMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(geometry, material);

const pointsArr = path.getSpacedPoints(500);
group.add(mesh);

export { group, pointsArr };
