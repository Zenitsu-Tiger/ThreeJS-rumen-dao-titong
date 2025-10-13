import * as THREE from 'three'

const geometry=new THREE.BoxGeometry(50,50,50)


const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,
})
const mesh=new THREE.Mesh(geometry,material)
// 采用geometry移动会导致局部坐标原点仍然在(0,0,0)
geometry.translate(50/2,0,0)
// 采用position设置会导致局部坐标原点移动到(50/2,0,0)
// mesh.position.set(50/2,0,0)
 mesh.rotateY(Math.PI/4)
export default mesh 