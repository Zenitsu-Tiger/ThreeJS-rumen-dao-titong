# Three.js 关键帧动画详解

在Three.js中，实现关键帧动画主要涉及以下几个核心对象和步骤。整个流程可以理解为：先定义好动画每一帧的"剧本"（`KeyframeTrack`），然后将多个"剧本"组合成一个完整的"动画影片"（`AnimationClip`），最后通过"播放器"（`AnimationMixer`）在指定的对象上播放这个"影片"。

---

### 第一步：创建关键帧轨道 (`KeyframeTrack`)

`KeyframeTrack`是动画的基础，它定义了**单个属性**（例如位置、颜色、缩放）随时间变化的序列。

- **构造函数**: `new THREE.KeyframeTrack(name, times, values)`
- **关键参数**:
    1.  `name` (String): 要驱动的动画属性的名称。格式为 `"对象名称.属性"` 或 `"对象名称.材质.属性"`。例如：
        - `'Box.position'`：控制名为`Box`的网格的位置。
        - `'Box.material.color'`：控制名为`Box`的网格的材质颜色。
    2.  `times` (Array): 时间轴上的关键帧时间点数组，单位为秒。
        - 示例: `[0, 3, 6]` 表示动画在第0秒、第3秒和第6秒有关键状态。
    3.  `values` (Array): 与`times`数组一一对应的属性值数组。**此数组的长度必须是 `times.length` 乘以每个状态的数值数量**。
        - 对于位置 (`.position`)，每个状态有x, y, z三个值，所以`values`长度应为 `times.length * 3`。
        - 对于颜色 (`.color`)，每个状态有r, g, b三个值，所以`values`长度也应为 `times.length * 3`。
        - **示例 (位置)**: `times=[0,3,6]`, `values=[0,0,0, 100,0,0, 0,0,100]`
            - 0秒时: `position` 是 `(0,0,0)`
            - 3秒时: `position` 是 `(100,0,0)`
            - 6秒时: `position` 是 `(0,0,100)`

---

### 第二步：创建动画剪辑 (`AnimationClip`)

`AnimationClip`是一个可复用的动画数据单元，它相当于一个容器，可以包含一个或多个`KeyframeTrack`。

- **构造函数**: `new THREE.AnimationClip(name, duration, tracks)`
- **关键参数**:
    1.  `name` (String): 动画剪辑的名称，方便识别和调用。例如 `'test'`。
    2.  `duration` (Number): 动画剪辑的总时长（秒）。如果设为-1，时长将根据最长的`KeyframeTrack`自动计算。
    3.  `tracks` (Array): 一个包含`KeyframeTrack`对象的数组。你可以把位置、颜色、缩放等多个轨道的动画都放进来，让它们同时播放。
        - **示例**: `const clip = new THREE.AnimationClip('test', 6, [posKF, colorKF]);`

---

### 第三步：创建动画混合器 (`AnimationMixer`)

`AnimationMixer`是动画的播放器和控制器。它将`AnimationClip`中定义的动画应用到场景中的某个具体对象上。

- **构造函数**: `new THREE.AnimationMixer(rootObject)`
- **关键参数**:
    1.  `rootObject` (Object3D): 要应用动画的根对象。动画轨道中引用的对象（如名为`Box`的`mesh`）必须是此根对象的子级。
        - **示例**: `const mixer = new THREE.AnimationMixer(mesh);`

---

### 第四步：创建并播放动画动作 (`AnimationAction`)

`AnimationAction`用于控制动画的播放、暂停、停止等。它通过`AnimationMixer`创建。

- **创建方法**: `mixer.clipAction(clip)`
- **常用操作**:
    - `.play()`: 播放动画。
    - `.stop()`: 停止动画。
    - `.reset()`: 重置动画。
    - `.setLoop(THREE.LoopOnce, 0)`: 设置循环模式和次数。

- **示例**:
  ```javascript
  const action = mixer.clipAction(clip);
  action.play();
  ```

---

### 第五步：在渲染循环中更新动画

