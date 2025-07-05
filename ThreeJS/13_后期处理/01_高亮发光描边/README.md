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



## RenderPass的作用

如果移除 RenderPass，即使 composer.render() 在执行，屏幕也会变白，原始的场景也无法显示。

**原因在于 EffectComposer（效果合成器）的工作方式就像一条流水线。**

1. 流水线模式：EffectComposer 将一系列的“通道”（Pass）串联起来。第一个通道处理完，会把结果传给第二个通道，第二个再传给第三个，以此类推，直到最后一个通道完成，最终输出到屏幕上。

1. RenderPass 的关键作用：在这条流水线上，RenderPass 通常是第一个，也是最基础的一个通道。它的唯一任务就是：把你的原始 scene（场景）和 camera（相机）渲染出来。它相当于为后续所有特效处理准备好了“原材料”或者说“画布”。

1. 没有 RenderPass 会发生什么？

- EffectComposer 的流水线启动了。

- 它发现第一个通道是 OutlinePass（描边通道）。

- OutlinePass 需要一张渲染好的场景图像作为输入，才能分析出哪些物体的边缘需要描边。但是，由于没有 RenderPass，OutlinePass 没有收到任何输入图像（或者说，收到的是一张空白图像）。

- 因此，OutlinePass 无法工作，它处理了一张空白图，输出的自然也是一张空白图。

- 由于 composer.render() 接管了渲染权，它会把这条流水线最终的输出（也就是这张空白图）显示到屏幕上。所以您看到了白屏。

简单来说，您可以把这个过程想象成在 Photoshop 里修图：

- RenderPass 就像是“步骤1：打开一张照片”。

- OutlinePass 就像是“步骤2：给照片里的人或物添加发光描边滤镜”。

如果您跳过第一步，直接进行第二步，Photoshop 会问你：“你要给什么添加滤镜？你连照片都还没打开呢！” 结果自然是一片空白。

总结一下：

RenderPass 是后期处理流程的起点，它负责提供最原始的场景渲染结果。没有它，后续所有的通道（Pass）都失去了处理对象，导致整个 EffectComposer 输出空白，从而造成白屏。
