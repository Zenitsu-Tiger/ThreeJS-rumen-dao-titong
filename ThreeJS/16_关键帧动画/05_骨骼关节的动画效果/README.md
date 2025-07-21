# 骨骼关节模型与 SkeletonHelper 解析

本文档将结合 03_骨架关节点的控制.js中的代码，解释 Three.js 中骨骼动画的核心概念，并说明为什么需要使用 SkeletonHelper 来可视化骨骼。

## 1. 什么是骨骼模型 (SkinnedMesh)?

在 3D 建模和动画中，骨骼模型是一种让模型（如角色、动物）能够像生物一样自然弯曲和变形的技术。在 Three.js 中，这通常通过 SkinnedMesh (蒙皮网格) 对象来实现。

一个 SkinnedMesh 主要由两部分构成：

1. 皮肤 (Skin)：即模型的可见几何体，由顶点、面等构成。在您的代码中，这就是通过 gltf.scene.getObjectByName('身体') 获取的那个网格模型。

1. 骨架 (Skeleton)：一个由多个骨骼关节 (Bone) 组成的层级结构。它就像生物体内部的骨架，是不可见的。骨架定义了模型的"活动关节"和结构。在您的代码中，可以通过 SkinnedMesh.skeleton 访问到它。

工作原理：

模型"皮肤"上的每一个顶点都会被绑定（或"蒙皮"）到一个或多个"骨骼关节"上，并为每个关节分配一个权重。当骨架中的某个关节移动或旋转时，它会根据权重拉动与之绑定的那部分皮肤顶点，从而使模型产生平滑、自然的变形。

在您的代码中：

```typescript
// ...
const SkinnedMesh = gltf.scene.getObjectByName('身体'); // 这就是"皮肤"
console.log('骨架', SkinnedMesh.skeleton); // 这就是"骨架"
console.log('骨架的所有关节', SkinnedMesh.skeleton.bones); // 骨架中的所有关节
// ...
```

Bone1, Bone2, Bone3 就是构成这个骨架的一部分。当你通过 GUI 修改它们的 rotation 属性时，实际上就是在驱动骨架运动，进而改变了"皮肤"的姿态。

## 2. 为什么骨骼关节默认不可见？

您可能会问，既然骨骼存在，为什么在场景中直接看不到它们？

原因在于 THREE.Bone 对象本质上是一个数据结构，而不是一个可见的物体。

- 功能定位：Bone 的主要作用是存储变换信息（位置、旋转、缩放）。它就像一个不可见的"关节"或"枢轴"，它的变换矩阵（Matrix）会传递给 SkinnedMesh 的着色器（Shader），用来计算顶点的新位置。

- 没有几何体：Bone 对象本身没有附加任何 Geometry (几何体) 或 Material (材质)。渲染器在渲染场景时，只会绘制那些有几何形状和外观材质的物体（如 Mesh）。由于 Bone 两者皆无，所以它自然就不会被渲染出来。

您可以把它想象成一个木偶内部的控制关节：您能看到木偶的活动，但看不到其内部用于控制的关节结构。

## 3. SkeletonHelper 的作用

为了解决骨骼不可见的问题，方便开发者进行调试和观察，Three.js 提供了 SkeletonHelper。

SkeletonHelper 是一个辅助观察工具，它的作用是：

1. 遍历骨架：它会接收一个包含骨架的模型对象（在您的代码中是 gltf.scene），并自动找到其中的 Skeleton。

1. 创建可视化代表：为骨架中的每一个 Bone 创建一个可见的几何表示（通常是线条或锥形），用以在场景中清晰地展示出骨骼的层级结构、位置和朝向。

1. 实时同步：SkeletonHelper 所创建的视觉辅助线会与原始骨架的运动保持同步。当您通过 GUI 或动画系统改变骨骼关节的旋转时，辅助线也会相应地移动，让您能直观地看到骨架的动态变化。

