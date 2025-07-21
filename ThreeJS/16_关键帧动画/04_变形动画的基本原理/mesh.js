import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const loader = new GLTFLoader();
const group = new THREE.Group();
let mixer;
loader.load('./人.glb', gltf => {
  const mesh = gltf.scene.children[0];
  // 获取所有变形目标的顶点数据
  const tArr = mesh.geometry.morphAttributes.position;
  console.log('所有变形目标', tArr);
  console.log('所有权重', mesh.morphTargetInfluences);
  // 每个变形目标对应的含义(注意需要和变形目标对应起来)
  const nameArr = ['变胖', '丰乳肥臀', '增肌', '年龄', '变瘦'];
  group.add(mesh);

  const gui = new GUI();
  const obj = {};
  for (let i = 0; i < tArr.length; i++) {
    obj['t' + i] = 0;
    gui
      .add(obj, 't' + i, 0, 1)
      .name(nameArr[i])
      .onChange(v => {
        mesh.morphTargetInfluences[i] = v;
      });
  }
});
const clock = new THREE.Clock();
export { mixer, clock };
export default group;
