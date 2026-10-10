# TweenJS 动画库 - onUpdate 方法详解

## 概述

本项目展示了如何在 Three.js 中集成 TweenJS 动画库，特别是 `onUpdate` 回调方法的使用。

## onUpdate 方法解析

### 基本语法

```javascript
new TWEEN.Tween(target)
  .to(properties, duration)
  .start()
  .onUpdate(callback)
```

### 项目中的具体应用

```javascript
new TWEEN.Tween(camera.position)
  .to({x:180, y:100, z:-350}, 3000)
  .start()
  .onUpdate(() => camera.lookAt(0, 0, 0))
```

### onUpdate 的作用机制

#### 1. **实时回调执行**
- `onUpdate` 在动画的每一帧都会被调用
- 确保在动画过程中可以执行自定义逻辑
- 与渲染循环同步，保证流畅的视觉效果

#### 2. **本例中的具体作用**
```javascript
// 相机位置从 (200, 200, 200) 动画到 (180, 100, -350)
camera.position: {x: 200, y: 200, z: 200} → {x: 180, y: 100, z: -350}

// 在位置变化的每一帧，都让相机朝向原点 (0, 0, 0)
onUpdate(() => camera.lookAt(0, 0, 0))
```

#### 3. **为什么需要 onUpdate？**

**问题场景：**
- 如果只是简单地移动相机位置，相机的朝向不会自动调整
- 相机会保持初始的朝向角度，导致视觉效果不自然

**解决方案：**
- 使用 `onUpdate` 确保在位置变化的同时，相机始终朝向目标点
- 实现平滑的"环绕观察"效果

### 其他常见的 onUpdate 用法

#### 1. **更新物体旋转**
```javascript
new TWEEN.Tween(mesh.position)
  .to({x: 100, y: 0, z: 0}, 2000)
  .onUpdate(() => {
    mesh.rotation.y += 0.01; // 移动时同时旋转
  })
  .start();
```

#### 2. **同步多个属性**
```javascript
new TWEEN.Tween({progress: 0})
  .to({progress: 1}, 3000)
  .onUpdate((obj) => {
    // 根据进度同步更新多个对象
    mesh.scale.setScalar(obj.progress);
    material.opacity = obj.progress;
  })
  .start();
```

#### 3. **调试和监控**
```javascript
new TWEEN.Tween(camera.position)
  .to({x: 100, y: 100, z: 100}, 2000)
  .onUpdate(() => {
    console.log('相机位置:', camera.position);
    // 实时输出动画进度
  })
  .start();
```

## 完整的动画链式调用

```javascript
new TWEEN.Tween(camera.position)
  .to({x: 180, y: 100, z: -350}, 3000)
  .easing(TWEEN.Easing.Quadratic.InOut)  // 缓动函数
  .start()                                // 开始动画
  .onUpdate(() => camera.lookAt(0, 0, 0)) // 每帧回调
  .onComplete(() => {                     // 完成回调
    console.log('相机动画完成');
  });
```

## 注意事项

1. **性能考虑**：`onUpdate` 在每帧都会执行，避免在其中进行复杂计算
2. **渲染循环**：确保在渲染循环中调用 `TWEEN.update()`
3. **this 绑定**：使用箭头函数避免 this 绑定问题

## 渲染循环集成

```javascript
function render() {
  TWEEN.update();  // 更新所有活动的补间动画
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
```

## 总结

`onUpdate` 方法是 TweenJS 中的强大功能，允许我们在动画过程中执行自定义逻辑。在本项目中，它确保了相机在移动过程中始终保持正确的朝向，创造了流畅的视觉体验。

# 动态贴近目标模型

