# 使用 CSS2DRenderer 在 Three.js 场景中添加 HTML 标签

在 Three.js 项目中，我们经常需要在 3D 场景中的特定物体上显示标签、名称或信息面板。直接使用 WebGL 绘制文本比较复杂，而 `CSS2DRenderer` 提供了一种优雅的解决方案：**将普通的 HTML 元素作为标签，并让它自动跟随 3D 物体**。

这份笔记将详细介绍 `CSS2DRenderer` 的作用、原理和完整使用方法。

### 1️⃣ 为什么需要 CSS2DRenderer？—— 坐标转换的挑战

要把一个 HTML 元素（比如 `<div>`）精确定位到 3D 场景中某个物体的位置，我们需要解决一个核心问题：**如何将物体的三维世界坐标 (x, y, z) 转换为屏幕上的二维像素坐标 (left, top)？**

手动计算这个过程相当繁琐，步骤如下：

1.  **获取物体的世界坐标**：从物体的 `matrixWorld` 中提取。
2.  **投影到相机**：将世界坐标投影到相机的裁剪空间，得到归一化设备坐标 (NDC)，其 x, y 值的范围都在 `[-1, 1]` 之间。
3.  **转换为屏幕坐标**：将 NDC 坐标映射到屏幕的像素坐标。

手动实现的示例代码：
```javascript
// 假设有 mesh, camera 和 renderer
const canvas = renderer.domElement;
const width = canvas.clientWidth;
const height = canvas.clientHeight;

const vector = new THREE.Vector3();
// 1. 获取物体的世界坐标
vector.setFromMatrixPosition(mesh.matrixWorld);

// 2. 将世界坐标投影到 NDC 坐标
vector.project(camera);

// 3. 将 NDC 坐标转换为屏幕像素坐标
const screenX = (vector.x + 1) * width / 2;
const screenY = (-vector.y + 1) * height / 2;

// 4. 应用到 HTML 元素
const labelElement = document.getElementById('my-label');
labelElement.style.position = 'absolute';
labelElement.style.left = `${screenX}px`;
labelElement.style.top = `${screenY}px`;
```
你还需要在每一帧都重复这个计算来更新标签位置，并处理窗口大小变化等情况，非常麻烦。

### 2️⃣ CSS2DRenderer 如何简化工作？

`CSS2DRenderer` 就是为了自动化上述所有步骤而设计的。它是一个特殊的渲染器，与 `WebGLRenderer` 并行工作：
*   `WebGLRenderer` 负责在 `<canvas>` 中绘制 3D 场景。
*   `CSS2DRenderer` 负责管理一个覆盖在 `canvas` 上方的 `<div>` 层，并在这个层里定位你的 HTML 标签。

它为你做好了所有事：
- **自动坐标转换**：在每一帧自动完成“世界坐标 -> NDC -> 屏幕坐标”的转换。
- **自动更新 DOM**：自动更新 HTML 标签元素的 CSS `transform` 属性来定位。
- **场景集成**：你可以像操作普通 3D 物体一样，将 HTML 标签（包装在 `CSS2DObject` 中）添加到场景图（`scene`）或任何 `Object3D` 对象中。

### 3️⃣ 完整实践指南

下面是一个完整的示例，展示如何在一个场景中为一个立方体添加一个 HTML 标签。我将为你补充 `index.html` 和 `index.js` 的完整代码。

#### **步骤 1: 准备 HTML 文件 (`index.html`)**

我们需要一个容器来放置渲染结果，以及一个用作标签的 `div` 元素。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Three.js CSS2DRenderer 示例</title>
    <style>
        body { margin: 0; overflow: hidden; }
        #container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        canvas { display: block; }
        /* 标签的样式 */
        .label {
            color: #FFF;
            font-family: sans-serif;
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 4px;
            /* 通过 transform 实现居中，让标签的中心点和模型位置对齐 */
            transform: translate(-50%, -100%); 
        }
    </style>
</head>
<body>
    <!-- WebGL 和 CSS2D 的渲染容器 -->
    <div id="container"></div>

    <!-- 这是我们将要用作标签的 HTML 元素，初始时可以隐藏 -->
    <div id="tag" class="label" style="position: absolute; display: none;">
        这是一个立方体<br>
        (BoxGeometry)
    </div>

    <script type="module" src="/index.js"></script>
</body>
</html>
```

#### **步骤 2: 创建 3D 物体和标签 (`mesh.js`)**

你的 `mesh.js` 写得不错，我做了一些微调，使其更符合最佳实践：将标签作为子对象添加到 `mesh` 上，并设置其相对位置。

```javascript
import * as THREE from 'three';
// 引入CSS2DObject
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// 创建一个立方体
const geometry = new THREE.BoxGeometry(40, 40, 40);
const material = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 20, 0); // 将立方体放在地面上

