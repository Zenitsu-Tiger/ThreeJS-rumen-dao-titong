import * as THREE from "three";
const shape=new THREE.Shape([
  new THREE.Vector2(0,0),
  new THREE.Vector2(0,10),
  new THREE.Vector2(10,10),
  new THREE.Vector2(10,0),
])
const curve=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-10,-50,-50),
  new THREE.Vector3(10,0,0),
  new THREE.Vector3(8,50,50),
  new THREE.Vector3(-5,0,100)
])
const geometry=new THREE.ExtrudeGeometry(
  shape,{
    extrudePath:curve,
    steps:100
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
  