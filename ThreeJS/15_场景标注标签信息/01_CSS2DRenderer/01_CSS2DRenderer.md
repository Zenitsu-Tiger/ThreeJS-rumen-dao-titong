# 01 · CSS2DRenderer 基础用法

在 Three.js 中，直接用 WebGL 画文字很麻烦，而 `CSS2DRenderer` 可以把普通 HTML 元素变成跟随 3D 物体的标签。本节基于 Three.js `0.174.0` 的 `index.html`、`index.js` 和 `mesh.js`，演示最基础的「网页 `<div>` → 3D 场景标签」流程。

## 路线图

1. 用 `CSS2DObject` 把 HTML 里的 `<div id="tag">` 包装成三维标签对象，放到目标坐标并加入场景。
2. 创建 `CSS2DRenderer` 覆盖在 WebGL 画布上方，在渲染循环和窗口缩放时与 `WebGLRenderer` 同步更新第 1 步放进去的标签。

---

## 1. 把 HTML 元素包装成 `CSS2DObject` 放进场景

**一句话结论**　把页面里的普通 `<div>` 传给 `new CSS2DObject(div)`，它就拥有了三维坐标（`.position`），能像普通模型一样加进场景树。

**关键参数先看清**

- `document.getElementById('tag')`：从 `index.html` 获取现成的标签元素 `<div id="tag">标签内容</div>`。
- `tag.position.set(50, 0, 50)`：给标签指定三维位置。本例立方体 `mesh` 的中心也在 `(50, 0, 50)`，所以标签正好贴在立方体中心。
- `tag.center`（默认值 `(0.5, 0.5)`）：控制标签自身的哪个点对齐到三维坐标，默认就是**标签正中心**对齐。

**最小可运行代码**（位于 `index.html` 和 `mesh.js`）

```html
<!-- index.html -->
<style>
  body { overflow: hidden; margin: 0px; }
  #tag {
    padding: 10px;
    color: #fff;
    background: rgba(25, 25, 25, 0.5);
    border-radius: 5px;
    width: 65px;
  }
</style>
<body>
  <div id="tag">标签内容</div>
  <script type="module" src="./index.js"></script>
</body>
```

```js
// mesh.js
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const geometry = new THREE.BoxGeometry(40, 40, 40);
const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(50, 0, 50);

const group = new THREE.Group();
group.add(mesh);

const div = document.getElementById('tag');
const tag = new CSS2DObject(div);
tag.position.set(50, 0, 50);
group.add(tag);

export default group;
```

`CSS2DObject` 继承自 `THREE.Object3D`，它本身在 WebGL 里不可见，只充当一个三维“锚点”。在 `index.js` 中执行 `scene.add(model)` 后，`mesh` 和 `tag` 会一起进入场景树。

**常见写法对比（正反例）**

```js
// ✅ 本节写法：mesh 和 tag 同级放进 group，各自写世界/组内坐标（适合静态演示）
mesh.position.set(50, 0, 50);
tag.position.set(50, 0, 50);
group.add(mesh, tag);

// ✅ 进阶写法：把 tag 直接挂到 mesh 下，坐标变成相对 mesh 的局部偏移（mesh 动，tag 自动跟着动）
mesh.add(tag);
tag.position.set(0, 25, 0); // 立方体高 40，y=25 刚好落在顶面上方一点
```

```css
/* ❌ 常见误区（原文档旧写法）：在 CSS 里写 transform 调整对齐点 */
#tag {
  transform: translate(-50%, -100%);
  /* 失效！CSS2DRenderer 每帧会直接覆写元素的内联 style.transform */
}
```

```js
// ✅ 正确改对齐点的方式（Three.js 0.174.0）：修改 tag.center
tag.center.set(0.5, 1); // 底边中点对齐三维坐标，文字落在坐标正上方
```

**坑**　在 CSS 里给标签写 `transform: translate(...)` 想微调对齐位置，结果完全没生效。因为 `CSS2DRenderer` 渲染时会直接覆盖 DOM 元素的内联 `style.transform`；想改对齐点，应该调 `tag.center.set(x, y)`（默认已是 `(0.5, 0.5)` 居中，不是左上角）。

---

## 2. 用 `CSS2DRenderer` 叠在画布上并同步渲染

**一句话结论**　`WebGLRenderer` 画 3D 模型，`CSS2DRenderer` 管理覆盖在画布上方的 DOM 层；两者尺寸对齐、每帧用同一台相机一起渲染，标签就能精准跟着 3D 物体走。

**关键参数先看清**

- `css2Renderer.domElement.style.position = 'absolute'` & `top = '0px'`：让标签容器脱离文档流，严丝合缝叠在 `<canvas>` 上方。
- `css2Renderer.domElement.style.pointerEvents = 'none'`：让鼠标点击和拖动穿透标签层，落到下方的 `canvas` 上（否则 `OrbitControls` 拖不动）。
- `css2Renderer.setSize(width, height)`：按页面 CSS 像素设置标签层宽高（不需要乘 `devicePixelRatio`）。

**最小可运行代码**（位于 `index.js`）

