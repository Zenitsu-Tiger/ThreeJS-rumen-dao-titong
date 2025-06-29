import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'


const loader=new GLTFLoader()

const model =new THREE.Group()

loader.load("./assets/地形.glb",(gltf)=>{
  // mesh是模型中的第一个网格对象
  const mesh=gltf.scene.children[0]
  if(mesh.material){
mesh.material.vertexColors=true
  }
  // 获取网格对象的顶点位置
  const pos=mesh.geometry.attributes.position
  // 几何体顶点数量
  const count =pos.count 
  // 获取第一个顶点的x座标
  const x=pos.getX(0)
  console.log('x',x);
  
  const yArr=[]
 for(let i=0;i<count;i++){
  const y=pos.getY(i)
  // 增加顶点y座标的高度
  // pos.setY(i,y*2)
  yArr.push(y)
 }

 yArr.sort()

 const miny=yArr[0]
 const maxy=yArr[yArr.length-1]

 const height=maxy-miny
 
 const colorsArr=[]
//  山谷颜色
 const color1=new THREE.Color(0x0000ff)
//  山腰颜色
 const color2=new THREE.Color(0x00ff00)
//  山顶颜色
 const color3=new THREE.Color(0xff0000)
let c=null
 for(let i=0;i<count;i++){
  const percent=(pos.getY(i)-miny)/height
  if(percent<0.5){
    c=color1.clone().lerp(color2,percent*2)
  }else{
    c=color2.clone().lerp(color3,(percent-0.5)*2)
  }
  colorsArr.push(c.r,c.g,c.b)
 }

 const colors=new Float32Array(colorsArr)

 mesh.geometry.attributes.color=new THREE.BufferAttribute(colors,3 )
 model.add(mesh)
})


// 9. 导出模型
export default model;
