import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const gui = new GUI();

// 创建一个长方体
const geometry = new THREE.BoxGeometry(10, 10, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);

export default mesh;
