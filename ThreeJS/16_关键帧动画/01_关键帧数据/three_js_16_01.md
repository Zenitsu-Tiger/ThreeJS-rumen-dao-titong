**Title:** Three.js 16章 · 01 关键帧数据与播放控制学习指南
**Subject:** Three.js 关键帧动画系统（第 16 章）
**Topics:**
  * 关键帧轨道数据结构与颜色归一化规范（`KeyframeTrack`）
  * 动画剪辑、混合器与动作控制器的协作链路（`AnimationClip` / `AnimationMixer` / `AnimationAction`）
  * 单次播放与播完定格控制（`THREE.LoopOnce` 与 `clampWhenFinished`）
  * 动作重置边界与播放时间控制（`action.reset()`、`action.time`、`clip.duration`、`action.timeScale`）
  * 渲染循环中的帧间隔驱动与属性覆盖机制（`clock.getDelta()`）
**Summary:** 根据你的自测结果，你已经扎实掌握了关键帧动画的主干架构——包括轨道命名与 `mesh.name` 匹配、`times` 与 `values` 的长度对应、`AnimationClip` 时长设为 `-1` 的自动计算、`AnimationMixer` 根节点绑定、`clock.getDelta()` 驱动原理以及关键帧直接覆盖原有属性的特性。本学习指南重点聚焦你本次失分的 4 个控制细节：颜色轨道必须使用 `0~1` 浮点 RGB、单次播放默认回弹需靠 `clampWhenFinished = true` 定格、`action.reset()` 会清零 `action.time` 但保留 `clip.duration`，以及播放倍速 `timeScale` 与实际耗时的除法换算关系。
**Key Concepts:**
  * 颜色关键帧的 0~1 归一化数值规范（重点突破）：在 Three.js 材质颜色与 `KeyframeTrack('Box.material.color', times, values)` 中，RGB 分量采用 `0` 到 `1` 的浮点数而非 CSS 常见的 `0` 到 `255`。例如纯红到纯蓝的平滑过渡应写为 `[1, 0, 0, 0, 0, 1]`，混色紫色为 `(0.5, 0, 0.5)`；若误填 `255` 会导致色彩严重过曝失真。
  * 单次播放与 `clampWhenFinished` 的默认回弹机制（重点突破）：设置 `action.loop = THREE.LoopOnce` 只会让动画播放一遍，但 `action.clampWhenFinished` 的默认值是 `false`。这意味着动画到达最后一帧结束的瞬间，模型会立刻弹回播放前的初始位置与颜色；只有显式设置 `action.clampWhenFinished = true`，画面才会定格在最后一帧。
  * `action.reset()` 的作用边界：`action.time` 与 `clip.duration` 的区别（重点突破）：`reset()` 是 `AnimationAction` 实例上的方法，它只会重置动作自身的播放状态（把 `action.time` 归零、解除暂停并重新启用），而不会修改剪辑对象 `AnimationClip` 上的 `clip.duration`。因此若初始化设置了 `action.time = 3` 且 `clip.duration = 5`，点击按钮执行 `action.reset().play()` 后，动画会从第 `0` 秒播到第 `5` 秒；如果仍想从第 `3` 秒起播，必须在 `reset()` 之后重新给 `action.time = 3` 赋值。
  * 倍速播放 `action.timeScale` 与真实耗时的换算（重点突破）：`action.timeScale` 是播放速度倍率，数值越大播得越快、实际耗时越短，换算公式为 $\text{实际真实耗时} = \frac{\text{播放时长}}{\text{timeScale}}$。当 `clip.duration = 5`、`action.time = 0` 且 `action.timeScale = 2`（2 倍速）时，完整播完只需 $5 \div 2 = 2.5$ 秒（若设 `0.5` 慢放则需 $5 \div 0.5 = 10$ 秒）。
  * 关键帧动画的四层协作架构与属性覆盖（已掌握巩固）：`KeyframeTrack` 定义单个属性随时间的变化（位置或颜色每时刻占 3 个数，`values.length = times.length * 3`），要求目标节点具有匹配的 `.name`；`AnimationClip` 打包多条轨道（`duration` 传 `-1` 自动取最长轨道结束时间）；`AnimationMixer(rootObject)` 绑定目标节点本身或其祖先容器；播放时插值结果会直接覆盖对象原有属性，而非在原值上累加。
  * 基于帧间隔的渲染循环驱动（已掌握巩固）：`action.play()` 只将动作标记为激活状态，真正推动时间轴的是渲染循环中每帧调用 `mixer.update(clock.getDelta())`。必须传入两帧之间的时间差（delta）而非从启动至今的累计时间（elapsed time），否则步长会越来越大导致动画瞬间播完。
**Vocabulary List:**
  * `KeyframeTrack`: 关键帧轨道，定义单个对象属性（如 `'Box.position'`、`'Box.material.color'`）在多个时间点 `times` 上对应的扁平数值序列 `values`。
  * `AnimationClip`: 动画剪辑，可复用的动画数据容器，用来把多条 `KeyframeTrack` 打包为一个完整的动画片段，并定义总时长 `duration`。
  * `AnimationMixer`: 动画混合器（播放器），绑定到特定根对象（目标节点本身或其父级分组），负责在每帧更新时查找轨道目标并计算属性插值。
  * `AnimationAction`: 动画动作控制器，由 `mixer.clipAction(clip)` 生成，负责控制具体播放行为（播放、暂停、循环模式、时间进度、倍速与重置）。
  * `clampWhenFinished`: `AnimationAction` 的布尔属性，默认为 `false`；配合 `THREE.LoopOnce` 设为 `true` 时，动画播放结束后会停留在最后一帧而不弹回初始状态。
  * `action.reset()`: 重置动作状态的方法，会将 `action.time` 清零并恢复非暂停状态，但不会改写 `clip.duration` 等剪辑数据。
  * `action.timeScale`: 播放速度倍率属性，默认 `1`；大于 `1` 加速播放（耗时缩短），介于 `0` 与 `1` 之间慢速播放（耗时拉长），`0` 相当于静止。
  * `clock.getDelta()`: `THREE.Clock` 的方法，返回距离上一次调用所经过的时间间隔（单位：秒），用于驱动 `mixer.update(delta)` 平滑推进动画。
**Key Questions:**
  * 如果要用 `KeyframeTrack('Box.material.color', [0, 2, 4], values)` 实现「纯绿 → 纯白 → 纯蓝」的过渡，`values` 数组应该怎么写？为什么不能填 `255`？
  * 当你设置了 `action.loop = THREE.LoopOnce` 后，发现动画播到终点瞬间又跳回了起点，最可能漏掉了哪一行配置？为什么会发生回弹？
  * 已知原始轨道时长为 6 秒，初始化时执行了 `clip.duration = 4;` 和 `action.time = 2;`。若用户点击按钮触发 `action.reset().play()`，动画会从第几秒播到第几秒？若想每次点击都固定从第 2 秒播到第 4 秒，代码应怎么改？
  * 一段从 `0` 秒播到 `6` 秒的单次动画，将 `action.timeScale` 分别设为 `3` 和 `0.5` 时，在现实世界中播完各需要多少秒？
  * 为什么在关键帧动画已经设置 `mesh.position.y = 7.5` 的前提下，位移动画 `values` 中的每个 `y` 分量仍然必须填 `7.5` 而不能填 `0`？