在您的代码中，正是这一行让不可见的骨骼变成了可见的辅助线：

```typescript
// SkeletonHelper会可视化参数模型对象所包含的所有骨骼关节
const skeletonHelper = new THREE.SkeletonHelper(gltf.scene);
group.add(skeletonHelper);
```

没有 SkeletonHelper，您虽然依然可以通过代码 gui.add(bone1.rotation, ...) 来控制模型变形，但您将无法在视觉上看到那些起决定性作用的"关节"本身，这会给调试带来极大的不便。

---

# 4. 动画权重 (`weight`) 与多动画混合

在 `mesh.js` 文件中，您实现了一个非常经典的多动画切换逻辑。这里的核心概念是 **动画权重 (`weight`)**，它允许您平滑地混合或在多个动画之间切换。

## 1. 核心组件: `AnimationMixer` 和 `AnimationAction`

在深入 `weight` 之前，我们需要理解两个基本对象：

-   **`AnimationMixer` (动画混合器)**: 这是 Three.js 动画系统的"大脑"。对于一个需要播放动画的物体（比如您的士兵模型），您需要为它创建一个 `AnimationMixer` 实例。它的任务是管理该物体所有动画的状态，并在每一帧更新动画。
    ```javascript
    // ...
    mixer = new THREE.AnimationMixer(gltf.scene);
    // ...
    ```
-   **`AnimationAction` (动画动作)**: 一个 `AnimationAction` 对象代表一个具体的动画剪辑（`AnimationClip`），比如"跑步"、"行走"或"待机"。它提供了控制该动画的方法，如 `.play()`、`.stop()`、`.fadeIn()`、`.fadeOut()` 以及直接设置 `.weight` 属性。
    ```javascript
    // ...
    const IdleAction = mixer.clipAction(gltf.animations[0]);
    const RunAction = mixer.clipAction(gltf.animations[1]);
    const WalkAction = mixer.clipAction(gltf.animations[3]);
    // ...
    ```

## 2. `weight` 属性的作用

`AnimationAction` 的 `.weight` 属性是一个介于 `0.0` 和 `1.0` 之间的数字。它决定了这个动画动作对模型最终姿态的 **影响力**。

-   `weight = 1.0`: 动画完全生效，拥有 100% 的影响力。
-   `weight = 0.0`: 动画完全不生效，影响力为 0。
-   `0.0 < weight < 1.0`: 动画按其权重比例与其他活动画（`weight > 0` 的动画）混合。

`AnimationMixer` 在每一帧都会计算所有活动画的加权平均值，来得到模型骨骼的最终姿态。

## 3. 在您的代码中如何使用 `weight`

您的代码通过巧妙地控制 `weight` 实现了在"待机"、"跑步"、"走路"三个动画之间的 **即时切换**。

1.  **全部播放，但只有一个可见**:
    首先，代码让所有三个动画动作都开始播放 (`.play()`)。但是，通过设置权重，确保了在初始状态下只有"待机"动画是可见的。
    ```javascript
    IdleAction.play();
    RunAction.play();
    WalkAction.play();

    IdleAction.weight = 1; // 待机动画完全可见
    RunAction.weight = 0;  // 跑步动画被压制
    WalkAction.weight = 0;  // 走路动画被压制
    ```
    即使 `RunAction` 和 `WalkAction` 在"播放"状态，但因为它们的权重是 0，所以它们对模型的姿态没有任何影响。

2.  **点击切换权重**:
    当用户点击按钮时，代码执行一个简单的切换逻辑：
    -   将当前活动画 (`ActionState`) 的权重设置为 `0`，使其失效。
    -   将用户新选择的动画的权重设置为 `1`，使其完全生效。
    -   更新 `ActionState` 变量，记录新的活动画。
    ```javascript
    document.getElementById('Run').addEventListener('click', () => {
      ActionState.weight = 0; // 假设之前是Idle, 把Idle的权重降为0
      RunAction.weight = 1;   // 把Run的权重升为1
      ActionState = RunAction; // 记录当前状态为Run
    });
    ```
    这种方式非常高效，因为它避免了反复地 `stop()` 和 `play()` 动画，而是通过一个简单的数值调整来控制动画的呈现。

