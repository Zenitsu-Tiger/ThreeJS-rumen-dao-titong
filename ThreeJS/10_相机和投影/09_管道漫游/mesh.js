import * as THREE from "three";

const group = new THREE.Group();

// 1. 路线：穿过 6 个点的平滑曲线（总长约 371.6）
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-50, 20, 90),
  new THREE.Vector3(-10, 40, 40),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(90, -40, 60),
  new THREE.Vector3(120, 30, 30),
]);

/**
 * 2. 管道几何体
 * path: 路径曲线
 * 200: 沿路线分段数（越多弯道越平滑）
 * 5:   管道半径（周长约 31.4）
 * 30:  圆周分段数（越多越圆）
 */
const geometry = new THREE.TubeGeometry(path, 200, 5, 30);

// 3. 砖墙贴图
const texLoader = new THREE.TextureLoader();
const texture = texLoader.load("./diffuse.jpg");
texture.colorSpace = THREE.SRGBColorSpace; // 新版写法：颜色贴图标记为 sRGB（旧的 encoding 已失效）
texture.wrapS = THREE.RepeatWrapping;      // 允许横向（沿管道长度）重复
texture.repeat.x = 10;                     // 重复 10 次：每张约 37.2 长，接近周长 31.4，砖块比例正常

const material = new THREE.MeshLambertMaterial({
  map: texture,
  side: THREE.DoubleSide, // 相机在管道内部，看到的是背面，必须双面
});
const mesh = new THREE.Mesh(geometry, material);
group.add(mesh);

// 4. 路线上 501 个等距点（分 500 段，相邻点间距约 0.74），供相机漫游
const pointsArr = path.getSpacedPoints(500);

export { group, pointsArr };
