# Three.js 管道漫游实现原理

管道漫游的核心目标是让摄像机沿着一条预设的、平滑的路径在 3D 空间中移动，同时始终朝向路径前进的方向，从而创造出一种身临其境的第一人称漫游体验。

## 一、核心要素

要实现管道漫游，我们需要以下几个关键部分协同工作：

### 1. 定义一条平滑的3D路径

这是漫游的基础。我们通常不使用生硬的折线，而是使用曲线来保证运动的流畅性。Three.js 提供了多种曲线类型，其中 CatmullRomCurve3 非常适合此场景，因为它能穿过所有给定的控制点并生成平滑的路径。

关键代码 (mesh.js):

```typescript
import * as THREE from "three";

// 1. 使用一系列三维向量点来定义路径的关键节点
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-50, 20, 90),
  new THREE.Vector3(-10, 40, 40),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(90, -40, 60),
  new THREE.Vector3(120, 30, 30),
]);
```

### 2. 将路径离散化为等距点

直接在曲线上移动摄像机很难控制速度的恒定。一个更简单且高效的方法是，预先在曲线上采集一系列等距的点，然后让摄像机在这些点之间逐个移动。这样就能保证无论曲线如何弯曲，摄像机的移动速度都保持不变。

getSpacedPoints(divisions) 方法正是为此而生。

关键代码 (mesh.js):

```typescript
// 2. 沿着曲线生成 500 个等距的点，存入一个数组中
// 这个数组是实现平滑、匀速漫游的关键
const pointsArr = path.getSpacedPoints(500);

// 导出 pointsArr 供主程序使用
export { group, pointsArr };
```

- pointsArr 现在是一个包含 501 个 Vector3 点的数组，它们在路径上均匀分布。

### 3. 创建管道几何体

为了有“管道”的视觉效果，我们使用 TubeGeometry 基于上面创建的 path 来生成一个管状的模型。

关键代码 (mesh.js):

```typescript
// 3. 基于路径创建管道模型
const geometry = new THREE.TubeGeometry(path, 200, 5, 30);
// ... 创建材质和网格 ...
```

## 二、实现原理与动画循环

真正的漫游动画发生在渲染循环（animate 函数）中。原理非常直观：在每一帧，我们都将摄像机移动到路径数组中的下一个点，并让它朝向下下个点。

### 实现步骤:

1. 初始化： 在主程序中，导入从 mesh.js 导出的 pointsArr 数组。定义一个索引变量（如 roamIndex）来追踪摄像机当前在数组中的位置，初始值为 0。

2. 动画更新 (在 animate 函数内):

   - 获取当前点和目标点：根据 roamIndex 从 pointsArr 中获取当前点 currentPoint 和下一个点 nextPoint。

   - 更新相机位置：将摄像机的 position 设置为 currentPoint。

   - 更新相机朝向：调用 camera.lookAt(nextPoint)，让摄像机始终看向前进的方向。这是实现第一人称沉浸感的关键。

   - 推进索引：将 roamIndex 加 1，为下一帧的移动做准备。

   - 循环漫游：检查 roamIndex 是否到达数组末尾，如果到达，则将其重置为 0，实现无限循环漫游。

### 关键代码示例 (通常在 index.js 中)

```typescript
// index.js
import * as THREE from 'three';
// 导入我们创建的管道模型和路径点数组
import { group, pointsArr } from './mesh.js';

// ... (场景、摄像机、渲染器、灯光的初始化) ...

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 将管道模型添加到场景中
scene.add(group);

// 定义一个变量，用于跟踪漫游进度
let roamIndex = 0;

// 渲染循环
function animate() {
  requestAnimationFrame(animate);

  // 确保索引不会越界
  if (roamIndex < pointsArr.length - 1) {
    
    // 1. 将相机的位置设置为路径数组中的当前点
    const currentPoint = pointsArr[roamIndex];
    camera.position.copy(currentPoint);

    // 2. 关键：让相机看向下一个点，从而模拟出前进的视角
    const nextPoint = pointsArr[roamIndex + 1];
    camera.lookAt(nextPoint);
    
    // 3. 索引递增，准备移动到下一个点
    roamIndex++;

  } else {
    // 4. 如果到达终点，则重置索引，实现循环漫游
    roamIndex = 0;
  }

  renderer.render(scene, camera);
}

animate();
```