```js
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

// 1）创建并挂载 CSS2DRenderer，叠在 WebGL 画布正上方
const css2Renderer = new CSS2DRenderer();
css2Renderer.setSize(width, height);
document.body.appendChild(css2Renderer.domElement);

css2Renderer.domElement.style.position = 'absolute';
css2Renderer.domElement.style.top = '0px';
css2Renderer.domElement.style.pointerEvents = 'none';

// 2）每帧用同一台相机同步渲染 3D 场景和 HTML 标签
function render() {
  css2Renderer.render(scene, camera);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

// 3）窗口缩放时，同步更新两个渲染器尺寸
window.onresize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  css2Renderer.setSize(width, height);
};
```

**画布不在页面左上角怎么办？**
如果给 `canvas` 加了偏移（比如 `renderer.domElement.style.marginTop = '200px'`），标签层的容器也必须同步偏移（`css2Renderer.domElement.style.top = '200px'`），保证两层始终重合，否则标签和 3D 物体会整体错位。

**坑**　只把 `css2Renderer.domElement` 加进 `body`，忘了设 `position = 'absolute'` 和 `top = '0px'`，结果标签层排在画布下方看不见；或者忘了设 `pointerEvents = 'none'`，导致鼠标被标签层挡住，无法旋转视角。

---

## 了解即可 · `CSS2DRenderer` 替你省了什么？（原理与性能边界）

### 1. 手动投影 vs `CSS2DRenderer`

如果没有 `CSS2DRenderer`，要让 `<div>` 跟着 3D 物体，每帧都得自己把三维世界坐标换算成屏幕 CSS 像素坐标（刚好是上一章「射线拾取：屏幕像素 → NDC → 三维」的**逆过程**）：

```js
const canvas = renderer.domElement;
const width = canvas.clientWidth;
const height = canvas.clientHeight;

const vector = new THREE.Vector3();
// 1. 提取物体的三维世界坐标
vector.setFromMatrixPosition(mesh.matrixWorld);
// 2. 投影到相机的 NDC 空间（x, y 范围在 [-1, 1]）
vector.project(camera);
// 3. 把 NDC 换算成画布内的像素坐标
const screenX = (vector.x + 1) * width / 2;
const screenY = (-vector.y + 1) * height / 2;
```

`CSS2DRenderer` 就是把这套「世界坐标 → NDC → 屏幕像素 → 更新 DOM `transform`」的脏活全自动包办了。

### 2. 性能与交互边界

- **数量上限**：`CSS2DRenderer` 适合几十到几百个标签。如果场景里有成千上万个标注，大量 DOM 节点会拖慢页面，这时应改用基于 Canvas 纹理的 `Sprite` 或着色器文字。
- **标签自身需要点击时**：外层容器保持 `pointer-events: none`，单独给需要交互的标签元素加上 `pointer-events: auto`。

---

## 速记

| 做什么                           | 看哪一行                                                     |
| -------------------------------- | ------------------------------------------------------------ |
| 把 HTML 元素包装成 3D 标签       | `const tag = new CSS2DObject(div)`                           |
| 调整标签自身对齐点（默认正中心） | `tag.center.set(0.5, 1)`（不要用 CSS `transform`）           |
| 让标签层叠在画布上且不挡鼠标     | `position = 'absolute'`、`top = '0px'`、`pointerEvents = 'none'` |
| 每帧让标签跟随相机投影           | `css2Renderer.render(scene, camera)`                         |
| 窗口缩放同步对齐                 | `css2Renderer.setSize(width, height)`                        |

## 自测

1. 在 Three.js `0.174.0` 中，给 `<div id="tag">` 写 CSS `transform: translate(-50%, -100%)` 想让标签底部对齐物体，为什么不会生效？应该怎么改？
2. 如果把 `renderer.domElement.style.marginTop = '200px'` 往下挪了 200px，但没改 `css2Renderer.domElement.style.top`，画面会出现什么现象？
3. 本节 `mesh.js` 里 `tag` 和 `mesh` 是同级放进 `group` 的；如果之后要让立方体移动，怎样改挂载关系才能让标签自动跟着走？
4. 手动把 3D 坐标转成屏幕坐标时调用的 `vector.project(camera)`，和上一章射线拾取里的 `unproject(camera)` 是什么关系？

<details>
<summary>查看答案</summary>


1. `CSS2DRenderer` 每帧会直接覆写标签元素的内联 `style.transform`，盖掉 CSS 类里的 `transform`。正确做法是在 JS 里设置 `tag.center.set(0.5, 1)`。
2. 标签层依然停在页面顶部 `0px` 处，而 3D 画布下移了 200px，导致标签整体向上偏离立方体 200px。需要同步设置 `css2Renderer.domElement.style.top = '200px'`。
3. 改成 `mesh.add(tag)`，并把 `tag.position` 改成相对 `mesh` 中心的局部坐标（如 `(0, 0, 0)` 或顶部的 `(0, 25, 0)`）。
4. 互为逆过程：`project(camera)` 是把三维世界坐标投影成二维屏幕 NDC（用来算标签在哪显示）；`unproject(camera)` 是把点击的二维 NDC 反投影回三维世界（用来算鼠标射线方向）。

</details>