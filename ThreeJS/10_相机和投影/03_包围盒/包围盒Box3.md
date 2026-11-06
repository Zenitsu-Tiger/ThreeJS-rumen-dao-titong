# 包围盒 Box3

> 本章只有一个 mesh.js：创建一个立方体，计算它的包围盒，然后获取包围盒的尺寸和中心点。

---

## 1. 什么是包围盒

**一句话结论**：包围盒就是一个**刚好能把模型整个装进去的长方体**，用两个点表示：最小点 `min` 和最大点 `max`。

**代入数字**：一个边长 100、中心在原点的立方体

- 它在 x 方向从 -50 到 50，y、z 方向也一样
- 包围盒最小点 `min = (-50, -50, -50)`，最大点 `max = (50, 50, 50)`
- 只要有这两个点，长方体就确定了

**轴对齐**是什么意思：Box3 的全称是"轴对齐包围盒"，意思是这个盒子的每条边**始终和 x、y、z 轴平行**，不会跟着模型斜过来。这样表示它只需要 min、max 两个点，计算起来非常快。代价见第 7 节。

```
        y
        │   ┌────────┐ max (50, 50, 50)
        │  ╱│       ╱│
        │ ┌────────┐ │
        │ │ └──────│─┘
        │ │╱       │╱
        │ └────────┘
        │ min (-50, -50, -50)
        └──────────────── x
       ╱
      z
```

---

## 2. 计算包围盒

**一句话结论**：用 `box3.setFromObject(mesh)` 根据模型算出包围盒。

**最小代码**

```js
const geometry = new THREE.BoxGeometry(100, 100, 100);
const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
const mesh = new THREE.Mesh(geometry, material);

const box3 = new THREE.Box3();
box3.setFromObject(mesh);   // 原文用的是 box3.expandByObject(mesh)，第一次计算时效果一样
console.log(box3.min, box3.max); // (-50,-50,-50) (50,50,50)
```

**它是怎么算的**：先遍历几何体的所有顶点，找出 x、y、z 三个方向上的最小值和最大值；再按模型的位置、旋转、缩放，换算成在场景里的实际坐标。所以如果把模型 `position.x` 设成 200，包围盒也会跟着变成 x 从 150 到 250。

**坑**

- `new THREE.Box3()` 刚创建时是个"空盒子"，打印出来 `min` 是 `Infinity`、`max` 是 `-Infinity`。这是正常的，表示里面还什么都没有。
- `expandByObject` 的意思是"**扩大**盒子，把这个模型也包进来"，不会清掉原来的内容。同一个 box3 先包住 x=0 处的方块、再包住 x=500 处的方块，得到的是能装下两个方块的大盒子（宽 600），而不是第二个方块自己的盒子（宽 100）。
- `setFromObject` = 先清空，再 `expandByObject`。**单独计算一个模型时用 `setFromObject` 更稳妥**，重复计算也不会累加。

---

## 3. 获取尺寸和中心点

**一句话结论**：`getSize` 得到长宽高，`getCenter` 得到中心点，结果都要先准备一个 `Vector3` 来接收。

**代入数字**：min = (-50, -50, -50)，max = (50, 50, 50)

- 尺寸 = max - min = (100, 100, 100)
- 中心 = (min + max) / 2 = (0, 0, 0)

**最小代码**

```js
const size = new THREE.Vector3();
box3.getSize(size);       // 结果写进 size：(100, 100, 100)

const center = new THREE.Vector3();
box3.getCenter(center);   // 结果写进 center：(0, 0, 0)
```

**坑**

- 原代码把尺寸变量命名为 `scale`，很容易和模型的缩放属性 `mesh.scale` 搞混，这里改成了 `size`。
- `getSize`、`getCenter` 是把结果**写进你传入的向量**里，不传参数会报错。

---

## 4. 应用：把模型移到原点

