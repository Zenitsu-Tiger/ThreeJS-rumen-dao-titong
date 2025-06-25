## 数学知识点回顾

```typescript
for (let i = 0; i < N; i++) {
  const angle = sp * i;
  const x = R * Math.cos(angle);
  const y = R * Math.sin(angle);
  const z = 0;
  arr.push(x, y, z);
}
```

详细解释一下 Math.cos(angle) 的原理，以及在代码中是如何工作的。

简单来说，Math.cos(angle) 是一个三角函数，它在一个圆形的上下文中，根据一个角度，返回该角度在圆上对应点的 X 坐标比例。

### 核心原理：单位圆 (The Unit Circle)

为了最直观地理解 cos (余弦)，我们需要借助“单位圆”这个概念。

1. 什么是单位圆？

想象一个在二维坐标系中，圆心在原点 (0, 0)，半径为 1 的圆。这个特殊的圆就叫“单位圆”。

2. 角度 (angle)

角度 angle 是从 X 轴的正方向（即点 (1, 0) 的位置）开始，逆时针旋转的角度。在JavaScript的 Math 函数中，这个角度的单位是弧度 (radians)，而不是我们平时说的度 (degrees)。您的代码中 (2 * Math.PI) / N 正是把一个完整的圆周 (2π 弧度) 分成了 N 份，计算出了每两个点之间的弧度差。

3. cos 和 sin 的作用

对于单位圆上任意一点 P，它的坐标 (x, y) 完全由这个角度 angle 决定：

- x = Math.cos(angle)

- y = Math.sin(angle)

换句话说，cos(angle) 的值就是单位圆上，从X轴正方向逆时针转动 angle 弧度后，那个点的 x坐标。

### 您提到的 “底/半径” 是如何来的？

您这个记忆非常棒，这正是余弦函数在直角三角形中的经典定义！现在我们把单位圆和直角三角形结合起来看：

1. 从单位圆上的点 P(x, y) 向 X 轴画一条垂直的线，你会得到一个直角三角形。

2. 这个三角形的三条边分别是：

- 斜边 (Hypotenuse): 长度等于圆的半径，在单位圆里就是 1。

- 邻边 (Adjacent Side / 底): 长度等于点 P 的 x 坐标。

- 对边 (Opposite Side): 长度等于点 P 的 y 坐标。

3. 根据直角三角形的三角函数定义：

\> 余弦 (cosine) = 邻边 / 斜边

4. 把我们刚才的发现代入公式： cos(angle) = x / 1

因此：x = cos(angle)

这完美地解释了为什么 cos(angle) 能得到 x 坐标。





## 几何体方法setFromPoints()

这是BufferGeometry的一个方法，通过这个方法把数组pointsArr中的坐标数据提取出来赋值给几何体，严格来讲就是把pointsArr里面坐标数据提取出来，赋值给geometry.attributes.position属性。

我们来探讨一下在 Three.js 中使用 THREE.Vector3 和直接写入顶点数据（例如通过 Float32Array）的区别。

在您提供的 model.js 文件中，您使用了 THREE.Vector3 数组来定义一系列点：

```js
// ...
const pointsArr = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 100, 0),
  new THREE.Vector3(0, 100, 100),
  new THREE.Vector3(0, 0, 100),
];
// ...
```

这两种方式的核心区别在于抽象层次和使用便利性。

### 1. 使用 THREE.Vector3 (高层次抽象)

THREE.Vector3 是 Three.js 提供的一个非常有用的类（Class），它不仅仅是三个数字（x, y, z）的容器。它代表一个三维空间中的向量或点，并内置了大量用于向量运算的方法。

优点:

- 可读性好，代码更直观: new THREE.Vector3(x, y, z) 清晰地表达了“创建一个三维点”的意图。

