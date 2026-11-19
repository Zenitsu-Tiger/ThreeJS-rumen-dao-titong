# glTF 工厂发光描边：选择设备、颜色输出与抗锯齿

## 路线图

1. **按名字选择工厂设备并描边**：沿用上一节的 `OutlinePass`，把固定的 `[mesh]` 换成点击时查到的设备对象。
2. **OutputPass 与输出颜色空间**：让上一步得到的工厂和描边以正确的颜色显示，补清上一节的颜色转换。
3. **FXAA 抗锯齿**：在上一步完成颜色转换的图像上，平滑呈台阶状的边缘。
4. **分辨率、像素比与窗口变化**：为上一步提供准确的像素采样距离，让窗口变化后抗锯齿仍然正确。
5. **FXAA 与 SMAA（了解即可）**：基于前面的抗锯齿需求，认识另一种方案及其取舍。

配套文件：`index.html`、`mesh.js`、`index.js`、`assets/工厂.glb`；本章使用 `three@0.174.0`。

运行配套工程时，通过本地 HTTP 服务打开 `index.html`。下文的最小代码均接在这个工程已有的场景、相机和渲染器基础上，不是单独的完整 HTML 页面。

沿用上一节的两个概念：

- **后处理**：场景画成图像以后，再加工这张图像。
- **通道（Pass）**：后处理流水线上的一道工序，通常接收上一道的图像，处理后交给下一道。

本章按 `addPass()` 的先后顺序执行：

`RenderPass（画原图）→ OutlinePass（叠描边）→ OutputPass（转换输出颜色）→ FXAA（平滑边缘）`

---

## 1. 点按钮，给 glTF 工厂里的设备描边

**一句话结论：从工厂中按名字找到设备，把它放进 `selectedObjects` 数组，下一帧就会给该设备描边。**

> 📷 待补截图：同一视角下点击“设备A”和“设备B”的对比，拉近罐体，清楚展示青色描边从一台设备切换到另一台。

### 最小代码

`mesh.js`：先建立容器，模型加载完成后再装进去。

```js
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const group = new THREE.Group();
const loader = new GLTFLoader();

loader.load("./assets/工厂.glb", (gltf) => {
  group.add(gltf.scene);
});

export default group;
```

`index.js`：复用已创建并加入流水线的 `outlinePass`。

```js
import group from "./mesh.js";

scene.add(group);

function selectDevice(name) {
  const obj = group.getObjectByName(name);
  if (!obj) return;
  outlinePass.selectedObjects = [obj];
}

document.getElementById("A").addEventListener("click", () => selectDevice("设备A"));
document.getElementById("B").addEventListener("click", () => selectDevice("设备B"));

function render() {
  composer.render();
  requestAnimationFrame(render);
}
render();
```

### 为什么这样写

**`loader.load(...)` 与 `export default group`：先拿到容器，稍后才拿到模型。**

异步加载就是“发起加载后继续执行其他代码，资源准备好后再执行回调”。这里的回调是 `(gltf) => { ... }`，会在模型加载成功后执行。

`gltf.scene` 是加载结果中的场景根对象，工厂的部件都挂在它下面。

模块导出的是同一个 `group` 对象。`scene.add(group)` 可以先把空容器放进场景；之后 `group.add(gltf.scene)` 把工厂装进容器，它也就进入了场景，不需要再执行一次 `scene.add()`。

这意味着：**按钮已经能点击时，工厂可能还没加载完成。**

**`getObjectByName(name)`：按模型内部的名称查找。**

它从当前对象开始，向下查找子孙对象，返回第一个 `name` 完全相等的对象；找不到则返回 `undefined`，表示没有结果。

这些名字保存在模型文件中。本章的 `工厂.glb` 中确实有 `设备A`、`设备B`，也有 `设备A标注`、`设备B标注`；完全匹配名称，因此查找 `设备A` 不会误选 `设备A标注`。