为了让动画动起来，必须在渲染循环（`requestAnimationFrame`）中持续更新`AnimationMixer`。

- **核心**: 使用`THREE.Clock`来获取每帧之间的时间差（delta），并用这个时间差来更新`AnimationMixer`。
- **示例**:
  
  ```javascript
  const clock = new THREE.Clock();
  
  function render() {
    // 获取自上次调用以来经过的时间
    const delta = clock.getDelta();
    // 更新播放器
    if (mixer) {
        mixer.update(delta);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  
  render();
  ```

# Three.js 关键帧动画详解

在Three.js中，实现关键帧动画主要涉及以下几个核心对象和步骤。整个流程可以理解为：先定义好动画每一帧的"剧本"（`KeyframeTrack`），然后将多个"剧本"组合成一个完整的"动画影片"（`AnimationClip`），最后通过"播放器"（`AnimationMixer`）在指定的对象上播放这个"影片"。

---

### 第一步：创建关键帧轨道 (`KeyframeTrack`)

`KeyframeTrack`是动画的基础，它定义了**单个属性**（例如位置、颜色、缩放）随时间变化的序列。

- **构造函数**: `new THREE.KeyframeTrack(name, times, values)`
- **关键参数**:
    1.  `name` (String): 要驱动的动画属性的名称。格式为 `"对象名称.属性"` 或 `"对象名称.材质.属性"`。例如：
        - `'Box.position'`：控制名为`Box`的网格的位置。
        - `'Box.material.color'`：控制名为`Box`的网格的材质颜色。
    2.  `times` (Array): 时间轴上的关键帧时间点数组，单位为秒。
        - 示例: `[0, 3, 6]` 表示动画在第0秒、第3秒和第6秒有关键状态。
    3.  `values` (Array): 与`times`数组一一对应的属性值数组。**此数组的长度必须是 `times.length` 乘以每个状态的数值数量**。
        - 对于位置 (`.position`)，每个状态有x, y, z三个值，所以`values`长度应为 `times.length * 3`。
        - 对于颜色 (`.color`)，每个状态有r, g, b三个值，所以`values`长度也应为 `times.length * 3`。
        - **示例 (位置)**: `times=[0,3,6]`, `values=[0,0,0, 100,0,0, 0,0,100]`
            - 0秒时: `position` 是 `(0,0,0)`
            - 3秒时: `position` 是 `(100,0,0)`
            - 6秒时: `position` 是 `(0,0,100)`

---

### 第二步：创建动画剪辑 (`AnimationClip`)

`AnimationClip`是一个可复用的动画数据单元，它相当于一个容器，可以包含一个或多个`KeyframeTrack`。

- **构造函数**: `new THREE.AnimationClip(name, duration, tracks)`
- **关键参数**:
    1.  `name` (String): 动画剪辑的名称，方便识别和调用。例如 `'test'`。
    2.  `duration` (Number): 动画剪辑的总时长（秒）。如果设为-1，时长将根据最长的`KeyframeTrack`自动计算。
    3.  `tracks` (Array): 一个包含`KeyframeTrack`对象的数组。你可以把位置、颜色、缩放等多个轨道的动画都放进来，让它们同时播放。
        - **示例**: `const clip = new THREE.AnimationClip('test', 6, [posKF, colorKF]);`

---

### 第三步：创建动画混合器 (`AnimationMixer`)

`AnimationMixer`是动画的播放器和控制器。它将`AnimationClip`中定义的动画应用到场景中的某个具体对象上。

- **构造函数**: `new THREE.AnimationMixer(rootObject)`
- **关键参数**:
    1.  `rootObject` (Object3D): 要应用动画的根对象。动画轨道中引用的对象（如名为`Box`的`mesh`）必须是此根对象的子级。
        - **示例**: `const mixer = new THREE.AnimationMixer(mesh);`

---

### 第四步：创建并播放动画动作 (`AnimationAction`)

`AnimationAction`用于控制动画的播放、暂停、停止等。它通过`AnimationMixer`创建。