- 强大的向量运算: Vector3 对象提供了丰富的数学方法，例如：

  - .add(): 向量相加

  - .sub(): 向量相减

  - .multiplyScalar(): 向量乘以一个标量（缩放）

  - .length(): 计算向量长度
    - .normalize(): 将向量单位化

  - .dot(): 点乘

  - .cross(): 叉乘

- 便于操作: 在生成最终的几何体之前，你可以轻松地对这些 Vector3 对象进行移动、旋转、缩放等复杂的数学变换。

- 与Three.js API高度集成: 很多Three.js的辅助方法，比如您用到的 geometry.setFromPoints()，就是专门设计用来接收 THREE.Vector3 数组的，极大地简化了从点集创建几何体的过程。

缺点:

- 微小的性能开销: 每 new THREE.Vector3() 一次，就会创建一个新的JavaScript对象。当点非常多（例如几十万个）的时候，创建大量对象会带来一定的内存和性能开销。但在绝大多数场景下，这点开销可以忽略不计。

**代码预览：**

```typescript
import * as THREE from "three";

const geometry = new THREE.BufferGeometry();

const pointsArr = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 100, 0),
  new THREE.Vector3(0, 100, 100),
  new THREE.Vector3(0, 0, 100),
];
geometry.setFromPoints(pointsArr);

console.log("几何体变化", geometry.attributes.position);

const material = new THREE.PointsMaterial({
  color: 0xff0000,
  size: 10,
});

const line = new THREE.Points(geometry, material);

export default line;

```



### 2. 直接写入顶点数据 (低层次操作)

这是更接近底层WebGL的方式。你需要手动创建一个类型化数组（通常是 Float32Array），然后把所有的顶点坐标平铺在里面。

例如，与您的 pointsArr 等效的直接写法是：

```js
const vertices = new Float32Array([
  // 第1个点(x, y, z)
  0, 0, 0,
  // 第2个点(x, y, z)
  0, 100, 0,
  // 第3个点(x, y, z)
  0, 100, 100,
  // 第4个点(x, y, z)
  0, 0, 100,
]);

// 然后手动设置BufferAttribute
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3)); // 3表示每3个值为一个顶点
```

geometry.setFromPoints() 方法在内部做的其实就是类似上面的事情：它遍历你传入的 Vector3 数组，提取每个向量的x, y, z值，然后帮你创建 Float32Array 和 BufferAttribute。

- 优点:

- 性能更高: 直接操作类型化数组，避免了创建大量中间Vector3对象，内存占用更少，数据传输到GPU的效率也更高。在处理海量顶点数据时，性能优势会体现出来。

- 缺点:

- 代码可读性差: 看着一长串数字，很难直观地看出每个点的位置。

- 操作不便: 如果想对某个点进行数学变换，你需要手动去这个大数组里找到对应的索引（例如 vertices[i*3], vertices[i*3+1], vertices[i*3+2]），然后进行计算，非常繁琐且容易出错。

### 总结

| 特性     | new THREE.Vector3() + setFromPoints()                        | 直接写入 Float32Array                                        |
| :------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 抽象层级 | 高                                                           | 低                                                           |
| 易用性   | 非常高，代码直观，易于理解和维护。                           | 较低，需要手动管理索引，操作繁琐。                           |
| 功能性   | 强大，可以利用Vector3的各种数学方法进行复杂的几何变换。      | 基础，只是纯粹的数据存储，不带任何辅助方法。                 |
| 性能     | 略低，有创建对象的开销，但通常可忽略。                       | 更高，直接与底层API对接，是性能最优化的选择。                |
| 推荐场景 | 绝大多数情况：构建、原型设计、动态修改几何体，以及顶点数量不是极端庞大的场景。 | 追求极致性能的场景：例如点云数据可视化，需要一次性加载和渲染几百万甚至上千万个点。 |

简单来说，THREE.Vector3 是为了方便开发者而设计的“便利工具”，而直接写入 Float32Array 是更接近机器运行方式的“原始材料”。

