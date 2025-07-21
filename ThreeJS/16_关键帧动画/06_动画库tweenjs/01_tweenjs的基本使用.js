import * as THREE from "three";

import TWEEN from "@tweenjs/tween.js";

const geometry=new THREE.BoxGeometry(50,50,50)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff
})

const mesh=new THREE.Mesh(geometry,material)

const tween=new TWEEN.Tween(mesh.position)
tween.to({x:100,y:50,z:100},2000)
tween.start()

export {tween}
export default mesh