网格（Mesh）是由几何形状和材质组成的可绘制对象。设备节点自身不带网格，而是像“文件夹”一样挂着组成设备的子对象。把这个父节点放进描边名单，`OutlinePass` 会遍历其下的网格，让整台设备一起参与描边，无需逐个选择零件。

**`if (!obj) return`：模型没准备好时，跳过本次选择。**

`!obj` 在没找到对象时成立，`return` 只结束这次 `selectDevice()` 调用，不会停止渲染循环。模型稍后加载完成，再点击按钮就能选中。

**`selectedObjects = [obj]`：修改名单，不直接触发绘制。**

方括号表示数组，因为 `selectedObjects` 接收的是一份物体名单。每次赋值都会替换旧名单，所以本例是单选：点击设备B后，设备A不再描边。

赋值后的显示过程，每步如下：

1. 点击按钮，运行 `selectDevice()`。
2. 按名字找到设备，更新 `selectedObjects`。
3. 下一次 `composer.render()` 执行，`OutlinePass` 按新名单重新画描边。
4. 新画面显示到屏幕上。

`requestAnimationFrame(render)` 会安排下一次绘制。**即使不点击，配套代码也一直在绘制；点击只是改变下一帧使用的数据。** 如果没有持续的渲染循环，修改名单后需要手动调用 `composer.render()` 才会显示变化。

**按钮 ID 与模型名称分工不同。**

`getElementById("A")` 找的是网页中的按钮；`selectDevice("设备A")` 传入的是模型内部的名字。`addEventListener("click", ...)` 把两者连接起来：按钮被点击时，才执行选择函数。

### 坑：模型未加载完成，把 `[undefined]` 传给描边通道

假如删掉 `if (!obj) return`，本例可能出现下面的连锁问题：

1. 工厂还未加载完成，查找设备返回 `undefined`。
2. 代码仍执行赋值，名单变成 `[undefined]`。
3. `OutlinePass` 绘制时尝试遍历这个无效对象，发生异常。
4. 异常从 `composer.render()` 抛出。
5. 本例把 `requestAnimationFrame(render)` 写在它后面，发生异常后无法执行到这一行。
6. 下一帧没有被安排，渲染循环中断；工厂后来即使装进场景，画面也不会更新。

因此，这个判断是在**保护渲染循环**。网络慢时更容易触发；名字写错时同样查不到对象，也要检查模型名称。

**承接上一节：`OutlinePass` 的用法没变；变化的是选中对象从固定的 `[mesh]`，变成点击时查找并更新的 `[obj]`。**

---

## 2. OutputPass 与 `outputColorSpace`：目标与执行者

**一句话结论：`outputColorSpace` 指定输出颜色的规则，`OutputPass` 在后处理流水线里按这个规则执行转换。**

> 📷 待补截图：固定相机和灯光，对比“默认 sRGB 输出 + OutputPass”“移除 OutputPass”“保留 OutputPass，但输出设为 LinearSRGBColorSpace”；后两者在本章默认无色调映射的配置下都偏暗。

### 最小代码

```js
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

renderer.outputColorSpace = THREE.SRGBColorSpace;

const outputPass = new OutputPass();
composer.addPass(outputPass); // 本章放在 OutlinePass 后、FXAA 前
```

### 为什么这样写

**颜色空间**：一套“数字怎样对应颜色”的约定。

- **线性颜色（Linear-sRGB）**：方便计算光照、混合效果的颜色表示方式。
- **sRGB 颜色**：普通网页画布输出到屏幕时使用的颜色表示方式。

同一个数值，按不同规则解释，表示的亮度可能不同。因此，计算完的线性数值不能省略转换就直接当作 sRGB 数值显示，否则中间调会偏暗。

**`renderer.outputColorSpace = THREE.SRGBColorSpace`：指定最终要交出什么颜色。**

`SRGBColorSpace` 在本章版本中就是默认值，这行可以省略；显式写出只是表明输出意图。

