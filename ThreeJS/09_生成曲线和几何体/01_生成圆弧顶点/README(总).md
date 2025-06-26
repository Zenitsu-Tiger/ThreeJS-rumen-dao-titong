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

### 1. 控制点 ≠ 曲线上的点

您定义的这5个 Vector3 点被称为控制点或关键点。对于 CatmullRomCurve3 来说，这些控制点的作用是：

- 定义曲线的形状和走向

- 大部分控制点都在最终的曲线上（这是 Catmull-Rom 曲线的特性）

- **但仅仅连接这5个点，得到的是折线，不是平滑曲线**

### 2. 如果直接连接控制点会怎样？

如果您直接将这5个控制点用直线连接，您会得到一个5段直线组成的折线，有明显的转折角，看起来很生硬。

### 3. 采样的作用

curve.getPoints(50) 的作用是：

- 在由控制点定义的数学曲线上，均匀地采样出51个点

- 这51个点包括了原来的5个控制点，还有中间插值计算出的46个点

- 这些插值点使得相邻两点之间的连线变得非常短，从而让整条线看起来是平滑的曲线

### 4. 一个类比

想象一下：

- 控制点就像是您在地图上标记的几个必经城市

- 采样点就像是GPS导航为您规划的详细路线，包含了途中的每一个小路口

- 如果只按城市连直线，您会"穿山越岭"；但按GPS的详细路线走，您会得到一条平滑可行的道路

所以，getPoints() 采样是必需的，它让数学上定义的平滑曲线能够在计算机图形中正确显示出来。



## 贝塞尔曲线

```typescript
// 二维二次贝塞尔曲线
// p2是控制点，p1和p3是起点和终点
/* const p1 = new THREE.Vector2(-80, 0);
const p2 = new THREE.Vector2(20, 100);
const p3 = new THREE.Vector2(80, 0); */

// 三维二次贝塞尔曲线
/* const p1 = new THREE.Vector3(-80, 0, 0);
const p2 = new THREE.Vector3(20, 100, 0);
const p3 = new THREE.Vector3(80, 0, 100); */

// 二维三次贝塞尔曲线
const p1 = new THREE.Vector2(-80, 0);
const p2 = new THREE.Vector2(-40, 50);
const p3 = new THREE.Vector2(50, 50);
const p4 = new THREE.Vector2(80, 0);
const arr = [p1, p2, p3, p4];
const curve = new THREE.CubicBezierCurve(p1, p2, p3, p4);
const pointsArr = curve.getPoints(100);
// 定义线模型
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

const material = new THREE.LineBasicMaterial({
  color: 0xff00ff,
});
const line = new THREE.Line(geometry, material);

// 控制点的点模型
const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints(arr);
const pointMaterial = new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 10,
});
const points = new THREE.Points(geometry2, pointMaterial);

// 控制点的连线
const geometry3 = new THREE.BufferGeometry();
geometry3.setFromPoints(arr);
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x888888,
});
const controlLine = new THREE.Line(geometry3, lineMaterial);

const group = new THREE.Group();
group.add(line); // 贝塞尔曲线
group.add(points); // 控制点
group.add(controlLine); // 控制点连线

export default group;

```



### 1. 贝塞尔曲线为什么不经过中间的控制点？

这是一个非常核心的特点。对于您正在使用的三次贝塞尔曲线 (CubicBezierCurve) 来说：

- 曲线保证会穿过起点 (p1) 和终点 (p4)。

- **曲线通常不会穿过中间的两个控制点 (p2 和 p3)。**

**您可以把中间的控制点想象成具有“引力”的磁铁。它们的作用不是让曲线“穿过”自己，而是把本来是直线的路径向自己这边“拉拽”过来。曲线的最终形状，是所有控制点“拉力”共同作用下的一个平衡结果。**

- p2 的位置主要影响曲线前半段的形状。

- p3 的位置主要影响曲线后半段的形状。

正是因为曲线不直接穿过这些点，我们才能通过调整它们的位置，创造出各种平滑、优美的曲线形态，这是简单地连接几个点所做不到的。