```typescript
document.getElementById('A').addEventListener('click',()=>{
  const pos=new THREE.Vector3()
  const A=group.getObjectByName('设备A标注')
  A.getWorldPosition(pos)
// xyz属性可以通过addScalar分别增加对应的数值，保持一定距离
  const pos2=pos.clone().addScalar(30)
  new TWEEN.Tween({
    // 相机开始坐标
    x:camera.position.x,
    y:camera.position.y,
    z:camera.position.z,
    // 相机开始的时候指向的目标观察点
    tx:0,
    ty:0,
    tz:0
  }).to({
    x:pos2.x,
    y:pos2.y,
    z:pos2.z,
    // 动画结束相机最终落定的目标观察点
    tx:pos.x,
    ty:pos.y,
    tz:pos.z
  },2000).onUpdate((obj)=>{
    // 动态更改相机位置
    camera.position.set(obj.x,obj.y,obj.z)
    // 动态计算相机视线
    camera.lookAt(obj.tx,obj.ty,obj.tz)
  }).start()
})
```

## obj 参数的实际含义

obj 不是直接指向 to() 函数里的参数，而是一个动态插值对象，它包含了从起始值到目标值之间的当前插值结果。

## 详细解析

### 1. 三个关键对象

```typescript
// 起始对象（构造函数参数）
const startObj = {
  x: camera.position.x,  // 比如: 200
  y: camera.position.y,  // 比如: 200  
  z: camera.position.z,  // 比如: 200
  tx: 0, ty: 0, tz: 0
};

// 目标对象（to方法参数）
const targetObj = {
  x: pos2.x,  // 比如: 100
  y: pos2.y,  // 比如: 150
  z: pos2.z,  // 比如: 300
  tx: pos.x, ty: pos.y, tz: pos.z
};

// onUpdate中的obj（实时插值对象）
// obj会在动画过程中不断变化
```

### 2. 插值计算过程

假设动画进度为 50%：

```typescript
// 起始值: x = 200, 目标值: x = 100
// 当前插值: obj.x = 200 + (100 - 200) * 0.5 = 150

onUpdate((obj) => {
  console.log(obj.x);  // 输出: 150 (50%进度时)
  console.log(obj.y);  // 相应的插值结果
  console.log(obj.z);  // 相应的插值结果
})
```

### 3. 动画时间轴示例

```typescript
// 动画开始时 (0%)
obj = {x: 200, y: 200, z: 200, tx: 0, ty: 0, tz: 0}

// 动画进行中 (25%)
obj = {x: 175, y: 187.5, z: 225, tx: pos.x*0.25, ty: pos.y*0.25, tz: pos.z*0.25}

// 动画进行中 (50%)  
obj = {x: 150, y: 175, z: 250, tx: pos.x*0.5, ty: pos.y*0.5, tz: pos.z*0.5}

// 动画结束时 (100%)
obj = {x: pos2.x, y: pos2.y, z: pos2.z, tx: pos.x, ty: pos.y, tz: pos.z}
```

## 实际应用效果

```typescript
.onUpdate((obj) => {
  // obj.x, obj.y, obj.z 是实时计算的相机位置
  camera.position.set(obj.x, obj.y, obj.z);
  
  // obj.tx, obj.ty, obj.tz 是实时计算的观察目标点
  camera.lookAt(obj.tx, obj.ty, obj.tz);
})
```

## 总结

- obj 是实时插值对象，不是静态的目标对象
- 它的每个属性都是从起始值到目标值的当前插值结果
- 随着动画进度从 0% 到 100%，obj 的值会平滑变化
- 这样实现了相机位置和观察目标的同步平滑动画

这种设计让您可以同时动画化多个属性（位置 + 观察目标），创造出复杂的相机运动效果！

## 考虑OrbitControls的影响

在使用 TweenJS 控制相机动画时，需要特别注意 OrbitControls 的影响。正确处理两者的协作关系对于获得良好的用户体验至关重要。

### OrbitControls 的工作原理

OrbitControls 允许用户通过鼠标交互来控制相机围绕一个**目标点（target）**进行旋转、缩放和平移：

```javascript
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);  // 默认围绕原点旋转
controls.update();
```

### 问题分析：为什么需要更新 target？

#### 1. **默认行为的问题**

```javascript
// 动画前：相机在 (200, 200, 200)，观察原点 (0, 0, 0)
// OrbitControls.target = (0, 0, 0)

// 动画后：相机移动到目标物体附近，观察目标物体
// 但 OrbitControls.target 仍然是 (0, 0, 0) ❌
```

