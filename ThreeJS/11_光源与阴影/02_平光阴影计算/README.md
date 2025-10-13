## 🎯 阴影系统三要素（缺一不可）

### 必须同时满足：

```
1. 渲染器开启阴影
   renderer.shadowMap.enabled = true;

2. 光源产生阴影
   directionalLight.castShadow = true;

3. 物体角色分配
   • 投射阴影的物体：cube.castShadow = true;
   • 接收阴影的物体：plane.receiveShadow = true;
```

**核心：必须有"接收者"，阴影才有地方显示！**

------

## 🔍 为什么必须要平面接收阴影？

### 类比理解

```
现实世界：
🌞 太阳（光源）
👤 人（投射阴影）
🟫 地面（接收阴影）← 没有地面，阴影投到哪里？

Three.js：
💡 DirectionalLight（光源）
📦 Cube（投射阴影）
⬜ Plane（接收阴影）← 必须有！
```

**如果没有接收阴影的平面：**



```javascript
// ❌ 只有这些，阴影不会显示
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;
cube.castShadow = true;

// 问题：立方体的阴影投射出去了，但没有物体接收
// 结果：看不到阴影！
```

------

## 📐 阴影的完整流程（简化版）

### 步骤分解

```
步骤1：渲染器准备
━━━━━━━━━━━━━━━━━━━━━━
renderer.shadowMap.enabled = true;
↓
告诉渲染器："我要计算阴影"

步骤2：光源配置
━━━━━━━━━━━━━━━━━━━━━━
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.right = 200;
// ...
↓
光源说："我会产生阴影，范围是这么大"

步骤3：投射者设置
━━━━━━━━━━━━━━━━━━━━━━
cube.castShadow = true;
↓
立方体说："我会投射阴影"

步骤4：接收者设置（关键！）
━━━━━━━━━━━━━━━━━━━━━━
plane.receiveShadow = true;
↓
平面说："我可以接收阴影，把阴影画在我身上"

步骤5：渲染器计算
━━━━━━━━━━━━━━━━━━━━━━
1. 从光源视角渲染一次（生成深度图）
2. 计算哪些区域被遮挡（阴影区域）
3. 在接收阴影的物体上绘制阴影
```

------

## 🎨 核心概念：阴影相机范围

### 这个是什么意思？



```javascript
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.right = 200;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -200;
```

**类比：聚光灯的照射范围**

```
光源的"视野"：

       200 (top)
         ↑
         │
-200 ←───┼───→ 200
 (left)  │  (right)
         ↓
      -200 (bottom)

只有在这个范围内的物体才会产生阴影
超出范围的物体不会有阴影效果
```

**为什么要设置？**

```
- 范围太小 → 物体在范围外 → 没有阴影
- 范围太大 → 阴影精度降低（像素被分散）
- 刚刚好 → 阴影清晰且覆盖所有物体
```

------

## 💡 你的疑问解答

### Q1: 必须要创建平面来接收阴影吗？

**A: 是的，必须有接收阴影的物体！**



```javascript
// 接收阴影的可以是：
- 平面（最常见）
- 另一个立方体
- 球体
- 任何 Mesh 对象

// 只要设置了 receiveShadow = true 就行
```

**示例：立方体之间互相投影**



```javascript
const cube1 = new THREE.Mesh(geometry, material);
cube1.castShadow = true;      // 投射阴影
cube1.receiveShadow = true;   // 也接收阴影

const cube2 = cube1.clone();
cube2.castShadow = true;      // 投射阴影
cube2.receiveShadow = true;   // 也接收阴影

// 结果：两个立方体互相投射和接收阴影
```

------

### Q2: 为什么通常用平面接收阴影？

**A: 模拟现实世界的地面**

```
现实生活：
- 大部分阴影投在地面上
- 地面是平的
- 地面范围大，能接收所有阴影

Three.js 中：
- Plane = 地面
- 足够大，能接收所有物体的阴影
- 效果自然，符合直觉
```

------

## 📋 阴影配置清单（最小步骤）

### 完整的最小配置



```javascript
// ✅ 步骤1：渲染器
renderer.shadowMap.enabled = true;

// ✅ 步骤2：光源
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(100, 100, 0);
light.castShadow = true;
light.shadow.camera.left = -200;
light.shadow.camera.right = 200;
light.shadow.camera.top = 200;
light.shadow.camera.bottom = -200;
scene.add(light);

// ✅ 步骤3：投射阴影的物体
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(50, 50, 50),
  new THREE.MeshLambertMaterial()
);
cube.castShadow = true;
scene.add(cube);

// ✅ 步骤4：接收阴影的物体（必须！）
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshLambertMaterial()
);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;  // ← 关键！
scene.add(plane);
```

**缺少任何一步，阴影都不会显示！**

------

## 🎯 常见问题

### 问题1：阴影不显示

```
检查清单：
□ renderer.shadowMap.enabled = true 了吗？
□ light.castShadow = true 了吗？
□ 投射物体 castShadow = true 了吗？
□ 接收物体 receiveShadow = true 了吗？← 最容易忘
□ 光源范围够大吗？（shadow.camera 配置）
□ 物体在光源照射范围内吗？
```

------

### 问题2：阴影不清晰/有锯齿



```javascript
// 增加阴影贴图分辨率
light.shadow.mapSize.set(2048, 2048);  // 默认512
// 数值越大越清晰，但性能消耗越大
```

------

### 问题3：部分阴影被裁切



```javascript
// 调整光源范围
light.shadow.camera.left = -300;    // 增大范围
light.shadow.camera.right = 300;
light.shadow.camera.top = 300;
light.shadow.camera.bottom = -300;

// 或者用 CameraHelper 可视化范围
const helper = new THREE.CameraHelper(light.shadow.camera);
scene.add(helper);
```

------

## 💡 记忆口诀

> **"渲染器开关，光源配范围，投射者标记，接收者必备"**

或者：

> **"光源说我投，物体说我扔，平面说我接，缺一都不行"**

------

## 🎯 总结

### 回答你的两个核心问题

1. **必须要平面接收阴影吗？**
   - ✅ 必须有接收阴影的物体（不一定是平面）
   - 但通常用平面，因为模拟地面最自然
2. **阴影复杂吗？**
   - 概念简单：投射 → 接收
   - 配置稍多：4个步骤，缺一不可
   - 调试工具：用 CameraHelper 可视化范围

### 最小记忆点

```tcl
阴影 = 渲染器开启 + 光源配置 + 投射者 + 接收者
                                      ↑
                                   必须有！
```