import * as THREE from 'three';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'

const group=new THREE.Group()

const gui=new GUI()

const Bone1=new THREE.Bone()
const Bone2=new THREE.Bone()
const Bone3=new THREE.Bone()

Bone1.add(Bone2)
Bone2.add(Bone3)

// 定义关节点1的位置，Bone2和Bone3也会同步平移位置
Bone1.position.set(50,0,50)

Bone2.position.y=60
Bone3.position.y=30

// 骨骼关节旋转
/* Bone1.rotateX(Math.PI/6)
Bone2.rotateY(Math.PI/6) */

// 骨骼关节可以和普通网格模型一样作为其他模型子对象，添加到场景里面
group.add(Bone1)
 gui.add(Bone1.rotation,'x',0,Math.PI/6)
 gui.add(Bone1.rotation,'y',0,Math.PI/6)
 gui.add(Bone1.rotation,'z',0,Math.PI/6)

 gui.add(Bone2.rotation,'x',0,Math.PI/6)
 gui.add(Bone2.rotation,'y',0,Math.PI/6)
 gui.add(Bone2.rotation,'z',0,Math.PI/6)

// SkeletonHelper会可视化参数模型对象所包含的所有骨骼关节
const skeletonHelper=new THREE.SkeletonHelper(group)
group.add(skeletonHelper)

export default group;
