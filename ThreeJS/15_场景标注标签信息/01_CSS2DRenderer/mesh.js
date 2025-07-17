import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 引入CSS2模型对象CSS2DObject
import {CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js'


const geometry=new THREE.BoxGeometry(40,40,40)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff
})

const mesh=new THREE.Mesh(geometry,material)
mesh.position.set(50,0,50)
const group=new THREE.Group()
group.add(mesh)

const div=document.getElementById('tag')
const tag=new CSS2DObject(div)
tag.position.set(50,0,50)
group.add(tag)

export default group