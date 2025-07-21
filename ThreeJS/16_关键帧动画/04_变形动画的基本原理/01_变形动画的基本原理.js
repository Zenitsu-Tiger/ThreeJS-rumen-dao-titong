import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
const geometry = new THREE.BoxGeometry(50, 50, 50);
const target1 = new THREE.BoxGeometry(50, 200, 50).attributes.position;
const target2 = new THREE.BoxGeometry(10, 50, 10).attributes.position;
// 几何体顶点变形目标数据，可以设置一组或多组
geometry.morphAttributes.position = [target1, target2];

const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});

const mesh = new THREE.Mesh(geometry, material);
mesh.name = 'Box';

const KF1 = new THREE.KeyframeTrack(
  'Box.morphTargetInfluences[0]',
  [0, 5],
  [0, 1]
);
const KF2 = new THREE.KeyframeTrack(
  'Box.morphTargetInfluences[1]',
  [5, 10],
  [0, 1]
);
// 参数二：动画时长
const clip = new THREE.AnimationClip('test', 10, [KF1, KF2]);

const mixer = new THREE.AnimationMixer(mesh);

const clipAction = mixer.clipAction(clip);

clipAction.play();

clipAction.loop = THREE.LoopOnce;
clipAction.clampWhenFinished = true;

const clock = new THREE.Clock();
// 基本原理
/* mesh.morphTargetInfluences[0] = 1;
mesh.morphTargetInfluences[1] = 1; */
/* const obj = {
  // 目标1和2的权重系数
  t1: 0,
  t2: 0,
};
const gui = new GUI();
gui
  .add(obj, 't1')
  .min(0)
  .max(1)
  .step(0.01)
  .name('变形目标1')
  .onChange(v => {
    // 变形目标1对物体形状影响权重
    mesh.morphTargetInfluences[0] = v;
  });
gui
  .add(obj, 't2')
  .min(0)
  .max(1)
  .step(0.01)
  .name('变形目标2')
  .onChange(v => {
    // 变形目标1对物体形状影响权重
    mesh.morphTargetInfluences[1] = v;
  }); */
export { mixer, clock };
export default mesh;
