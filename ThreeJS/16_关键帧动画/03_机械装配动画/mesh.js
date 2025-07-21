import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
const loader = new GLTFLoader();

const group = new THREE.Group();
// THREE.CubeTextureLoader 是 three.js 中专门用来加载立方体贴图的加载器。
const textureCube = new THREE.CubeTextureLoader()
  .setPath('./环境贴图/')
  .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
// 大多数图片文件（如 .jpg, .png）都是以 sRGB 格式存储的。
// 显式地告诉 three.js 使用 sRGB 编码，可以确保渲染器在进行光照计算时能正确处理颜色，从而让最终渲染出的画面色彩更加逼真和物理准确。
textureCube.encoding = THREE.sRGBEncoding;

// 声明一个动画混合器变量，用于管理和播放动画
let mixer = null;
loader.load('./机械装配动画.glb', gltf => {
  gltf.scene.traverse(child => {
    if (child.isMesh) {
      child.material.metalness = 1.0;
      child.material.roughness = 0.35;
      child.material.envMap = textureCube;
      child.material.envMapIntensity = 0.5;
    }
  });
  group.add(gltf.scene);

  // 1. 创建动画混合器(AnimationMixer)
  // AnimationMixer是动画的播放器，它控制着整个动画的播放、暂停、速度等。
  // 它需要一个包含动画数据的对象作为参数，这里是加载的gltf场景。
  mixer = new THREE.AnimationMixer(gltf.scene);

  // 2. 获取动画剪辑(AnimationClip)
  // gltf.animations是一个数组，包含了模型文件中所有的动画数据。
  // 每一个元素都是一个AnimationClip对象，可以理解为一个完整的动画片段。
  // 这里我们获取第一个动画剪辑。
  const clip = gltf.animations[0];
  // 获取动画的总时长
  const duration = clip.duration;
  // 3. 创建动画动作(AnimationAction)
  // clipAction方法通过混合器(mixer)和动画剪辑(clip)来创建一个AnimationAction。
  // AnimationAction是动画的具体控制器，你可以用它来播放(.play())、暂停(.paused)、停止(.stop())等。
  const clipAction = mixer.clipAction(clip);

  // 4. 播放动画
  // 调用play()方法，动画就会开始播放。
  clipAction.play();
  clipAction.loop = THREE.LoopOnce;

  // 获取各个按钮元素
  const resumeBtn = document.getElementById('resume');
  const pauseBtn = document.getElementById('pause');
  const playBtn = document.getElementById('play');
  const nextBtn = document.getElementById('next');

  // 恢复按钮
  resumeBtn.addEventListener('click', () => {
    clipAction.paused = false;
    console.log('动画恢复');
  });

  // 暂停按钮
  pauseBtn.addEventListener('click', () => {
    clipAction.paused = true;
    console.log('动画暂停');
  });

  // 播放按钮
  playBtn.addEventListener('click', () => {
    clipAction.reset(); // 重置动画到开始位置
    clipAction.play();
    console.log('动画重新播放');
  });

  // 下一步按钮（可以根据需要实现具体功能）
  nextBtn.addEventListener('click', () => {
    // 例如：跳到动画的下一个关键帧
    console.log('下一步功能待实现');
  });

  const gui = new GUI();
  gui.add(clipAction, 'timeScale', 0, 2).step(0.1).name('倍速');
  gui
    .add(clipAction, 'time', 0, duration)
    .step(0.1)
    .name('进度')
    .onChange(() => {
      if (!clipAction.paused) {
        clipAction.paused = true;
      }
    });
});

// 创建一个时钟对象，用于跟踪时间
// 动画的更新需要依赖于时间的流逝，Clock可以很方便地获取前后两帧之间的时间差。
const clock = new THREE.Clock();

// 导出 mixer 和 clock，让主文件(index.js)的渲染循环来控制动画更新
export { mixer, clock };
export default group;