**`new OutputPass()`：建立负责输出转换的通道。**

它在渲染时读取渲染器的输出颜色空间设置。默认输出为 sRGB 时，就把前面的线性颜色转换成 sRGB。

它没有增大灯光强度，也没有修改网页的亮度样式；变化只发生在它处理的画布图像里。与漏了转换的画面相比，中间调的输出数值变大，所以看起来更亮，实际上是恢复正确显示。

**`composer.addPass(outputPass)`：让中间图像经过这个转换。**

离屏画布是保存中间图像、不会直接显示到屏幕上的画布。两种绘制路径的区别是：

- **直接画屏幕**：`renderer.render(scene, camera)` 在输出时完成颜色转换。
- **本章的后处理**：`RenderPass` 先画进离屏画布，`OutlinePass` 叠加描边；这些中间步骤保留线性颜色，到 `OutputPass` 才转换成 sRGB，后面的 FXAA 再处理转换后的图像。

在上一节的基础用法里，如果 composer 只有 `RenderPass`，它会直接画屏幕，渲染器会完成转换。这种情况没有添加后期特效，不必再额外添加 `OutputPass`。

本节则要把“OutputPass 永远最后”改成更准确的记法：

**本章的描边在线性颜色阶段完成，OutputPass 转换输出颜色，FXAA 在转换之后执行。** 具体原因见下一节。

### 坑：以为中间计算用线性，最终输出也应该设成线性

```js
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
```

这相当于告诉输出环节“保留线性数值”。`OutputPass` 会照做，不再执行线性到 sRGB 的转换。在本章面向普通网页屏幕的配置下，即使通道还在，画面也会偏暗。

中间计算与最终显示是两件事。保持默认的 `SRGBColorSpace`，不要靠调大灯光补偿遗漏的颜色转换。

**承接上一点：设备已经被正确选中和描边，这一步让场景与描边一起以正确的颜色输出。**

---

## 3. FXAA：处理已经画出来的锯齿

**一句话结论：用 `ShaderPass` 把 `FXAAShader` 接入流水线，在输出颜色转换之后平滑图像边缘。**

> 📷 待补截图：固定视角放大道路斜边和设备描边，对比 FXAA 关闭与开启，观察像素台阶是否变平滑，以及细节是否略变软。

### 最小代码

下面接在已经添加 `outputPass` 的代码之后；其中 `width`、`height` 是画布的逻辑宽高。

```js
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

const fxaaPass = new ShaderPass(FXAAShader);

const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms["resolution"].value.set(
  1 / (width * pixelRatio),
  1 / (height * pixelRatio)
);

composer.addPass(fxaaPass);
```

### 为什么这样写

**锯齿**：斜线或曲线落到像素格上时，边缘出现的台阶。

**抗锯齿**：通过处理边缘，让这些台阶不那么明显。

**FXAA（Fast Approximate Anti-Aliasing，快速近似抗锯齿）**：一种在已经画好的图像上，检测颜色、亮度变化并平滑边缘的抗锯齿方法。它处理的是整张图，因而既能处理场景边缘，也能处理前面叠上去的描边。

**`new ShaderPass(FXAAShader)`：算法与通道分工。**

着色器是显卡执行的绘制程序。这里 `FXAAShader` 提供平滑边缘的算法，`ShaderPass` 则把它包装成 composer 能执行的后处理通道。

**为什么放在 OutputPass 后面？**

1. `OutlinePass` 先在线性颜色阶段叠加描边。
2. `OutputPass` 把它转换成屏幕输出使用的 sRGB 图像。
3. 本章版本的 `FXAAShader` 预期处理这种非线性的颜色输入，根据其中的亮度差异判断边缘。
4. 因而本章使用 `Render → Outline → Output → FXAA`，让 FXAA 得到它预期的输入。

这也解释了为什么不能笼统地说“所有后处理都在线性空间进行”：**本例的 FXAA 就处于输出转换之后。**