### 2. 控制点的作用是什么？

控制点的核心作用是定义和控制曲线的形状、弯曲程度和方向。

具体来说，在三次贝塞尔曲线中：

1. 定义起止点：p1 是起点，p4 是终点。

1. 定义切线方向：

- 从起点 p1 到控制点 p2 的连线方向，定义了曲线在起点处的切线方向。p2 离 p1 越远，曲线在开头部分“冲出去”的势头就越猛。

- 从控制点 p3 到终点 p4 的连线方向，定义了曲线在终点处的切线方向。p3 离 p4 越远，曲线在结尾部分弯曲的幅度就越大。

简单来说，这四个点构成的“控制笼”（您代码中用灰色线条连接的部分）完整地决定了曲线的最终形态。移动任何一个控制点，都会对整条曲线的平滑度产生影响。

### 3. 二维/三维 与 二次/三次 贝塞尔曲线的区别

这是一个关于“维度”和“阶数”的问题。

#### 二维 (2D) vs. 三维 (3D)

这个区别非常直观：

- 二维贝塞尔曲线：所有控制点都在一个平面上，使用 THREE.Vector2(x, y) 定义。曲线本身也是一个平面图形。

- 三维贝塞尔曲线：控制点在三维空间中，使用 THREE.Vector3(x, y, z) 定义。这使得曲线可以在空间中任意穿梭，形成立体的路径。

#### 二次 (Quadratic) vs. 三次 (Cubic)

这个区别在于控制点的数量和曲线的复杂度：

- 二次贝塞尔曲线 (QuadraticBezierCurve)：

- 3个控制点：一个起点 p1、一个终点 p3 和 一个 中间控制点 p2。

- 形状相对简单，只有一个弯曲。适用于创建简单的弧线。

- 整个曲线的弯曲由唯一的控制点 p2 来控制。

- 三次贝塞尔曲线 (CubicBezierCurve)：

- 4个控制点：一个起点 p1、一个终点 p4 和 两个 中间控制点 p2、p3。

- 因为有两个控制点，所以可以创建更复杂的形状，例如 "S" 形曲线。

- p2 和 p3 像两个“手柄”，分别控制起点和终点方向的曲线形态，提供了更高的自由度。这是在图形设计软件（如PS、AI）中最常用的钢笔工具。



## 实现组合曲线

**组合曲线的坐标顺序和线条组合顺序不能随便写，总的方向是先确定整个曲线的起点，然后沿着一个方向绘制不同的曲线，确保不同类型的曲线做到首尾相接。**

这句话是对 THREE.CurvePath （或类似的组合曲线概念）工作原理的一个非常精准且重要的描述。它强调了在构建复杂路径时必须遵守的规则，否则结果会不符合预期。

我来为您详细解释一下，并用一个例子来说明：

### 核心思想：像连接火车轨道一样

您可以把 CurvePath 想象成一个空的火车轨道蓝图，而每一段独立的曲线（如 LineCurve, ArcCurve, CubicBezierCurve）就是一段段真实存在的轨道零件。

您想要用这些零件拼成一条完整的、可以顺畅跑完的轨道。要做到这一点，您必须：

1. 确定起点：把第一段轨道铺在地上。

1. 按顺序连接：拿出第二段轨道，将它的开头精确地对准第一段轨道的结尾。

1. 保持方向：继续拿出第三段，将其开头对准第二段的结尾，以此类推。

如果您不遵守这个规则，比如把第二段轨道放在了离第一段很远的地方，那么火车从第一段开出后，要么脱轨，要么就得瞬间“跳”到第二段的开头，这显然是不对的。

### "坐标顺序" 和 "组合顺序" 的含义

#### 1. 坐标顺序 (定义每一段曲线)

这句话指的是，在创建每一段独立的曲线时，它的起点和终点坐标必须符合您期望的行进方向。

例子：假设您想从 A点(-10, 0) 走到 B点(10, 0)。

- 正确：`new THREE.LineCurve(new THREE.Vector2(-10, 0), new THREE.Vector2(10, 0))`

