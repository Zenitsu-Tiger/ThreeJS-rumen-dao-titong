# GLTF 模型与动画系统详解

本文档详细解释了如何在 Three.js 项目中加载 GLTF 模型并控制其骨骼动画。

### 1. 如何结合 GLTF 生成动画效果？

GLTF 文件不仅包含了模型的几何形状和材质，还内置了动画数据。在 Three.js 中播放这些动画，需要以下几个关键对象的协同工作：

1.  **`gltf.animations` (动画剪辑 - AnimationClip)**
    *   **来源**: 当 `GLTFLoader` 加载模型成功后，返回的 `gltf` 对象中会包含一个 `animations` 数组。
    *   **作用**: 每个元素都是一个 `THREE.AnimationClip` 对象，它像一个动画“蓝图”，定义了一段动画的数据（比如“走路”、“跑步”），但不负责播放。

2.  **`THREE.AnimationMixer` (动画混合器)**
    *   **来源**: 需要手动创建，`new THREE.AnimationMixer(rootObject)`。
    *   **作用**: 这是动画系统的核心“播放器”。它接收动画数据，并将其应用到场景中的物体上。`rootObject` 是动画所作用的根对象。

3.  **`AnimationAction` (动画动作)**
    *   **来源**: 通过 `mixer.clipAction(clip)` 从混合器和动画剪辑生成。
    *   **作用**: 这是一个可控制的动画“实例”。你可以对 `Action` 进行播放、暂停、停止、改变速度等操作。

**核心流程**:
`gltf` (加载数据) -> `AnimationMixer` (创建播放器) -> `mixer.clipAction()` (生成可控制的动作) -> `action.play()` (播放动画)。

### 2. 核心动画播放代码解析

以下代码展示了如何根据配置动态地为加载的每个模型播放指定的动画。

```javascript
// ... Promise.all加载模型之后 ...
gltfs.forEach((gltf, index) => {
    const config = modelConfigs[index];
    // ... 设置模型位置、旋转、缩放 ...
    group.add(gltf.scene);

    // 根据配置播放指定动画
    if (gltf.animations.length > 0 && config.animation) {
      // 1. 安全地获取动画索引，防止越界
      const animIndex = Math.min(config.animation.index, gltf.animations.length - 1);
      
      // 2. 从gltf数据中获取动画剪辑(AnimationClip)
      const clip = gltf.animations[animIndex];

      // 3. 创建一个可控制的动画动作(AnimationAction)
      const action = mixer.clipAction(clip);

      // 4. 配置动画动作的关键参数
      action.timeScale = config.animation.timeScale || 1; // 播放速度
      action.loop = config.animation.loop ? THREE.LoopRepeat : THREE.LoopOnce; // 循环模式

      // 5. 播放动画
      action.play();
    }
});
```

**关键函数与参数**:

*   **`mixer.clipAction(clip)`**:
    *   **作用**: 这是连接“动画数据”和“播放器”的桥梁。它接收一个 `AnimationClip`，返回一个 `AnimationAction` 对象，允许我们控制这段动画的播放。

*   **`action.play()`**:
    *   **作用**: 命令混合器开始播放这个动作。

*   **`action.timeScale`**:
    *   **作用**: 控制动画的播放速率。
    *   `1` (默认): 正常速度。
    *   `0.5`: 慢一倍。
    *   `2`: 快一倍。
    *   `-1`: 倒放。

*   **`action.loop`**:
    *   **作用**: 设置动画的循环行为。
    *   `THREE.LoopRepeat`: 无限循环播放。
    *   `THREE.LoopOnce`: 只播放一次。
    *   `THREE.LoopPingPong`: 播放一次后，再反向播放一次，如此循环。

### 3. `AnimationMixer` 的核心作用及为何使用 `group`

**Q: `mixer` 为什么选取了 `group` 作为混合器的根对象？**

