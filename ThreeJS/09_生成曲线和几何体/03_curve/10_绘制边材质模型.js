import * as THREE from "three";

// 1. 创建一个立方体几何体 (BoxGeometry)
// BoxGeometry 定义了一个长宽高均为 50 的立方体的形状数据（顶点位置、面等）
// const geometry = new THREE.BoxGeometry(50, 50, 50);
const geometry = new THREE.CylinderGeometry(60, 60, 100, 30);

// 2. 创建一个网格材质 (MeshLambertMaterial)
// MeshLambertMaterial 是一种对光照有反应的材质（非光亮表面）
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff, // 设置材质颜色为青色 (cyan)
  /*   transparent: true, // 开启透明效果
  opacity: 0.5, // 设置透明度为 50% */
});

// 3. 创建一个网格模型 (Mesh)
// Mesh 是一个可见的物体，它由几何体（形状）和材质（外观）组成
const mesh = new THREE.Mesh(geometry, material);

// 4. 从立方体几何体中提取边缘 (EdgesGeometry)
// EdgesGeometry 会分析传入的 geometry，并只保留所有边的信息，生成一个新的几何体
// 这个新的几何体只包含顶点和足以绘制所有边框线的索引
// 第二个参数是阈值角度
const edges = new THREE.EdgesGeometry(geometry, 1);

// 5. 创建用于绘制线条的材质 (LineBasicMaterial)
// LineBasicMaterial 是一种简单的、不受光照影响的线材质
const edgesMaterial = new THREE.LineBasicMaterial({
  color: 0x00ffff, // 设置线条颜色为青色，与立方体颜色相同
});

// 6. 创建线段模型 (LineSegments)
// LineSegments 用于将一系列的顶点两两相连绘制成线段
// 这里它会使用 edges 中定义的边框信息和 edgesMaterial 的材质来创建可见的边框
const line = new THREE.LineSegments(edges, edgesMaterial);

// 7. 将线框添加到立方体网格中
// 将 line 作为 mesh 的子对象，这样它们会一起移动、旋转和缩放
mesh.add(line);

// 8. 导出整个组合对象
// 导出的 mesh 对象包含了半透明的立方体以及它的边框线
export default mesh;