**结果：**
- 用户试图旋转视角时，相机会围绕**原点**旋转，而不是围绕**目标物体**
- 造成视觉上的混乱和操作体验不佳

#### 2. **解决方案：同步更新 target**

```javascript
.onComplete(() => {
  // 动画完成后，将 OrbitControls 的目标点设置为物体位置
  controls.target.set(pos.x, pos.y, pos.z);
  controls.update();
})
```

### 完整的解决方案

```javascript
document.getElementById('A').addEventListener('click', () => {
  const pos = new THREE.Vector3();
  const A = group.getObjectByName('设备A标注');
  A.getWorldPosition(pos);
  
  const pos2 = pos.clone().addScalar(30);
  
  new TWEEN.Tween({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    tx: 0, ty: 0, tz: 0  // 从原点开始观察
  }).to({
    x: pos2.x,
    y: pos2.y,
    z: pos2.z,
    tx: pos.x, ty: pos.y, tz: pos.z  // 最终观察目标物体
  }, 2000).onUpdate((obj) => {
    camera.position.set(obj.x, obj.y, obj.z);
    camera.lookAt(obj.tx, obj.ty, obj.tz);
  }).onComplete(() => {
    // 🔑 关键：同步 OrbitControls 的目标点
    controls.target.set(pos.x, pos.y, pos.z);
    controls.update();
  }).start();
});
```

### 对比效果

#### ❌ 不设置 target 的后果

```javascript
// 动画完成后
camera.position = (pos2.x, pos2.y, pos2.z);  // 相机在目标物体附近
camera.lookAt(pos.x, pos.y, pos.z);          // 相机观察目标物体
controls.target = (0, 0, 0);                 // 但控制器仍指向原点！

// 用户拖拽鼠标时：
// 相机会围绕原点 (0,0,0) 旋转，脱离目标物体视野 ❌
```

#### ✅ 正确设置 target 的效果

```javascript
// 动画完成后
camera.position = (pos2.x, pos2.y, pos2.z);
camera.lookAt(pos.x, pos.y, pos.z);
controls.target = (pos.x, pos.y, pos.z);     // 控制器目标点同步

// 用户拖拽鼠标时：
// 相机围绕目标物体旋转，保持物体在视野中心 ✅
```

### 最佳实践建议

#### 1. **动画期间禁用控制器**
```javascript
new TWEEN.Tween(...)
  .onStart(() => {
    controls.enabled = false;  // 动画期间禁用用户交互
  })
  .onComplete(() => {
    controls.target.set(pos.x, pos.y, pos.z);
    controls.enabled = true;   // 动画完成后重新启用
    controls.update();
  })
  .start();
```

#### 2. **渐进式目标点过渡**
```javascript
// 如果需要，也可以让 target 跟随动画平滑过渡
.onUpdate((obj) => {
  camera.position.set(obj.x, obj.y, obj.z);
  camera.lookAt(obj.tx, obj.ty, obj.tz);
  
  // 实时更新控制器目标点（可选）
  controls.target.set(obj.tx, obj.ty, obj.tz);
})
```

#### 3. **重置到全局视图**
```javascript
document.getElementById('all').addEventListener('click', () => {
  new TWEEN.Tween(camera.position)
    .to({x: 200, y: 200, z: 200}, 2000)
    .onUpdate(() => camera.lookAt(0, 0, 0))
    .onComplete(() => {
      controls.target.set(0, 0, 0);  // 重置到原点
      controls.update();
    })
    .start();
});
```

### 核心要点

1. **同步性**：确保 OrbitControls 的 target 与相机的观察目标保持一致
2. **时机**：在动画完成后（onComplete）更新 target，而不是在动画过程中
3. **用户体验**：让用户的交互行为符合视觉预期，围绕感兴趣的物体旋转
4. **控制权移交**：从 TweenJS 动画控制平滑过渡到用户手动控制

通过正确处理 OrbitControls 的 target，可以确保动画结束后用户交互的连贯性和直观性。





