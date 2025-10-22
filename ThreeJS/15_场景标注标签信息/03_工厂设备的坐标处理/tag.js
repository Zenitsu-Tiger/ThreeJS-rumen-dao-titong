// 引入CSS2模型对象CSS2DObject
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const div = document.getElementById('tag');
div.style.display = 'none'; // ← 初始隐藏改用 none 而不是移除这行
div.style.top = '-161px';
const tag = new CSS2DObject(div);
tag.visible = false; // ← 新增：初始设置为不可见

export default tag;
