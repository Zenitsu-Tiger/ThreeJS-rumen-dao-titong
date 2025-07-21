import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'

const group=new THREE.Group()
const loader=new GLTFLoader()
loader.load('./骨骼动画.glb',(gltf=>{
  console.log('查看gltf对象结构',gltf);
  group.add(gltf.scene)

// SkeletonHelper会可视化参数模型对象所包含的所有骨骼关节
  const skeletonHelper=new THREE.SkeletonHelper(gltf.scene)
  group.add(skeletonHelper)

  const bone1=gltf.scene.getObjectByName('Bone1')
  const bone2=gltf.scene.getObjectByName('Bone2')
  const bone3=gltf.scene.getObjectByName('Bone3')

  const gui=new GUI()
  gui.add(bone1.rotation,'x',0,Math.PI/6).name('关节点1')
  gui.add(bone2.rotation,'x',0,Math.PI/6).name('关节点2')
  gui.add(bone3.rotation,'x',0,Math.PI/6).name('关节点3')

  const SkinnedMesh=gltf.scene.getObjectByName('身体')
  console.log('骨骼网格模型',SkinnedMesh);
  console.log('骨架',SkinnedMesh.skeleton);
  console.log('骨架的所有关节',SkinnedMesh.skeleton.bones);
  // 根关节
  console.log('根关节',SkinnedMesh.skeleton.bones[0]);
  
  
  
}))


export default group;
