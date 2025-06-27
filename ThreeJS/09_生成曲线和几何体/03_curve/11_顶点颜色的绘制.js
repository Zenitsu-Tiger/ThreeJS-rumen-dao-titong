import * as THREE from "three";

// 1. 创建一个空的 BufferGeometry
// BufferGeometry 是一个高效的几何体表示，它将所有数据（如顶点位置、颜色、法线）存储在"属性"中。
const geometry = new THREE.BufferGeometry();

// 2. 定义顶点位置数据
// 创建一个 Float32Array（32位浮点数类型化数组）来存储顶点坐标。
// 数组中的数据是按顺序排列的 (x1, y1, z1, x2, y2, z2, ...)
// 这里定义了三个顶点，构成一个三角形。
const vertices = new Float32Array([
  0,
  0,
  0, // 第1个顶点坐标 (V0)
  50,
  0,
  0, // 第2个顶点坐标 (V1)
  0,
  25,
  0, // 第3个顶点坐标 (V2)
]);

// 3. 创建位置属性 (BufferAttribute)
// 将顶点数据封装成一个 BufferAttribute。
// 第二个参数 `3` 表示每组数据有3个分量（即 x, y, z 构成一个顶点）。
const attributes = new THREE.BufferAttribute(vertices, 3);

// 4. 将位置属性赋值给 geometry
// 将创建的属性命名为 "position"，并添加到 geometry 的 attributes 对象中。
// "position" 是一个特殊的名字，着色器会用它来确定顶点的位置。
geometry.attributes.position = attributes;

// 5. 定义顶点颜色数据
// 为每个顶点定义一个颜色。数据格式与顶点位置类似。
// 这里的(R, G, B)值是 0.0 到 1.0 之间的浮点数。
const colors = new Float32Array([
  1,
  0,
  0, // 第1个顶点的颜色 (红色)
  0,
  0,
  1, // 第2个顶点的颜色 (蓝色)
  0,
  1,
  0, // 第3个顶点的颜色 (绿色)
]);

// 6. 创建并赋值颜色属性
// 同样将颜色数据封装成 BufferAttribute，每组数据3个分量 (R, G, B)。
// 并将其命名为 "color" 添加到 geometry 的 attributes 中。
geometry.attributes.color = new THREE.BufferAttribute(colors, 3);

// 7. 创建材质
// 使用 PointsMaterial 或 LineBasicMaterial
const material = new THREE.LineBasicMaterial({
  // 或者 THREE.PointsMaterial
  // color: 0xffff00, // 注意：当 vertexColors 为 true 时，此处的颜色设置会失效
  // 关键！告诉材质去使用 geometry.attributes.color 中定义的顶点颜色
  vertexColors: true,
  size: 20, // 仅对 PointsMaterial 有效，定义点的大小
});

// 8. 创建网格模型 (Points 或 Line)
// const mesh = new THREE.Points(geometry, material); // 如果想显示为三个彩色的点
// Line 会将顶点按顺序连接起来，形成 V0-V1-V2 的折线
const mesh = new THREE.Line(geometry, material);

// 9. 导出模型
export default mesh;
