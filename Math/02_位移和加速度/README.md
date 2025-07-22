# 匀速运动

```typescript
let t = 0;
const v = new THREE.Vector3(10, 0, 10);
const clock = new THREE.Clock();
const pos0 = model.position.clone();
// 渲染循环 - 将动画更新合并到这里
function render() {
  /* 匀速计算法则 */
  // 获取每次渲染的时间间隔
  const spt = clock.getDelta();
  // 更新时间
  t += spt;
  // v*t 速度x时间获取位移长度
  // 也就是在t时间内，以速度v运动的位移量
  const dis = v.clone().multiplyScalar(t);
  console.log('dis', dis);

  const newPos = pos0.clone().add(dis);
  model.position.copy(newPos);
  renderer.render(scene, camera);
  TWEEN.update();
  requestAnimationFrame(render);
}
render();
```

| **变量**                    | **含义**                                               |
| --------------------------- | ------------------------------------------------------ |
| v                           | **速度向量**，表示每秒 x 轴移动 10、z 轴移动 10 的速度 |
| t                           | **时间累加器**，表示从动画开始已经过去了多少秒         |
| v.clone().multiplyScalar(t) | 计算**累计位移向量**：速度 × 时间                      |
| add(dis)                    | 将起始位置 pos0 与位移相加，得到当前应该移动到的坐标   |

### **🔍 回答你的问题**

> v 实际上是不是并非是一个位置点，而是充当速度的定义属性，x 时间 t 才是唯一的位移距离，而不是在 add 中作为移动到某个点的位置存在？

- **没错！** v 是一个速度向量，不是位置；
- v.clone().multiplyScalar(t) 才是 **位移**；
- add(...) 是将 **起始位置** + **位移** → 得到当前 **目标位置**。



## **🌀 类比一下**

想象你开车：

- v = 60 km/h（相当于 new Vector3(60,0,0)）
- t = 2小时（累积时间）
- 位移 = v * t = 120 km
- 当前坐标 = 起点 + 120 km，而不是直接 v

## **✅ 总结**

- v：速度，不是位置
- dis = v × t：总位移
- add(dis)：得到当前位置
- 每帧依据 elapsed time 用数学方式控制匀速运动，是最标准的物理运动写法

# 重力加速度运动

重力加速度运动是在匀速运动基础上增加了重力的影响，物体不仅有初速度，还会受到重力的持续加速作用。

## 第一种写法：积分方法（基于总时间）

```typescript
let t = 0;
const v = new THREE.Vector3(0, -30, 0);  // 初始速度
const g = new THREE.Vector3(0, -9.8, 0); // 重力加速度
const clock = new THREE.Clock();
const pos0 = model.position.clone();

function render() {
  const spt = clock.getDelta();
  t += spt;
  
  // 位移 = 初速度×时间 + ½×重力×时间²
  const dis = v
    .clone()
    .multiplyScalar(t)
    .add(g.clone().multiplyScalar(0.5 * t * t));
    
  const newPos = pos0.clone().add(dis);
  model.position.copy(newPos);
  
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
```

## 第二种写法：微分方法（逐帧累加）

```typescript
const v = new THREE.Vector3(0, -30, 0);  // 初始速度（会被修改）
const g = new THREE.Vector3(0, -9.8, 0); // 重力加速度
const clock = new THREE.Clock();

function render() {
  const spt = clock.getDelta();
  
  // 每帧更新速度：当前速度 += 重力加速度 × 时间间隔
  const spV = g.clone().multiplyScalar(spt);
  v.add(spV);
  
  // 计算这一帧的位移：当前速度 × 时间间隔
  const dis = v.clone().multiplyScalar(spt);
  model.position.add(dis);
  
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
```

## 两种写法的对比

| **特性**       | **第一种写法（积分方法）**                   | **第二种写法（微分方法）**               |
| -------------- | -------------------------------------------- | ---------------------------------------- |
| **物理公式**   | `s = v₀t + ½gt²`                            | `v = v₀ + gt`，`s = vt`                 |
| **计算方式**   | 每帧基于总时间重新计算总位移                 | 每帧更新速度，然后计算该帧位移           |
| **数值精度**   | ✅ 高精度，误差不累积                       | ⚠️ 可能有累积误差                       |
| **性能**       | ⚠️ 需要平方计算                             | ✅ 只有加法和乘法                       |
| **扩展性**     | ❌ 难以添加其他力（阻力、风力等）            | ✅ 容易添加各种力的影响                 |
| **帧率影响**   | ✅ 不受帧率波动影响                          | ⚠️ 帧率不稳定时可能产生误差             |
| **适用场景**   | 简单重力模拟、高精度要求                     | 复杂物理系统、游戏开发                   |

## 核心概念解析

| **变量** | **含义**                                     |
| -------- | -------------------------------------------- |
| v        | **速度向量**，表示物体运动的方向和快慢       |
| g        | **重力加速度向量**，通常为 `(0, -9.8, 0)`   |
| t        | **总时间**（第一种写法）                     |
| spt      | **帧时间间隔**（第二种写法）                 |
| dis      | **位移向量**，表示物体移动的距离和方向       |

## 🔍 重点理解

### 为什么会加速？
- **第一种写法**：`0.5 * t * t` 项使**位移随时间平方增长**
- **第二种写法**：**每帧速度都在增加**，导致每帧位移越来越大

### 物理意义
在现实中，自由落体运动就是典型的重力加速度运动：
- 初始速度可能为 0（从静止开始）或有初值（抛物运动）
- 重力持续向下加速物体
- 速度越来越快，单位时间内的位移越来越大

## ✅ 总结

- **第一种写法**：适合精确的物理模拟，基于严格的数学公式
- **第二种写法**：适合游戏开发和复杂场景，更灵活易扩展
- 两种方法在理想条件下效果相同，但实际应用中各有优势