### 拓展：平滑过渡 (Crossfade) - 手动权重插值实现

虽然 Three.js 提供了 `.crossFadeFrom()`、`.fadeIn()` 和 `.fadeOut()` 等内置方法来实现平滑过渡，但在实际项目中，这些方法有时可能不够稳定或不符合特定需求。在您的代码中，我们采用了**手动权重插值**的方案，这是一种更可控、更可靠的平滑过渡实现方式。

#### 1. 手动权重插值的核心原理

手动权重插值的核心思想是：在指定的时间内，通过 `requestAnimationFrame` 创建一个自定义的动画循环，逐帧地修改两个动画的权重值，实现从一个动画到另一个动画的平滑过渡。

```javascript
function setAction(toAction) {
  if (toAction !== ActionState) {
    const prevAction = ActionState;
    ActionState = toAction;
    
    // 手动实现平滑过渡
    let startTime = Date.now();
    const duration = 500; // 500毫秒过渡时间
    
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1); // 0到1之间
      
      // 权重插值
      prevAction.weight = 1 - progress; // 从1到0
      toAction.weight = progress;       // 从0到1
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    animate();
  }
}
```

#### 2. 实现步骤详解

1. **时间控制**:
   ```javascript
   let startTime = Date.now();
   const duration = 500; // 过渡持续时间
   ```
   - `startTime` 记录过渡开始的时间戳
   - `duration` 定义整个过渡过程的持续时间（毫秒）

2. **进度计算**:
   ```javascript
   const elapsed = Date.now() - startTime;
   const progress = Math.min(elapsed / duration, 1);
   ```
   - `elapsed` 计算已经过去的时间
   - `progress` 是一个0到1之间的值，表示过渡的完成度
   - `Math.min()` 确保进度值不会超过1

3. **权重插值**:
   ```javascript
   prevAction.weight = 1 - progress; // 从1到0
   toAction.weight = progress;       // 从0到1
   ```
   - 前一个动画的权重从1线性递减到0
   - 新动画的权重从0线性递增到1
   - 两个权重的和始终等于1，确保动画的连续性

4. **动画循环**:
   ```javascript
   if (progress < 1) {
     requestAnimationFrame(animate);
   }
   ```
   - 使用 `requestAnimationFrame` 确保与浏览器的刷新率同步
   - 当进度达到1时，过渡完成，停止循环

#### 3. 这种方案的优势

1. **完全可控**: 您可以精确控制过渡的时间、缓动函数、权重分配等
2. **稳定可靠**: 不依赖 Three.js 的内置过渡方法，避免了潜在的兼容性问题
3. **不重置动画**: 不会调用 `reset()` 方法，动画保持连续播放状态
4. **易于调试**: 逻辑简单明了，出现问题时容易定位和修复
5. **可扩展性强**: 可以轻松添加缓动函数、多动画混合等高级功能

#### 4. 可能的扩展

您可以进一步增强这个方案：

**添加缓动函数**:
```javascript
// 使用缓动函数使过渡更自然
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const smoothProgress = easeInOut(progress);
prevAction.weight = 1 - smoothProgress;
toAction.weight = smoothProgress;
```

**支持多动画混合**:
```javascript
// 可以同时控制多个动画的权重
const animations = [prevAction, toAction, anotherAction];
const weights = [1 - progress, progress, 0];
animations.forEach((action, index) => {
  action.weight = weights[index];
});
```

这种手动权重插值的方法展示了对 Three.js 动画系统的深度理解，也是解决复杂动画切换需求的有效途径。