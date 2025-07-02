# 什么是包围盒(box3)

```js
import * as THREE from "three";

const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(100, 100, 100);

const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});

const mesh = new THREE.Mesh(geometry, material);

const box3 = new THREE.Box3();
// 计算模型包围盒
box3.expandByObject(mesh);
console.log("box3", box3);

const scale = new THREE.Vector3();

// 获取包围盒的尺寸
box3.getSize(scale);
console.log("scale", scale);
// 获取包围盒的中心点的座标
const center = new THREE.Vector3();
box3.getCenter(center);
console.log("center", center);

group.add(mesh);

export default group;

```

好的，我们结合 mesh.js 这份代码来具体讲解一下包围盒的应用原理。

这份代码做了以下几件事：

1. 创建了一个 100x100x100 大小的立方体 mesh。

1. 创建了一个空的轴对齐包围盒 box3 = new THREE.Box3()。

1. 使用 box3.expandByObject(mesh) 计算了这个 mesh 的包围盒。

1. 分别获取了包围盒的尺寸 scale 和中心点 center。

**这里的核心是 expandByObject(mesh) 方法。Three.js 会遍历 mesh 的所有顶点，找出在 x、y、z 三个轴上的最小值和最大值，从而确定一个刚好能包裹住整个模型的长方体。**

对于你代码中的 mesh，由于它是一个边长 100 的立方体且中心在原点，所以：

- 计算出的包围盒 box3 的最小点是 (-50, -50, -50)，最大点是 (50, 50, 50)。

- box3.getSize(scale) 得到的尺寸 scale 将是 (100, 100, 100)。

- box3.getCenter(center) 得到的中心点 center 将是 (0, 0, 0)。

### 基于这些信息，我们能做什么？

#### 1. 自动将模型移到场景中心

这是一个非常常见的需求。当你加载一个外部模型时，你并不知道它的坐标原点在哪里。它可能在模型的脚底，也可能在模型的某个角落，这会给旋转和定位带来麻烦。

通过计算包围盒，我们可以轻松地将模型“归位”，让它的几何中心与坐标原点对齐。

getCenter() 方法给了我们模型的几何中心点。我们只需要将模型向着这个中心点的反方向平移，就可以让它居中了。

你可以在 mesh.js 的末尾添加如下代码来实现这个效果：

```js
// ... existing code ...
box3.getCenter(center);
console.log("center", center);

// 新增：根据包围盒中心点，将模型移动到原点
mesh.position.sub(center);

group.add(mesh);

export default group;
```

mesh.position.sub(center) 就是从模型当前的位置 position 减去它的中心点 center 向量，从而实现平移。

#### 2. 可视化包围盒（用于调试）

在开发过程中，我们经常需要亲眼看看计算出的包围盒是否正确。Three.js 提供了 Box3Helper 来帮助我们把它画出来。

```js
// ... existing code ...
console.log("center", center);

group.add(mesh);

// 新增：创建一个可视化辅助对象，并添加到场景
const box3Helper = new THREE.Box3Helper(box3, 0xffff00); // 用一个黄色的线框来显示包围盒
group.add(box3Helper);


export default group;
```

这样，你就能在场景中看到一个黄色的线框盒子紧紧地包裹着你的模型。

#### 3. 为复杂对象创建统一的包围盒

你的代码里有一个 group。包围盒一个强大的地方在于，它可以为一组对象计算一个总的包围盒。想象一下，一辆汽车模型可能由车轮、车身、车窗等多个独立的 mesh 组成，但你希望把整辆车作为一个物体来处理。

expandByObject 方法同样适用于 Group 对象。如果你把多个 mesh 添加到一个 group 中，然后对这个 group 计算包围盒，得到的就是能包裹住所有这些 mesh 的最大包围盒。这对于后续进行整组的碰撞检测或视锥剔除非常有用。

#### 总结与延伸

你代码中的操作，正是实现更高级功能（如碰撞检测、视锥剔除）的基础。

- 碰撞检测：如果你有两个物体 mesh1 和 mesh2，你可以分别为它们计算出包围盒 box1 和 box2。然后，只需调用 box1.intersectsBox(box2)，如果返回 true，就代表它们可能发生了碰撞，可以接着进行更精确的判断。

- 视锥剔除：Three.js 在渲染每一帧时，会自动在内部进行类似你代码中的计算。它会得到每个物体的包围盒（或包围球），然后判断这个盒子是否在摄像机的视野（视锥体）内。如果不在，Three.js 就根本不会去渲染这个物体，从而极大地提升了性能。