- 错误：`new THREE.LineCurve(new THREE.Vector2(10, 0), new THREE.Vector2(-10, 0))`

虽然这两个点是一样的，但第二种写法的“方向”是反的，是从 B 到 A。如果您打算接下来从 B 点继续前进，那么第二种写法就会导致路径混乱。

```typescript
const R = 80; //先设置圆弧半径
const H = 200; //设置直线的高度

const line1 = new THREE.LineCurve(
  new THREE.Vector2(R, H),
  new THREE.Vector2(R, 0)
);
const arc = new THREE.ArcCurve(0, 0, R, 0, Math.PI, true);
```

这段代码创建了一条垂直的直线段。

- new THREE.LineCurve(...): 创建一个直线段的数学定义。

- new THREE.Vector2(R, H): 这是直线的起点。它的坐标是 (50, 100)。

- new THREE.Vector2(R, 0): 这是直线的终点。它的坐标是 (50, 0)。

可视化效果：

这条线从点 (50, 100) 开始，垂直向下延伸，到点 (50, 0) 结束。它平行于 Y 轴，长度为 H (100)。

```tex
      Y
      ^
      |
(50, 100)  <-- line1 的起点
      |
      |
      | line1 (一条垂直线)
      |
      |
 (50, 0)   <-- line1 的终点
 -----+---------------------> X
      |
```

### 第二段代码：ArcCurve (圆弧)

```js
const arc = new THREE.ArcCurve(0, 0, R, 0, Math.PI, true);
```

这段代码创建了一个逆时针方向的下半圆。

- new THREE.ArcCurve(...): 创建一个圆弧的数学定义。它的参数比较多：

- 0, 0: 这是圆弧所在圆的圆心坐标 (x, y)，这里是原点 (0, 0)。

- R: 这是圆的半径，这里是 50。

- 0: 这是圆弧的起始角度（单位是弧度）。0 弧度对应于时钟的3点钟方向。

- Math.PI: 这是圆弧的结束角度（单位是弧度）。Math.PI (π) 弧度对应于180度，即时钟的9点钟方向。

- true: 这是绘制方向。true 表示逆时针 (anticlockwise)。如果为 false，则为顺时针。

可视化效果：

想象一个以原点为中心、半径为 50 的完整圆。这条 arc 从3点钟方向（坐标 (50, 0)）开始，逆时针画一个半圆，到9点钟方向（坐标 (-50, 0)）结束。因为它画的是下半部分，所以会经过 (0, -50)。

```js
                       Y
                       ^
                       |
                       |
<--(-50,0)-----------(0,0)-----------(50,0)--> X   <-- arc 的起点是 (50,0)，终点是 (-50,0)
     .                 |                 .
      .                |                .
       .               |               .
         .          (0,-50)          .    <-- arc 经过这个点
           . . . . . . . . . . . . .      <-- 这是一个逆时针的下半圆
```

特别注意：ArcCurve 的第六个参数（方向）非常重要。如果把它设为 false（顺时针），那么它会从3点钟方向顺时针画一个上半圆，终点依然是9点钟方向。

#### 2. 组合顺序 (将曲线添加到 CurvePath 中)

这句话指的是，您将各个曲线段添加到 CurvePath 这个“组合”中的顺序必须是您希望路径行进的顺序。

最关键的一点：

前一条曲线的终点，必须是后一条曲线的起点。 这就是“首尾相接”的含义。

### 一个具体的代码例子

![image-20250626170751148](./assets/image-20250626170751148.png)

```js
import * as THREE from "three";

const R = 80; //先设置圆弧半径
const H = 200; //设置直线的高度

const line1 = new THREE.LineCurve(
  new THREE.Vector2(R, H),
  new THREE.Vector2(R, 0)
);
const arc = new THREE.ArcCurve(0, 0, R, 0, Math.PI, true);

const line2 = new THREE.LineCurve(
  new THREE.Vector2(-R, 0),
  new THREE.Vector2(-R, H)
);
// CurvePath创建组合曲线对象
const CurvePath = new THREE.CurvePath();
// line1,arc,line2拼接出来一个U型轮廓曲线，注意顺序
CurvePath.curves.push(line1, arc, line2);
// 三维样条曲线
const pointsArr = CurvePath.getPoints(30);
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

const material = new THREE.LineBasicMaterial({
  color: 0x00fffff,
});

const material2 = new THREE.PointsMaterial({
  color: 0xff00ff,
  size: 10,
});

// 点模型对象
const points = new THREE.Points(geometry, material2);

const line = new THREE.Line(geometry, material);

const group = new THREE.Group();
group.add(line);
group.add(points);
export default group;

```

