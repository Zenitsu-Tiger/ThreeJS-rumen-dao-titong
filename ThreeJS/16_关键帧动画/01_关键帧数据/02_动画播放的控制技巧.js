import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const group=new THREE.Group()

const geometry=new THREE.BoxGeometry(15,15,15)
const material=new THREE.MeshLambertMaterial({
  color:0xff0000
})

const mesh=new THREE.Mesh(geometry,material)
mesh.position.y+=7.5
mesh.name='Box'
group.add(mesh)

// 这里设置的是时间轴上的三个时刻0，3，6秒
const times=[0,2,4,6]
// times中三个不同时间点，物体分别对应values中的三个xyz坐标
const values=[0,7.5,0, 100,7.5,0, 0,7.5,100, 0,7.5,0]  // 注意第三个坐标组后面的逗号
// // 创建关键帧定义位移动画，把模型位置和时间对应起来
// 0~3秒，物体从(0,0,0)逐渐移动到(100,0,0),3~6秒逐渐从(100,0,0)移动到(0,0,100)
const posKF=new THREE.KeyframeTrack('Box.position',times,values)

// 修复颜色动画数据  
const colorKF = new THREE.KeyframeTrack('Box.material.color', 
    [2, 3.5, 5],         // 3个时间点  
    [1,0,0, 0.5,0,0.5, 0,0,1] // 红色→紫色→蓝色
)
// animationClip 表示的是一个关键帧动画，可以基于关键帧数据产生动画效果
// 创建一个Clip关键帧动画对象，命名test，动画持续6s
// animationClip包含的所有关键帧数据都放到了参数3数组中即可
const clip=new THREE.AnimationClip('test',6,[posKF,colorKF])
// duration是动画播放的时间，如果设置单值就是从0~6
console.log('clip.duration',clip.duration);

// 动画播放器AnimationMixer，可以播放动画Clip
const mixer=new THREE.AnimationMixer(mesh)

// 播放动画Clip
const action=mixer.clipAction(clip)

action.play()
// 设置动画时间范围和播放参数
action.clampWhenFinished=true
action.loop=THREE.LoopOnce

// 设置开始时间,这个不会被reset()重置
action.time = 3
// 设置动画播放时长,这个会被reset()重置
clip.duration=5
const clock=new THREE.Clock()

// 通过gui库来控制倍速和动画播放时间，第二个参数可以观察不同时间段的位置或变化
  const gui=new GUI()
  gui.add(action,'timeScale',0,10)
  gui.add(action,'time',0,6)
document.getElementById('play').addEventListener('click',()=>{
  action.reset().play()
})

  document.getElementById('resume').addEventListener('click',()=>{
    action.paused=false
  }) 
// paused是用于暂停的
document.getElementById('pause').addEventListener('click',()=>{
  action.paused=true
})
document.getElementById('next').addEventListener('click',()=>{
  action.time+=0.1
})
// 通过timeScale来控制动画播放速度(也就是倍速)
// 注意这里不会同步action的各个动画播放动作，也就是上面的reset().play()还是会从第0秒的位置开始


// 导出 mixer 和 clock，让主文件来控制动画更新
export { mixer, clock }
export default group