import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(15, 15, 15);
const material = new THREE.MeshLambertMaterial({
  color: 0xff0000,
});

const mesh = new THREE.Mesh(geometry, material);
mesh.position.y += 7.5; // 立方体高 15，上移 7.5 使底面刚好贴在 y=0 地面上
mesh.name = "Box";
group.add(mesh);

// 时间轴上的 4 个关键时刻：0、2、4、6 秒
const times = [0, 2, 4, 6];
// 与 times 一一对应的 4 组 (x, y, z) 坐标（长度 = 4 * 3 = 12）
// 0~2s: (0,7.5,0) -> (100,7.5,0)
// 2~4s: (100,7.5,0) -> (0,7.5,100)
// 4~6s: (0,7.5,100) -> (0,7.5,0)
const values = [0, 7.5, 0, 100, 7.5, 0, 0, 7.5, 100, 0, 7.5, 0];
const posKF = new THREE.KeyframeTrack("Box.position", times, values);

// 颜色关键帧轨道：RGB 范围均为 0~1（红色 -> 紫色 -> 蓝色）
const colorKF = new THREE.KeyframeTrack(
  "Box.material.color",
  [2, 3.5, 5],
  [1, 0, 0, 0.5, 0, 0.5, 0, 0, 1]
);

// 将多个轨道打包成一个动画剪辑，初始总时长 6 秒
const clip = new THREE.AnimationClip("test", 6, [posKF, colorKF]);
console.log("clip.duration", clip.duration);

// 动画播放器（混合器），绑定目标根对象 mesh
const mixer = new THREE.AnimationMixer(mesh);

// 生成动画动作控制器并开始播放
const action = mixer.clipAction(clip);
action.play();

// 只播放一次，且结束后停留在最后一帧
action.clampWhenFinished = true;
action.loop = THREE.LoopOnce;

// 设置初始播放起点为第 3 秒（注意：action.reset() 会把 action.time 重置为 0）
action.time = 3;
// 将剪辑播放时长截断为 5 秒（注意：action.reset() 不会重置 clip.duration）
clip.duration = 5;

const clock = new THREE.Clock();

// 通过 lil-gui 实时调节倍速与查看/拖动当前播放时间
const gui = new GUI();
gui.add(action, "timeScale", 0, 10);
gui.add(action, "time", 0, clip.duration).listen();

document.getElementById("play").addEventListener("click", () => {
  // reset() 会把 action.time 清零，因此点击后将从 0 秒播到 5 秒
  action.reset().play();
});

document.getElementById("resume").addEventListener("click", () => {
  action.paused = false;
});

document.getElementById("pause").addEventListener("click", () => {
  action.paused = true;
});

document.getElementById("next").addEventListener("click", () => {
  action.time += 0.1;
});

// 导出 mixer 和 clock，交给 index.js 的渲染循环每帧更新
export { mixer, clock };
export default group;