**一句话结论**：外部模型的中心不一定在原点，用 `mesh.position.sub(center)` 把它挪回来。

**为什么需要**：加载外部模型时，你不知道它的原点在哪里，可能在脚底，也可能在某个角落，旋转和定位都会很别扭。

**代入数字**：模拟一个"原点在角落"的模型，把几何体整体平移 (50, 50, 50)

1. 包围盒：min = (0, 0, 0)，max = (100, 100, 100)，中心 = **(50, 50, 50)**，模型偏到原点的一侧去了。
2. 执行 `mesh.position.sub(center)`：position = (0, 0, 0) - (50, 50, 50) = **(-50, -50, -50)**。
3. 重新计算包围盒：min = (-50, -50, -50)，max = (50, 50, 50)，中心回到 (0, 0, 0) ✅

**最小代码**

```js
const geometry = new THREE.BoxGeometry(100, 100, 100);
geometry.translate(50, 50, 50); // 模拟原点在角落的外部模型
const mesh = new THREE.Mesh(geometry, material);

const box3 = new THREE.Box3().setFromObject(mesh);
const center = new THREE.Vector3();
box3.getCenter(center);         // (50, 50, 50)

mesh.position.sub(center);      // position 变成 (-50, -50, -50)，模型中心回到原点
```

**坑**

- 原文例子里的立方体本来就在原点，center 是 (0, 0, 0)，减完没有任何变化，看不出效果。所以这里改成了原点在角落的例子。

- **挪完模型后，原来的 box3 不会自动更新**，还是旧的位置。后面要用包围盒（比如第 5 节的线框）的话，要重新 `setFromObject` 一次。

  这种写法的前提是模型的父级在原点、没有旋转缩放，本章代码满足这个条件。

---

## 5. 可视化包围盒：Box3Helper

**一句话结论**：`Box3Helper` 把包围盒画成线框，用来检查算得对不对。

**最小代码**

```js
const box3Helper = new THREE.Box3Helper(box3, 0xffff00); // 黄色线框
group.add(box3Helper);
```

> 📷 待补截图：黄色线框包裹立方体的效果

**坑**

- Box3Helper 画的是**你传给它的那个 box3**。如果模型挪动后没有重新计算 box3，线框会留在原地，看起来像"包围盒算错了"。
- 和第 4 节一起用时，顺序是：挪模型 → `box3.setFromObject(mesh)` 重新计算 → 线框跟着更新。

---

## 6. 一组模型的总包围盒

**一句话结论**：对 Group 计算包围盒，得到的是能装下组里**所有**模型的大盒子。

**代入数字**

- 方块 A 在原点，方块 B 在 x = 500，两个都是边长 100
- 把它们放进 group，group 整体上移 `position.y = 100`
- 总包围盒：min = (-50, 50, -50)，max = (550, 150, 50)
  - x：从 A 的左边 -50 到 B 的右边 550
  - y：两个方块原本在 -50 ~ 50，跟着 group 上移 100，变成 50 ~ 150

**最小代码**

```js
const group = new THREE.Group();
const meshA = new THREE.Mesh(geometry, material);
const meshB = new THREE.Mesh(geometry, material);
meshB.position.x = 500;
group.add(meshA, meshB);
group.position.y = 100;

const box3 = new THREE.Box3().setFromObject(group); // 会自动遍历 group 里的所有子模型
```

**用途**：比如一辆车由车轮、车身、车窗等多个 mesh 组成，把它们放进一个 group，就能把整辆车当成一个物体来计算尺寸、居中。

---

## 7. 模型旋转后，包围盒会变大

**一句话结论**：因为 Box3 的边永远和坐标轴平行，模型一斜，盒子就要撑大才能装下它。

**代入数字**：边长 100 的立方体绕 y 轴转 45°

- 从上往下看，正方形斜成菱形，菱形的宽度等于正方形的对角线：100 × √2 ≈ **141.4**
- 包围盒尺寸从 (100, 100, 100) 变成 **(141.4, 100, 141.4)**

