import * as CANNON from 'cannon-es'
import {World } from 'cannon-es'

console.log('CANNON', CANNON);
console.log('World', World);

// 1m半径球体
const bodyShape=new CANNON.Sphere(1)

// 创建body对象，代表生活中的物体
// 计算body的位置或者速度之类的参照数值
const body=new CANNON.Body({
  // 碰撞体质量，单位是kg
  mass:0.3,
  // 碰撞体的三维空间中的位置
  position:new CANNON.Vec3(0,100,0),
  shape:bodyShape
})
// CANNON.World创建了物理世界，可以添加body，设置重力，设置物理引擎
const world=new CANNON.World()
// 设置重力，重量也是kg，所以重力是-9.8kg
world.gravity.set(0,-9.8,0)
// 添加body到物理世界
world.addBody(body)

function render(){
  console.log('小球的位置',body.position.y);
  console.log('小球的速度',body.velocity.y);
  
  world.step(1/60)
  requestAnimationFrame(render)
}
render()