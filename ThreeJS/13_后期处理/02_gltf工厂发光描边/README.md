# Three.js 后期处理通道详解

本文档围绕项目代码，详细解释了几个关键的后期处理通道。

## 1. 伽马校正 (`OutputPass`)

在新版的 Three.js (r152+)，`OutputPass` 用来替代旧的 `GammaCorrectionPass`。

背后的核心是颜色管理系统的升级：
1.  **设置目标颜色空间**: 通过 `renderer.outputColorSpace = THREE.SRGBColorSpace;` 告诉渲染器，最终输出到屏幕的图像应为 sRGB 颜色空间。
2.  **线性空间计算**: `EffectComposer` 的所有处理（如 `RenderPass`, `OutlinePass`）都在线性颜色空间中进行，以保证光照混合在物理上的正确性。
3.  **`OutputPass` 的作用**: 当所有特效处理完后，图像仍是线性的。`OutputPass` 作为**最后一个环节**，负责将线性图像正确转换为 sRGB 图像，防止颜色变暗。

**在代码中**，它被添加为 `composer` 的最后一个通道，确保最终输出的颜色是正确的：
```javascript
// 添加OutputPass, 进行颜色空间转换(伽马校正通道)，必须是最后一个Pass
const outputPass = new OutputPass();
composer.addPass(outputPass);
```

---

## 2. FXAA 抗锯齿 (`ShaderPass` + `FXAAShader`)

FXAA (Fast Approximate Anti-Aliasing) 是一种高效的后期处理抗锯齿技术。它通过分析渲染出的图像，寻找并平滑像素间的锯齿边缘。

**工作原理**:
- **`ShaderPass`**: 这是一个通用的后期处理通道，它的作用是把任何自定义的着色器（Shader）包装成一个可以在 `EffectComposer` 流水线中使用的"通道"。
- **`FXAAShader`**: 这是 Three.js 提供的实现了 FXAA 算法的着色器。
- **配置**: FXAA 要想生效，我们必须通过 `ShaderPass` 告诉它画布的**分辨率**。这是通过设置其 `uniforms.resolution` 变量来完成的。

**在代码中**:
我们创建 `fxaaPass`，并立即设置它的分辨率。注意，这个通道必须在 `OutputPass` 之前，以确保抗锯齿作用于原始场景颜色上。
```javascript
// FXAA抗锯齿通道
const fxaaPass = new ShaderPass(FXAAShader);
// ... 设置分辨率 ...
composer.addPass(fxaaPass);
```

---

## 3. 设备像素比 (`devicePixelRatio`) 与分辨率

这是理解高清屏（如 Retina 屏）渲染的关键。

**原理**:
- **CSS 像素 vs. 设备像素**: 您在 CSS 中定义的 `1px` 并不总等于屏幕上的一个物理像素点。在高分屏上，一个 CSS 像素可能由 2x2 或 3x3 个物理像素点来渲染，这个倍率就是**设备像素比**。
- **`renderer.getPixelRatio()`**: 此函数能获取到当前显示器的设备像素比。
- **`renderer.setPixelRatio()`**: 我们调用此函数，是告诉 Three.js 的渲染器按照屏幕的物理分辨率来创建它的画布。例如，在一个像素比为 `2` 的屏幕上，一个 800x600 的 `canvas`，渲染器会创建一个 1600x1200 的后台画布，从而使基础渲染结果清晰锐利。

**为什么 FXAA 需要它?**
`FXAAShader` 是在像素级别工作的，它需要知道**单个物理像素的尺寸**才能精确地找到并平滑锯齿。因此，我们需要把包含设备像素比的真实分辨率传给它。

**在代码中**，`resolution` 的计算方式如下：
```javascript
const pixelRatio = renderer.getPixelRatio();
// uniform 的值是单个像素在标准化坐标系下的尺寸
fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
```
并且，这段逻辑必须在初始化和窗口尺寸变化(`onresize`)时都执行，以保证分辨率的实时正确性。

---

## 4. FXAA 与 SMAA 抗锯齿通道的比较

FXAA 并不是唯一的后期处理抗锯齿方案，`SMAA` (Subpixel Morphological Antialiasing) 是另一个常见的选择。

| 特性 | FXAA (Fast Approximate AA) | SMAA (Subpixel Morphological AA) |
| :--- | :--- | :--- |
| **原理** | 检测像素亮度差异，对高对比度边缘进行模糊处理。 | 通过模式识别技术，检测并重构边缘（直线、曲线），更智能。 |
| **质量** | 效果不错，但可能会导致整个画面轻微模糊，尤其会影响纹理细节。 | 质量**远高于** FXAA，能更好地保留纹理细节，边缘处理更清晰、自然。 |
| **性能** | **速度极快**，性能开销非常低。 | 速度比 FXAA 慢，但通常仍比浏览器内置的 MSAA 抗锯齿要快。 |
| **适用场景** | 对性能要求极致，或作为移动端的首选方案。 | 当追求更高画面质量，且硬件性能允许时（大部分桌面端场景）。 |

**总结：**
- **要速度，选 FXAA**。
- **要质量，选 SMAA**。