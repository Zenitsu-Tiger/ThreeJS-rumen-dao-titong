import * as THREE from "three";

const geometry=new THREE.BoxGeometry(100,100,20)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,
  side:THREE.DoubleSide,
})

const mesh=new THREE.Mesh(geometry,material)

// 添加边缘线框来清晰显示立方体边界
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
const wireframe = new THREE.LineSegments(edges, lineMaterial);
mesh.add(wireframe);

export default mesh