**A:** `AnimationMixer` 需要知道动画效果应该应用在哪个场景图（scene graph）的层级结构中。动画数据（`AnimationClip`）本身只记录了“哪个名字的骨骼或物体”应该执行“什么样的变换”，它并不知道这个物体具体在哪里。

当我们将混合器的根对象设置为 `group` 时：
1.  我们已经通过 `group.add(factoryGltf.scene)` 和 `group.add(soldierGltf.scene)` 将所有模型的场景都添加到了 `group` 中。
2.  混合器会以 `group` 为起点，向下遍历其所有子对象，去寻找与动画数据中名字匹配的骨骼或物体。
3.  因此，**一个混合器实例就可以管理和播放所有子模型（工厂、士兵等）的动画**，因为它能在 `group` 的“管辖范围”内找到所有需要驱动的部件。如果为每个模型单独创建混合器，管理会变得更复杂。

**Q: `mixer` 的核心作用是什么？**

**A:** `AnimationMixer` 是 **动画状态的管理者和调度器**。

1.  **状态管理**: 它管理着所有通过 `clipAction` 创建的 `AnimationAction` 的状态（如权重、播放时间、是否暂停等）。
2.  **时间推进**: 在渲染循环中，我们必须调用 `mixer.update(deltaTime)`。这是最关键的一步，它根据传入的时间增量 `deltaTime` 来更新所有动画的当前时间。
3.  **应用变换**: 在 `update` 方法内部，混合器会计算出当前时间点上，每个骨骼或物体应有的 `position`, `rotation`, `scale`，并 **将这些值真正应用到 `group` 场景图中的对应物体上**。

简而言之，没有 `mixer.update()`，动画就不会有任何变化。**`Mixer` 是驱动动画播放的引擎**。



## mixer和clip

```typescript
let mixer = null;
loader.load('./机械装配动画.glb', gltf => {
  gltf.scene.traverse(child => {
    if (child.isMesh) {
      child.material.metalness = 1.0;
      child.material.roughness = 0.35;
      child.material.envMap = textureCube;
      child.material.envMapIntensity = 0.5;
    }
  });
  group.add(gltf.scene);

  // 1. 创建动画混合器(AnimationMixer)
  // AnimationMixer是动画的播放器，它控制着整个动画的播放、暂停、速度等。
  // 它需要一个包含动画数据的对象作为参数，这里是加载的gltf场景。
  mixer = new THREE.AnimationMixer(gltf.scene);

  // 2. 获取动画剪辑(AnimationClip)
  // gltf.animations是一个数组，包含了模型文件中所有的动画数据。
  // 每一个元素都是一个AnimationClip对象，可以理解为一个完整的动画片段。
  // 这里我们获取第一个动画剪辑。
  const clip = gltf.animations[0];
  // 3. 创建动画动作(AnimationAction)
  // clipAction方法通过混合器(mixer)和动画剪辑(clip)来创建一个AnimationAction。
  // AnimationAction是动画的具体控制器，你可以用它来播放(.play())、暂停(.paused)、停止(.stop())等。
  const clipAction = mixer.clipAction(clip);
  // 4. 播放动画
  // 调用play()方法，动画就会开始播放。
  clipAction.play();
});
```

**为什么通过混合器(mixer)和动画剪辑(clip)来建立动画播放器？我的意思是它为什么要特地分开混合器来输入场景参数，然后另外再结合animations来使用？这不是很麻烦？**

你提出了一个非常好的问题，这直接触及了 three.js 动画系统的核心设计理念。为什么不直接 gltf.animations[0].play() 这样简单调用，而是要引入 AnimationMixer 这个看起来“多余”的中间层呢？

答案是：为了实现更高级、更灵活的动画控制，尤其是在处理多个动画融合、过渡和独立控制的场景下。

把 Mixer（混合器）和 Clip（动画剪辑）分开，解决了以下几个关键问题：