**`uniforms["resolution"].value`：告诉算法相邻像素有多远。**

uniform 是 JavaScript 传给着色器使用的参数。这个参数虽然叫 `resolution`，但值应为输入图像宽高的倒数，而不是直接填宽高。

代码里的分子 `1` 表示图像某一方向的完整坐标跨度；除以这一方向的实际像素数，就得到移动一个像素需要跨过的距离。下一节结合像素比逐步计算。

### 坑：用了 composer，仍只依赖 `antialias: true`

`new THREE.WebGLRenderer({ antialias: true })` 针对渲染器默认画布的抗锯齿，**不会自动替本章 composer 默认的离屏渲染目标开启同样的抗锯齿**。

因此，把这个开关打开，也不能代替本章最后的 FXAA 通道。

**承接上一点：OutputPass 确定了 FXAA 接收到的颜色；接下来还要确定它接收到的像素尺寸。**

---

## 4. 分辨率与设备像素比：FXAA 需要的是“一个像素有多大”

**一句话结论：按 FXAA 输入图像的实际像素宽高取倒数，初始化和窗口变化时都更新。**

> 📷 待补截图：在像素比为 2 的环境中，对比传入正确的实际像素尺寸与漏乘像素比的结果；再缩放窗口，检查抗锯齿参数是否随尺寸更新。

### 最小代码

渲染器创建后、composer 创建前设置：

```js
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

const composer = new EffectComposer(renderer);
```

在创建 `fxaaPass` 后，用同一个函数完成初始化和后续更新：

```js
function updateFXAAResolution(width, height) {
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x = 1 / (width * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y = 1 / (height * pixelRatio);
}

updateFXAAResolution(width, height);

window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  composer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  updateFXAAResolution(width, height);
};
```

### 为什么这样写

**CSS 像素**：网页布局使用的尺寸单位。

**渲染像素**：实际画出来的图像中的一个采样点。

**设备像素比**：设备像素与 CSS 像素的倍率，浏览器通过 `window.devicePixelRatio` 提供；本章把这个倍率用作渲染器的像素比。

**`setPixelRatio()` 决定渲染采用的倍率。**

`renderer.getPixelRatio()` 返回的是渲染器当前设置的倍率，并不是每次自动读取显示器。因为前面调用了 `setPixelRatio(window.devicePixelRatio)`，本例两者才一致。

**composer 也要使用匹配的尺寸。**

本例在设置渲染器像素比后创建 composer，composer 会据此设置自身的像素比。没有另外调整渲染尺度时，它的输入图像宽高就是逻辑宽高乘这个倍率。

**为什么传倒数？先说明数值，再计算。**

假设网页画布的逻辑宽度是 `800`、高度是 `600`，单位为 CSS 像素；渲染器像素比设为 `2`，表示每个方向都用两倍的渲染像素。

这些数值用在：`1 / (width * pixelRatio)` 与 `1 / (height * pixelRatio)`。算法需要它们，是为了从当前像素准确移动到相邻像素。

先求输入图像大小，每步一行：

1. 实际宽度 = 逻辑宽度 × 像素比。
2. 实际宽度 = `800 × 2`。
3. 实际宽度 = `1600` 个渲染像素。
4. 实际高度 = 逻辑高度 × 像素比。
5. 实际高度 = `600 × 2`。
6. 实际高度 = `1200` 个渲染像素。

图像坐标每个方向的完整跨度是 `1`；算法要在这个跨度里走到隔壁像素，因此：

1. 水平方向一个像素的距离 = 完整跨度 ÷ 实际宽度。
2. 水平方向一个像素的距离 = `1 / 1600`。
3. 水平方向一个像素的距离 = `0.000625`。
4. 垂直方向一个像素的距离 = 完整跨度 ÷ 实际高度。
5. 垂直方向一个像素的距离 = `1 / 1200`。
6. 垂直方向一个像素的距离 ≈ `0.00083333`。

