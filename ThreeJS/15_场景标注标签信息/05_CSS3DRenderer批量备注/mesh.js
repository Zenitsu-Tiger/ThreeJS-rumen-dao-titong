import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

import {CSS3DSprite} from 'three/addons/renderers/CSS3DRenderer.js'
const geometry=new THREE.ConeGeometry(40,90,64)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff
})

const mesh=new THREE.Mesh(geometry,material)
mesh.position.set(50, 45, 50)

const group=new THREE.Group()
const div=document.getElementById('tag')
// const tag=new CSS3DObject(div)
// 精灵3D对象可以实现无论你怎么旋转,tag始终正面朝向相机
const tag=new CSS3DSprite(div)
// div.style.pointerEvents = 'none';
tag.position.y = 45+7.5+5
tag.scale.set(0.5,0.5,1)
mesh.add(tag)
// CSS3DRenderer支持你像调整模型对象一样来调整对应tag的position
// 圆锥体高度为90，圆锥体中心在Y=0，所以顶部在Y=45
// 标签底边应该与圆锥体顶部对齐

group.add(mesh)


const plane=new THREE.Mesh(new THREE.PlaneGeometry(20,10),new THREE.MeshLambertMaterial({color:0x00ffff}))
group.add(plane)
// 本地坐标
console.log('mesh.position',mesh.position);

export default group