对于学习和绝大多数应用开发而言，强烈推荐使用 THREE.Vector3，因为它能让你更专注于实现创意，而不是陷入繁琐的底层数据操作中。只有当项目遇到明显的性能瓶颈时，才有必要考虑手动管理 BufferAttribute。











# 曲线curve

![image-20250625161453855](./assets/image-20250625161453855.png)



## 椭圆Three.EllipseCurve

```typescript
import * as THREE from "three";

// 生成椭圆曲线
const arc = new THREE.EllipseCurve(0, 0, 120, 50);

// const pointsArr = arc.getPoints(50);
const pointsArr = arc.getSpacedPoints(50);
console.log("曲线上获取的坐标", pointsArr);

const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

const material = new THREE.PointsMaterial({
  color: 0xff0000,
  size: 10,
});

const line = new THREE.Points(geometry, material);

export default line;

```

![image-20250625170009015](./assets/image-20250625170009015.png)

**`const arc = new THREE.EllipseCurve(0, 0, 120, 50);`参数1和2代表椭圆中心坐标，参数3和4代表x和y方向半径。**

1. arc.getPoints() 和 arc.getSpacedPoints() 的核心区别就在于取样点的分布是否均匀。

- getPoints(divisions): 这个方法会根据曲线的参数 t (通常从0到1) 来进行等分，然后计算出对应位置的点。对于像椭圆这样的非匀速曲线，参数 t 的均匀变化并不意味着在曲线上走过的路程（弧长）是均匀的。这会导致在曲率大的地方点会更密集，在曲率小的地方点会更稀疏。

- getSpacedPoints(divisions): 这个方法会先计算整条曲线的总长度，然后将总长度等分，确保返回的点在曲线上的物理间距是大致相等的。这使得点的分布看起来非常均匀。

2. 获取坐标点的过程是完全由 Three.js 的 API 自动完成的。您只需要创建好一个曲线对象（比如这里的 EllipseCurve），然后调用这两个方法之一并传入您希望得到的点的数量，API 内部就会完成所有复杂的数学计算，并返回一个包含 Vector (向量/坐标点) 的数组。

总结一下，就像您在代码中使用的那样，当希望在曲线上获得一组视觉上等间距的点时（比如制作虚线、或均匀分布一些物体），getSpacedPoints() 是更合适的选择。



## 圆弧ArcCurve

```typescript
import * as THREE from "three";


// 生成圆弧曲线
const arc = new THREE.ArcCurve(0, 0, 50);
const pointsArr = arc.getPoints(50);
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

const material = new THREE.LineBasicMaterial({
  color: 0xff0000,
  size: 10,
});

const line = new THREE.LineLoop(geometry, material);

export default line;

```

计算机图形学中一个非常核心的概念：用离散的点和线段来模拟（近似）连续的曲线。

我们在 Three.js 中创建的任何 Curve（无论是圆弧、椭圆还是贝塞尔曲线），它在数学上都是一个完美的、连续的曲线。但是，计算机的 GPU（显卡）在渲染时，并不能直接画出一条真正意义上的“光滑曲线”，它最擅长的是画点、直线和三角形。

所以，为了在屏幕上显示这条曲线，Three.js 采取了“近似”的策略：

1. 采样 (Sampling)：通过 arc.getPoints(n) 方法，从这个完美的数学圆弧上提取出 n + 1 个离散的坐标点。这些点都精确地位于圆弧上。

1. 连接 (Connecting)：然后，使用像 Line 或 LineLoop 这样的对象，将这些采样点用直线段依次连接起来。

所以，您最终在屏幕上看到的，并不是一条真正的圆弧，而是一个由许多短直线段构成的正多边形。

- 当 getPoints() 的参数（也就是取样点数量）较少时（比如 getPoints(5)），你会得到一个正六边形，它的棱角会非常明显，看起来一点也不圆。