// --- 创建标签 ---
// 1. 获取 HTML 元素
// 注意：此时 document 可能还未完全加载，推荐在主JS文件中获取DOM
const div = document.createElement('div');
div.className = 'label';
div.textContent = '这是一个立方体';

// 2. 将 HTML 元素包装成 CSS2DObject
const label = new CSS2DObject(div);

// 3. 将标签作为子元素添加到网格模型上
mesh.add(label);

// 4. 设置标签的相对位置
// 默认位置是 (0,0,0)，在物体中心。我们把它移到物体正上方。
// 因为立方体高度是40，所以中心点在y=20处，我们再往上移动一点
label.position.set(0, 25, 0);

export default mesh;
```
**改进点**：通过 `mesh.add(label)`，标签就会自动跟随 `mesh` 的移动、旋转和缩放。`label.position` 是相对于 `mesh` 的局部坐标，这样管理更方便。

#### **步骤 3: 设置主场景和渲染器 (`index.js`)**

这里我为你补全了 `index.js` 的代码，它负责初始化整个三维世界和两个渲染器。

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 引入 CSS2DRenderer
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import cube from './mesh.js'; // 我们称之为 cube 更贴切

// 1. 场景
const scene = new THREE.Scene();
scene.add(cube);

// 添加地面
const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);


// 添加一些辅助元素
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);

// 2. 相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
camera.position.set(150, 100, 150);
camera.lookAt(scene.position);

// 3. WebGL 渲染器 (用于 3D 场景)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x222222);

// 4. CSS2D 渲染器 (用于 HTML 标签)
const css2DRenderer = new CSS2DRenderer();
css2DRenderer.setSize(width, height);
css2DRenderer.domElement.style.position = 'absolute';
css2DRenderer.domElement.style.top = '0px';
css2DRenderer.domElement.style.pointerEvents = 'none'; // 避免遮挡鼠标对3D场景的操作

// 5. 将渲染器挂载到页面
const container = document.getElementById('container');
container.appendChild(renderer.domElement);
container.appendChild(css2DRenderer.domElement);

// 6. 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render);

// 7. 渲染循环
function render() {
    // WebGLRenderer 和 CSS2DRenderer 都需要在每一帧中渲染
    renderer.render(scene, camera);
    css2DRenderer.render(scene, camera);
}

// 首次渲染
render();

// 监听窗口变化，自适应调整
window.onresize = function () {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
    css2DRenderer.setSize(newWidth, newHeight);
    render();
};
```

### 4️⃣ 核心类回顾

-   `CSS2DRenderer`:
    -   一个独立的渲染器，管理 HTML 元素的 2D 渲染层。
    -   它的 `.domElement` 是一个 `<div>`，必须被添加到你的页面容器中，并覆盖在 `WebGLRenderer` 的 `canvas` 之上。
    -   `.setSize()` 方法需要与 `WebGLRenderer` 的尺寸同步。

-   `CSS2DObject`:
    -   继承自 `THREE.Object3D`，因此它拥有 `.position`, `.rotation`, `.scale` 等属性，可以被添加到场景图的任何节点中。
    -   它的构造函数接收一个 HTML DOM 元素作为参数：`new CSS2DObject(myDiv)`。
    -   这个对象本身在 3D 场景中不可见，它只是一个“锚点”，`CSS2DRenderer` 用它的位置来定位对应的 HTML 元素。

### 5️⃣ 技巧与注意事项

-   **标签居中**：默认情况下，HTML 元素的左上角会与 3D 坐标点对齐。如果你希望标签的中心与 3D 点对齐，可以使用 CSS 的 `transform`。例如，`transform: translate(-50%, -50%)` 会让标签完全居中。`transform: translate(-50%, -100%)` 则常用于将标签放在物体正上方，使其底部中心对齐。
-   **性能**：`CSS2DRenderer` 非常适合用于少量（几十到几百个）的标签。但如果标签数量非常多（成千上万），大量的 DOM 元素可能会导致页面性能下降。在这种情况下，需要考虑使用基于纹理的文本渲染方案。
-   **鼠标事件**：`CSS2DRenderer` 的 `div` 层会覆盖在 `canvas` 上。为了不影响 `OrbitControls` 或其他对 `canvas` 的鼠标操作，通常需要设置 `pointer-events: none;`。如果你的标签需要交互（如点击），则需要更复杂的事件处理策略，比如在标签上启用 `pointer-events: auto;`，并处理事件冒泡。
