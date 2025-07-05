# 后处理对象EffectComposer

### 1. 正常渲染流程

在不使用后处理的情况下，你的渲染流程是这样的：

1. 你创建了一个 scene（场景）和一个 camera（相机）。

1. 在 render 函数里，你调用 renderer.render(scene, camera)。

1. three.js 的 renderer（渲染器）会根据场景和相机，直接计算出最终的图像，并把它绘制到屏幕（<canvas>元素）上。

这个流程就像用相机拍照然后立刻把照片洗出来。

### 2. 后处理渲染流程

当你需要一些特殊效果，比如截图里提到的“高亮发光描边”时，直接渲染就做不到了。这时就需要“后处理”。

后处理的流程是：

1. renderer 先不把图像直接绘制到屏幕上，而是把它渲染到一个临时的、看不见的“画布”（在WebGL中这叫渲染目标或帧缓冲区）上。

1. 然后，我们可以对这张临时的图像进行一系列操作，就像用 Photoshop 给照片加滤镜一样。比如可以给它加上发光、模糊、颜色调整等效果。

1. 所有效果处理完毕后，才把最终的图像绘制到屏幕上。

### 3. EffectComposer 的角色

EffectComposer（效果合成器）就是这个后处理流程的管理者。

- 接管渲染器：正如代码 `const composer = new EffectComposer(renderer);` 所示，我们创建 EffectComposer 时，会把 renderer 作为参数传给它。这相当于告诉 composer：“现在你来负责最终的渲染输出”。

- 管理效果链：EffectComposer 内部维护了一个处理队列，你可以往里面添加各种后期效果“通道”（Pass），比如发光通道、描边通道等。

- 执行渲染：在你的 render 函数中，你将不再调用 renderer.render()，而是调用 composer.render()。当 composer.render() 被调用时，它会自动完成上面提到的后处理渲染流程：

1. 在内部调用 renderer.render() 把场景渲染到内存中。

1. 依次执行你添加的各种效果通道（Pass）。

1. 把最终结果输出到屏幕。

总结一下，EffectComposer 是一个高级的渲染控制器，它截取了 renderer 的默认渲染结果，允许我们通过添加各种“效果通道”对这个结果进行加工处理，最后再输出到屏幕，从而实现丰富的视觉效果。