这里的倒数是图像坐标中的采样距离，没有 CSS 像素或物理长度单位。

**窗口变化时，每行负责更新不同的东西。**

- `renderer.setSize(width, height)`：更新最终画布尺寸。
- `composer.setSize(width, height)`：更新中间图像及各通道的尺寸，composer 会使用自身像素比计算实际大小。
- `camera.aspect = width / height`：相机的宽高比跟随窗口，避免画面变形。
- `camera.updateProjectionMatrix()`：让相机采用刚修改的宽高比。
- `updateFXAAResolution(width, height)`：按新尺寸重新计算像素采样距离。

### 坑：调用了 composer.setSize，就以为 FXAA 参数也自动更新了

`composer.setSize()` 会通知各通道调整尺寸，但本章的 `ShaderPass` 不会因此自动修改 `FXAAShader` 的 `resolution` 参数。

如果漏掉最后的 `updateFXAAResolution()`，图像已经变大或变小，算法仍按旧的像素距离采样，抗锯齿就可能不准确。

**承接上一点：创建 FXAA 通道只是把算法接上；像素比与尺寸更新，才让它知道应该怎样采样。**

---

## 了解即可

### FXAA 与 SMAA 的取舍

**一句话结论：FXAA 通常侧重较低开销；SMAA 通常更注重边缘形状和细节保留，最终要看具体画面与硬件。**

SMAA（Subpixel Morphological Antialiasing，亚像素形态抗锯齿）是另一种后处理抗锯齿方法，会识别边缘的局部形状来改善台阶。本章代码只实现 FXAA，不必再记一套 SMAA 配置。

- **FXAA**：对已渲染图像做边缘平滑，通常开销较低，但可能让细节略变软。
- **SMAA**：通常更能保留边缘细节，也往往需要更多处理步骤；效果与耗时取决于实现、场景和设备。
- **选择方式**：先用本章 FXAA 观察实际效果；细节损失明显且性能允许时，再比较 SMAA。不能把“质量远高于 FXAA”或“通常一定比 MSAA 快”当作固定结论。

MSAA 是通过多重采样改善几何边缘的另一类抗锯齿方式，这里只需知道它与后处理抗锯齿的性能不能脱离具体配置直接排名。

### 本章描边参数

```js
outlinePass.visibleEdgeColor.set(0x00ffff);
outlinePass.edgeThickness = 4;
outlinePass.edgeStrength = 6;
```

- `0x00ffff` 是 RGB 颜色写法，用于指定可见轮廓的颜色。按红、绿、蓝分成 `00 / ff / ff`，表示无红、满绿、满蓝，得到青色。
- `edgeThickness` 控制描边粗细，默认 `1`，本例设为 `4` 便于观察；它是通道的粗细参数，不表示恒定的四个屏幕像素。
- `edgeStrength` 控制描边叠加强度，默认 `3`，本例设为 `6` 让轮廓更明显；它不是场景光源的亮度。

### 模型节点与网格不是一回事

本章 GLB 中，`设备A`、`设备B` 节点本身都没有网格，各有十五个直接子节点，其中十四个引用了网格。**有多少子节点，不等于有多少网格。** 主线只需记住：选择父节点，可以让其下的网格一起参与描边。

### 颜色管理的补充

- 原来所说的“伽马校正”可先理解成输出颜色转换；本章用 `OutputPass` 完成，避免继续套用旧版本的颜色配置写法。
- 旧写法 `renderer.outputEncoding = THREE.sRGBEncoding` 在本章版本中已移除，使用 `outputColorSpace`。
- 如果配置了色调映射，`OutputPass` 也会按渲染器设置执行。色调映射是把较宽亮度范围映射到显示范围的处理，本章保持默认，不展开。
- 本章窗口变化的代码处理的是尺寸变化；如果还要支持运行中设备像素比变化，需要同步更新 renderer、composer 的像素比，并重新计算 FXAA 参数。