#### 如果不遵守规则会怎样？

直线部分不取多余的点，只取首尾两个点，而曲线会尽量多采样取点确保绘制出圆滑的弧线。

如果你直线也想要均匀取点，那就用getSpacePoints()，但是没必要。

![image-20250626173456428](./assets/image-20250626173456428.png)

### 总结

所以，这段描述的核心就是在强调：

构建组合曲线是一个有序的、接力式的过程。你必须规划好每一段的内部方向（坐标顺序），并严格按照“前一段的终点”就是“后一段的起点”的规则，将它们按顺序（组合顺序）串联起来，才能得到一条完整、连续的平滑路径。

## 管道模型生成原理

管道模型的创建基于一种在三维建模中非常常见的技术，叫做扫描或放样 (Sweep / Lofting)。其核心思想是：让一个二维的封闭图形（称为“轮廓”或“截面”）沿着一条三维的路径（称为“扫描路径”）移动，并将移动过程中产生的轨迹连接起来形成一个三维实体。

您可以把它想象成这样：

- 路径 (Path)：您在三维空间中预先定义好的一条曲线，比如之前用到的 CatmullRomCurve3 或 CubicBezierCurve3。这就是管道的“骨架”或中心线。

- 轮廓 (Profile)：一个二维图形，对于 TubeGeometry 来说，这个图形永远是一个圆形。

- 生成过程：TubeGeometry 会沿着您给定的三维路径，在许多个点上分别放置一个与路径垂直的圆形轮廓。然后，它会像“缝衣服”一样，把相邻两个圆形的对应顶点用三角形面片连接起来，最终“缝合”成一个完整的中空管道模型。

\### 参数对生成模型的影响

在创建 TubeGeometry 时，最重要的两个参数是 tubularSegments（管道分段数）和 radialSegments（横截面分段数）。它们直接决定了模型的精细度和性能。

#### tubularSegments (管道分段数)

这个参数控制的是沿着管道长度方向的平滑度。

- 作用：它决定了要从您的输入路径（Path）上采集多少个点来构建管道的“骨架”。TubeGeometry 会在路径上取 tubularSegments 那么多个点，并在每个点上创建一个圆形的横截面。

- 影响：

- 值越低：如果您的管道有弯曲，那么在弯曲处会看到明显的棱角，整个管道看起来像是由几段短的直管生硬地连接起来的。

- 值越高：弯曲处会显得非常平滑，因为它是由更多、更短的直管段平滑过渡而成的。

- 类比：这个值非常类似于您之前用过的 curve.getPoints(n) 中的 n。它决定了对路径曲线的采样精度。

#### radialSegments (横截面分段数)

这个参数控制的是管道圆形横截面本身的平滑度。

- 作用：它决定了用多少个顶点来近似模拟一个圆形。

- 影响：

- 值越低：例如，如果 radialSegments 为 3，那么管道的横截面就不是圆形，而是一个三角形，最终生成的模型是一个三棱柱。如果为 4，则是一个四棱柱。

- 值越高：横截面会越来越接近一个完美的圆形，整个管道看起来就越圆润。通常 8 到 12 就能得到不错的效果，更高的值在摄像机离得很近时才看得出区别。

### 总结

- tubularSegments：控制管道弯曲处的平滑度（纵向分段）。

- radialSegments：控制管道管壁本身的圆滑度（横向分段）。

这两个值越高，生成的模型面数（三角形数量）就越多，模型就越精细，但同时对显卡的性能消耗也越大。因此，在实际应用中需要根据模型的重要性和摄像机的远近来权衡选择合适的数值。