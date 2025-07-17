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
const meshGroup=new THREE.Group()
meshGroup.add(mesh)

// mesh位置受到父对象局部坐标.position影响
meshGroup.position.x=-100
const group=new THREE.Group()
const div=document.getElementById('tag')
const tag=new CSS2DObject(div)
// 获取mesh的世界坐标
const worldPosition=new THREE.Vector3()
mesh.getWorldPosition(worldPosition)
// 世界坐标
console.log('worldPosition',worldPosition);
// mesh世界坐标赋值给tag,使其同步位移
tag.position.copy(worldPosition)
group.add(meshGroup)
group.add(tag)
// 本地坐标
console.log('mesh.position',mesh.position);

export default group