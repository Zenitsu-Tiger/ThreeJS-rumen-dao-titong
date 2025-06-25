import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const model = new THREE.Group();
loader.load(
  "./public/工厂.glb",
  gltf => {
    const glbMd = gltf.scene;
    model.add(glbMd);
    document.getElementById("container").style.display = "none";
  },
  function (xhr) {
    const percent = xhr.loaded / xhr.total;
    console.log("加载进度", percent);

    const percentDiv = document.getElementById("per"); // 获取进度条元素
    percentDiv.style.width = percent * 400 + "px"; //进度条元素长度
    percentDiv.style.textIndent = percent * 400 + 5 + "px"; //缩进元素中的首行文本
    percentDiv.innerHTML = Math.floor(percent * 100) + "%"; //进度百分比
  }
);

export default model;