---

## 速记表

| 知识点 | 一句话 | 关键代码 | 常见坑 |
| --- | --- | --- | --- |
| 模型加载 | 先导出容器，加载好再装模型 | `group.add(gltf.scene)` | 以为按钮能点击就代表模型已加载 |
| 名称查找 | 在对象及子孙中按 name 完全匹配 | `group.getObjectByName(name)` | 名称写错或加载未完成，结果为 undefined |
| 设备描边 | 把设备父节点交给描边通道 | `selectedObjects = [obj]` | 忘判断对象，或忘记使用数组 |
| 重绘 | 改名单不等于立即绘制 | 下一次 `composer.render()` | 没有持续绘制，也没有手动渲染 |
| 输出颜色 | 设置是目标，OutputPass 执行转换 | `outputColorSpace`、`OutputPass` | 改为线性输出，或调灯光补颜色转换 |
| 通道顺序 | 先场景与描边，再转换颜色，再抗锯齿 | Render → Outline → Output → FXAA | 把“Output 永远最后”当作通用规则 |
| FXAA | 包装算法，平滑图像边缘 | `new ShaderPass(FXAAShader)` | 只打开 renderer 的 antialias |
| FXAA 采样距离 | 输入图像宽高的倒数 | `1 / (width * pixelRatio)` | 直接填宽高，或漏算像素比 |
| 窗口变化 | 画布、通道、相机和 FXAA 参数都更新 | `composer.setSize()` + 手动更新参数 | 以为 setSize 会自动修改 FXAA 参数 |
| SMAA | 另一种抗锯齿方案 | 本章了解即可 | 把质量或速度排名当作绝对结论 |

---

## 自测题

1. 为什么可以先把空 `group` 加进场景？如果工厂尚未加载完成就点击设备按钮，`if (!obj) return` 具体避免了怎样的连锁问题？
2. 把 `selectedObjects` 从设备A换成设备B，会立即自动重绘吗？本章为什么看起来点击后就更新了？
3. `renderer.outputColorSpace` 与 `OutputPass` 分别负责什么？为什么本章通道顺序是 Render → Outline → Output → FXAA？
4. 逻辑画布宽 `800`、高 `600`，渲染器像素比为 `2`，FXAA 的 `resolution.x`、`resolution.y` 应分别传什么？为什么不能直接传 `800`、`600`？
5. 窗口变化时已经调用了 `renderer.setSize()` 和 `composer.setSize()`，为什么仍要更新相机和 FXAA 参数？

### 答案

1. `group` 是同一个容器对象，加载成功后向它添加模型，模型也就进入了场景。加载前查找会返回 `undefined`；没有判断就会传入 `[undefined]`，导致描边遍历时异常。异常发生在本例 `composer.render()` 内，后面的下一帧安排无法执行，渲染循环中断。提前返回只跳过本次选择。
2. 不会，赋值只改名单。持续运行的渲染循环会在下一次 `composer.render()` 时读取新名单并绘制，所以看起来立即更新；没有这个循环就需要手动渲染。
3. `outputColorSpace` 指定最终颜色采用的规则，`OutputPass` 在后处理中按该设置完成输出转换。本章先在线性颜色下画场景、叠描边，再转成 sRGB，最后给预期接收这种图像的 FXAA 平滑边缘。
4. 先算实际宽：`800 × 2 = 1600`；再算实际高：`600 × 2 = 1200`。因此横向传 `1 / 1600 = 0.000625`，纵向传 `1 / 1200 ≈ 0.00083333`。算法需要的是相邻像素的坐标距离，不是画布尺寸本身。
5. `setSize()` 更新图像尺寸，但不会替相机更新宽高比，也不会替本章的 FXAA ShaderPass 修改采样参数。还要设置 `camera.aspect`、调用 `camera.updateProjectionMatrix()`，并重新执行 `updateFXAAResolution()`。