### 1. 解耦：动画数据与播放控制分离

- AnimationClip (Clip)：是纯粹的数据。它只描述了“什么东西（比如骨骼、位置、颜色）在哪些时间点应该处于什么状态”。它就像一个乐谱或一个剧本，是静态的，不关心由谁来播放、何时播放、播放多快。

- AnimationMixer (Mixer)：是播放器和状态管理器。它的工作是：

- 接收一个或多个 Clip。

- 跟踪全局时间（通过 clock.getDelta()）。

- 根据时间计算出每个 Clip 当前应该处于哪一帧的状态。

- 将这个状态应用到场景中的实际对象上（这就是为什么创建 Mixer 时需要传入 gltf.scene 这个根对象，它需要知道去哪里找到那些被动画控制的骨骼或网格）。

这种分离就像 HTML (数据/结构) 和 CSS (表现/样式) 的分离一样。Clip 就是 HTML，Mixer 和 Action 像是 CSS 和 JavaScript，负责让静态的数据“动起来”。

### 2. 支持多动画并行与融合 (Animation Blending)

这是一个核心原因。想象一个游戏角色：

- 他有一个“走路”的动画 (walkClip)。

- 他有一个“挥手”的动画 (waveClip)。

你希望角色能一边走路一边挥手。

如果设计成 clip.play() 模式，这就很难实现。你播放 walkClip，腿在动；再播放 waveClip，胳膊在动，但腿可能就停了。

而有了 Mixer，你可以这样做：

```typescript
const standAction = mixer.clipAction(standClip);
const runAction = mixer.clipAction(runClip);

standAction.play();

// 当用户按下前进键时...
// 在 0.5 秒内，从站立动画平滑过渡到跑步动画
standAction.crossFadeTo(runAction, 0.5);
runAction.play();
```

Mixer 会智能地处理这一切。它知道 walkClip 主要控制腿部骨骼，而 waveClip 主要控制手臂骨骼。在每一帧更新时 (mixer.update(deltaTime)), 它会计算两个动画各自的状态，然后把它们混合在一起，应用到最终的骨骼上。

### 3. 实现平滑过渡 (Cross Fading)

当角色从“站立”状态切换到“跑步”状态时，你不希望画面是瞬间切换的，那样会非常生硬。你希望有一个平滑的过渡。

AnimationAction 对象提供了 .crossFadeTo() 方法，这正是 Mixer 架构的强大之处：

```typescript
const standAction = mixer.clipAction(standClip);
const runAction = mixer.clipAction(runClip);

standAction.play();

// 当用户按下前进键时...
// 在 0.5 秒内，从站立动画平滑过渡到跑步动画
standAction.crossFadeTo(runAction, 0.5);
runAction.play();
```

这个过渡期间，Mixer 会同时计算 standAction 和 runAction 的状态，并根据一个权重（从0到1变化）将两者混合，创造出无缝衔接的效果。如果没有 Mixer 这个中央协调者，实现这种平滑过渡会极其复杂。

### 4. 独立的播放控制

通过 AnimationAction，你可以对每个动画进行精细控制，而不会互相干扰：

- 改变某个动画的播放速度 (action.timeScale)。

- 暂停某个动画 (action.paused = true)。

- 设置循环方式 (action.setLoop(THREE.LoopOnce))。

- 让一个动画播放完后自动执行另一个。

总结：

虽然对于“只有一个动画，从头播到尾”的简单场景来说，Mixer 显得有些“麻烦”，但 three.js 的作者着眼于构建一个通用、强大且可扩展的动画系统。这种将数据（Clip）、控制（Action） 和 执行上下文（Mixer） 分离的设计，是实现复杂动画效果（如混合、过渡、同步）的基石。

它强迫你用一种更结构化、更具扩展性的方式来思考动画，虽然初学时有心智负担，但一旦理解了其设计意图，就能应对更高级的动画需求。