```
不旋转（贴合）        旋转 45°（盒子撑大）
┌──────┐            ┌────◇────┐
│      │            │  ╱   ╲  │
│      │            │ ◇     ◇ │
│      │            │  ╲   ╱  │
└──────┘            └────◇────┘
  100                  141.4
```

**坑**

- 用包围盒算模型尺寸时，模型有旋转的话，得到的是"斜放后占的空间"，不是模型本身的长宽高。

---

## 8. 延伸：碰撞检测与视锥剔除（了解即可）

**碰撞检测**：分别算出两个模型的包围盒，`box1.intersectsBox(box2)` 返回 `true` 就说明两个盒子重叠了，**可能**发生碰撞，再做更精确的判断。

```js
const box1 = new THREE.Box3().setFromObject(mesh1);
const box2 = new THREE.Box3().setFromObject(mesh2);
console.log(box1.intersectsBox(box2)); // 盒子重叠 → true
```

**视锥剔除**：Three.js 每一帧渲染前，会先判断每个物体是不是在相机能看到的范围里，完全不在的物体直接跳过不画，以节省性能。判断时用的是**包围球**（一个刚好包住模型的球），不是包围盒。

> 区分一下上一章正投影相机里"模型被切掉"的现象：那是物体**一部分**超出可视范围，超出的部分不画；视锥剔除是**整个物体**都在范围外，干脆整个不画。

---

## 9. 本章完整代码（mesh.js）

```js
import * as THREE from "three";

const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(100, 100, 100);
const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
const mesh = new THREE.Mesh(geometry, material);

// 计算模型包围盒
const box3 = new THREE.Box3();
box3.setFromObject(mesh);
console.log("box3", box3); // min (-50,-50,-50)，max (50,50,50)

// 获取包围盒的尺寸
const size = new THREE.Vector3();
box3.getSize(size);
console.log("size", size); // (100, 100, 100)

// 获取包围盒的中心点坐标
const center = new THREE.Vector3();
box3.getCenter(center);
console.log("center", center); // (0, 0, 0)

// 把模型中心挪到原点（本例中心已在原点，挪完不变；外部模型才看得出效果）
mesh.position.sub(center);
box3.setFromObject(mesh); // 挪完重新计算

group.add(mesh);

// 可视化包围盒
const box3Helper = new THREE.Box3Helper(box3, 0xffff00);
group.add(box3Helper);

export default group;
```

---

## 📋 速记表

| 知识点 | 记住这句 | 代码 |
|---|---|---|
| 包围盒 | 刚好装下模型的长方体，用 min、max 两个点表示 | `new THREE.Box3()` |
| 轴对齐 | 盒子的边始终平行于 x/y/z 轴，不跟模型转 | — |
| 空盒子 | 刚创建时 min=Infinity，max=-Infinity，正常 | — |
| 计算 | 优先用 setFromObject（先清空再包） | `box3.setFromObject(mesh)` |
| expandByObject | 在原盒子基础上扩大，重复用会累加 | `box3.expandByObject(mesh)` |
| 尺寸 | max - min，结果写进传入的向量 | `box3.getSize(size)` |
| 中心 | (min + max) / 2 | `box3.getCenter(center)` |
| 居中 | 位置减去中心点；挪完要重算 box3 | `mesh.position.sub(center)` |
| 线框 | 画的是传入的 box3，box3 不更新线框就不动 | `new THREE.Box3Helper(box3, 0xffff00)` |
| Group | 自动包住组内所有模型 | `setFromObject(group)` |
| 旋转 | 模型斜了盒子会撑大，100 的立方体转 45° → 141.4 | — |
| 碰撞 | 两盒重叠 → 可能碰撞 | `box1.intersectsBox(box2)` |
| 视锥剔除 | 整个物体不在视野内就不画，用的是包围球 | Three.js 自动完成 |
