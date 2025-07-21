import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const group = new THREE.Group();
const loader = new GLTFLoader();
let mixer;
loader.load('./士兵.glb', gltf => {
  console.log('查看gltf对象结构', gltf);
  const model = gltf.scene;
  model.scale.set(50, 50, 50);
  model.rotation.y = Math.PI;
  group.add(model);

  mixer = new THREE.AnimationMixer(gltf.scene);
  // gltf.animations[0]休息
  // gltf.animations[1]跑步
  // gltf.animations[2]静止展开
  // gltf.animations[3]走路
  const IdleAction = mixer.clipAction(gltf.animations[0]);
  const RunAction = mixer.clipAction(gltf.animations[1]);
  const WalkAction = mixer.clipAction(gltf.animations[3]);

  // 设置循环模式为循环播放
  IdleAction.setLoop(THREE.LoopRepeat);
  RunAction.setLoop(THREE.LoopRepeat);
  WalkAction.setLoop(THREE.LoopRepeat);

  // 启用所有动画
  IdleAction.play();
  RunAction.play();
  WalkAction.play();

  // 初始状态：只有 Idle 可见
  IdleAction.weight = 1;
  RunAction.weight = 0;
  WalkAction.weight = 0;

  // ActionState是标记
  let ActionState = IdleAction;
  // 传统控制法
  /*   document.getElementById('Idle').addEventListener('click', () => {
    ActionState.weight = 0;
    IdleAction.weight = 1;
    ActionState = IdleAction;
  });
  document.getElementById('Run').addEventListener('click', () => {
    ActionState.weight = 0;
    RunAction.weight = 1;
    ActionState = RunAction;
  });
  document.getElementById('Walk').addEventListener('click', () => {
    ActionState.weight = 0;
    WalkAction.weight = 1;
    ActionState = WalkAction;
  }); */

  // 平滑过渡法
  function setAction(toAction) {
    if (toAction !== ActionState) {
      const prevAction = ActionState;
      ActionState = toAction;

      // 手动实现平滑过渡
      let startTime = Date.now();
      const duration = 500; // 500毫秒过渡时间

      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1); // 0到1之间

        // 权重插值
        prevAction.weight = 1 - progress; // 从1到0
        toAction.weight = progress; // 从0到1

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      animate();
    }
  }

  document.getElementById('Idle').addEventListener('click', () => {
    setAction(IdleAction);
  });
  document.getElementById('Run').addEventListener('click', () => {
    setAction(RunAction);
  });
  document.getElementById('Walk').addEventListener('click', () => {
    setAction(WalkAction);
  });
});

const clock = new THREE.Clock();
export { clock, mixer };
export default group;
