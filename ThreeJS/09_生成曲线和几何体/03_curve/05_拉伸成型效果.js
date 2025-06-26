import * as THREE from "three";


const pointsArr=[
new THREE.Vector2(-50,-50),
new THREE.Vector2(-50,50),
new THREE.Vector2(50,50),
new THREE.Vector2(50,-50),
]

const shape=new THREE.Shape(pointsArr)

// 拉伸成型
const geometry=new THREE.ExtrudeGeometry(
  shape, //二维轮廓
  {
      // 生成拉伸的深度
    depth:120,
    // bevelThickness代表倒角垂直方向的偏移量
    bevelThickness:6,
    // bevelSize代表倒角的水平方向的偏移量
    bevelSize:16,
    // bevelSegments代表倒角分段
    bevelSegments:10,
    // bevelEnabled代表是否启用倒角
    bevelEnabled:true,
    
  }
)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,
  side:THREE.DoubleSide,
  // wireframe:true
})
const mesh=new THREE.Mesh(geometry,material)

const group = new THREE.Group();
group.add(mesh)

export default group;
  