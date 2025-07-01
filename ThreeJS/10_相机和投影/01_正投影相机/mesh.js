import * as THREE from "three";

const group=new THREE.Group()

const geometry=new THREE.BoxGeometry(100,100,100)
geometry.translate(0,50,0)

const material=new THREE.MeshLambertMaterial({
  color:0x00ffff
})

for(let i=-9;i<10;i++){
  for(let j=-9;j<10;j++){
    const mesh=new THREE.Mesh(geometry,material)

    mesh.position.set(i*200,0,j*200)
    group.add(mesh)
  }
}

export default group