- **创建方法**: `mixer.clipAction(clip)`
- **常用操作**:
    - `.play()`: 播放动画。
    - `.stop()`: 停止动画。
    - `.reset()`: 重置动画。
    - `.setLoop(THREE.LoopOnce, 0)`: 设置循环模式和次数。

- **示例**:
  ```javascript
  const action = mixer.clipAction(clip);
  action.play();
  ```

---

### 第五步：在渲染循环中更新动画

为了让动画动起来，必须在渲染循环（`requestAnimationFrame`）中持续更新`AnimationMixer`。

- **核心**: 使用`THREE.Clock`来获取每帧之间的时间差（delta），并用这个时间差来更新`AnimationMixer`。
- **示例**:
  ```javascript
  const clock = new THREE.Clock();
  
  function render() {
    // 获取自上次调用以来经过的时间
    const delta = clock.getDelta();
    // 更新播放器
    if (mixer) {
        mixer.update(delta);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  
  render();
  ```

---

## 动画控制与高级技巧

### 时间控制

**1. 设置动画开始时间**
```javascript
action.time = 3;  // 从第3秒开始播放动画
```

**2. 控制动画总时长**
```javascript
clip.duration = 5;  // 将动画总时长设置为5秒
```

**3. 播放速度控制**
```javascript
action.timeScale = 2;  // 2倍速播放
action.timeScale = 0.5; // 0.5倍速播放（慢放）
```

### 循环模式设置

```javascript
// 循环播放
action.loop = THREE.LoopRepeat;

// 只播放一次
action.loop = THREE.LoopOnce;

// 来回循环播放
action.loop = THREE.LoopPingPong;
```

### 动画状态控制

**1. 播放完成后的行为**
```javascript
// 播放完成后保持在最后一帧，不回到初始状态
action.clampWhenFinished = true;
```

**2. 暂停与恢复**
```javascript
// 暂停动画
action.paused = true;

// 恢复播放
action.paused = false;
```

**3. 重置动画**
```javascript
// 重置动画到初始状态
action.reset();

// 重置并播放
action.reset().play();
```

### 颜色动画详解

颜色动画使用RGB值，范围是0-1：

```javascript
const colorKF = new THREE.KeyframeTrack('Box.material.color', 
    [2, 3.5, 5],           // 时间点
    [1,0,0, 0.5,0,0.5, 0,0,1]  // RGB值：红色→紫色→蓝色
);
```

- `(1,0,0)` = 红色
- `(0,1,0)` = 绿色  
- `(0,0,1)` = 蓝色
- `(0.5,0,0.5)` = 紫色（混合色）

### 重要注意事项

1. **reset()的影响**: `action.reset()` 会将 `action.time` 重置为0，但不会影响 `clip.duration` 和其他clip属性。

2. **数据格式正确性**: `times` 和 `values` 数组必须匹配：
   - 位置动画：`values.length = times.length × 3`
   - 颜色动画：`values.length = times.length × 3`

3. **关键帧覆盖**: 关键帧动画会直接覆盖对象的属性值，不是在原有值基础上进行动画。

4. **GUI集成**: 可以使用lil-gui来实时调试动画参数：
   ```javascript
   import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
   const gui = new GUI();
   gui.add(action, 'timeScale', 0, 10);
   ```

### 实用的动画控制模式

```javascript
// 完整的动画控制设置
const action = mixer.clipAction(clip);
action.play();
action.time = 3;           // 从第3秒开始
clip.duration = 5;         // 播放5秒
action.clampWhenFinished = true;  // 完成后保持状态
action.loop = THREE.LoopOnce;     // 只播放一次

// 按钮控制
document.getElementById('play').addEventListener('click', () => {
    action.reset().play();
    action.time = 3;  // reset后重新设置开始时间
});

document.getElementById('pause').addEventListener('click', () => {
    action.paused = true;
});

document.getElementById('resume').addEventListener('click', () => {
    action.paused = false;
});
```