- 当取样点数量非常多时（比如 getPoints(50)），你会得到一个边数很多的（51条边）正多边形。因为每一条直线段都非常短，它与真实圆弧的偏差极小，所以人眼在视觉上就无法分辨出那些微小的棱角，从而感觉它是一条非常平滑、非常“圆”的圆弧了。

可以尝试将代码中的 50 改成 5 或者 10，就能立刻看到一个棱角分明的多边形，这样可以更直观地理解这个过程。





## 三维样条曲线

```js
import * as THREE from "three";

// 生成椭圆曲线
// const arc = new THREE.EllipseCurve(0, 0, 120, 50);
// 获取椭圆曲线上的随机点
// const pointsArr = arc.getPoints(50);
// 获取椭圆曲线上的等分点
// const pointsArr = arc.getSpacedPoints(50);
// console.log("椭圆曲线上获取的坐标", pointsArr);

// 生成圆弧曲线
// const arc = new THREE.ArcCurve(0, 0, 50, 0, 0.5 * Math.PI);
// const pointsArr = arc.getPoints(50);
// const geometry = new THREE.BufferGeometry();
// geometry.setFromPoints(pointsArr);
// setFromPoints相当于使用pointsArr中的坐标来创建几何体
/* const positions = new Float32Array(pointsArr.length * 2);
for (let i = 0; i < pointsArr.length; i++) {
  positions[i * 2] = pointsArr[i].x;
  positions[i * 2 + 1] = pointsArr[i].y;
}
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 2)); */

// 生成不规则的三维曲线
const arr = [
  new THREE.Vector3(-50, 20, 90),
  new THREE.Vector3(-10, 40, 40),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(70, 0, 80),
];

const curve = new THREE.CatmullRomCurve3(arr);
const pointsArr = curve.getPoints(50);
// 定义线模型
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

const material = new THREE.LineBasicMaterial({
  color: 0xff0000,
});
const line = new THREE.Line(geometry, material);

// 用点模型可视化样条曲线经过的顶点位置
const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints(arr);
const material2 = new THREE.PointsMaterial({
  color: 0xff00ff,
  size: 10,
});

const points = new THREE.Points(geometry2, material2);

const group = new THREE.Group();
group.add(line);
group.add(points);

export default group;

```

**为什么我们还是需要getPoints来采样坐标点呢？**

这是一个非常好的问题！您可能会想："既然我已经有了那5个控制点，为什么不能直接连接它们，还要用 getPoints() 来采样更多的点呢？"

答案的关键在于理解控制点和曲线上的实际点的区别：

## 1. 控制点 ≠ 曲线上的点

您定义的这5个 Vector3 点被称为控制点或关键点。对于 CatmullRomCurve3 来说，这些控制点的作用是：

- 定义曲线的形状和走向

- 大部分控制点都在最终的曲线上（这是 Catmull-Rom 曲线的特性）

- **但仅仅连接这5个点，得到的是折线，不是平滑曲线**

## 2. 如果直接连接控制点会怎样？

如果您直接将这5个控制点用直线连接，您会得到一个5段直线组成的折线，有明显的转折角，看起来很生硬。

## 3. 采样的作用

curve.getPoints(50) 的作用是：

- 在由控制点定义的数学曲线上，均匀地采样出51个点

- 这51个点包括了原来的5个控制点，还有中间插值计算出的46个点

- 这些插值点使得相邻两点之间的连线变得非常短，从而让整条线看起来是平滑的曲线

## 4. 一个类比

想象一下：

- 控制点就像是您在地图上标记的几个必经城市

- 采样点就像是GPS导航为您规划的详细路线，包含了途中的每一个小路口

- 如果只按城市连直线，您会"穿山越岭"；但按GPS的详细路线走，您会得到一条平滑可行的道路

所以，getPoints() 采样是必需的，它让数学上定义的平滑曲线能够在计算机图形中正确显示出来。