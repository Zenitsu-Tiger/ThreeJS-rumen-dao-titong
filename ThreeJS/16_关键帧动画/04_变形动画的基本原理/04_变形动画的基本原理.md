# Three.js 变形动画基本原理

## 概述

本示例展示了Three.js中变形动画（Morph Targets）的基本实现原理。变形动画是通过在多个几何体形状之间进行插值来实现平滑的形状变化效果。

## 变形动画原理

### 基本概念

变形动画基于"变形目标"（Morph Targets）技术：
- **基础几何体**：定义物体的初始形状
- **变形目标**：定义物体可以变化到的目标形状
- **插值计算**：通过数学插值在不同形状之间平滑过渡

### 实现原理

1. **顶点结构一致性**：变形目标必须与基础几何体具有相同的顶点数量和拓扑结构
2. **位置插值**：系统会自动计算每个顶点在不同形状之间的位置插值
3. **权重控制**：通过权重值（0-1）控制每个变形目标的影响程度

## 代码实现详解

### 1. 创建基础几何体

```javascript
const geometry = new THREE.BoxGeometry(50, 50, 50);
```

创建一个**50×50×50**的立方体作为基础形状。
- 第一个50：宽度(width)
- 第二个50：高度(height)
- 第三个50：深度(depth)

### 2. 定义变形目标

```javascript
const target1 = new THREE.BoxGeometry(50, 200, 50).attributes.position;
const target2 = new THREE.BoxGeometry(10, 50, 10).attributes.position;
```

- **target1**：尺寸为50×200×50的立方体（高度拉伸效果）
- **target2**：尺寸为10×50×10的立方体（水平收缩效果）

**关键理解**：
- 这三个BoxGeometry的**尺寸不同**，但**顶点数量相同**
- 所有BoxGeometry都有相同的顶点结构（默认24个顶点）
- 只是每个对应顶点的**坐标位置**不同
- 变形动画就是在对应顶点之间进行位置插值

**重要**：这里只提取了`attributes.position`，因为变形动画主要改变顶点位置。

### 3. 设置变形属性

```javascript
geometry.morphAttributes.position = [target1, target2];
```

将变形目标添加到几何体的`morphAttributes.position`数组中。这告诉Three.js这个几何体具有变形能力。

### 4. 创建网格和材质

```javascript
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
```

使用Lambert材质创建网格对象，颜色为青色。

### 5. 控制变形程度

```javascript
mesh.morphTargetInfluences[0] = 1;
mesh.morphTargetInfluences[1] = 1;
```

- `morphTargetInfluences[0]`：控制第一个变形目标（target1）的影响程度
- `morphTargetInfluences[1]`：控制第二个变形目标（target2）的影响程度
- 值的范围：0（无影响）到 1（完全变形）

## 顶点变形详解

### 顶点对应关系

以立方体为例：

```typescript
基础几何体 BoxGeometry(50, 50, 50)：
顶点1: (-25, -25, -25)
顶点2: (25, -25, -25)
...
变形目标1 BoxGeometry(50, 200, 50)：
顶点1: (-25, -100, -25) // 对应基础几何体的顶点1
顶点2: (25, -100, -25) // 对应基础几何体的顶点2
...
变形目标2 BoxGeometry(10, 50, 10)：
顶点1: (-5, -25, -5) // 对应基础几何体的顶点1
顶点2: (5, -25, -5) // 对应基础几何体的顶点2
...

```

### 插值计算

当`morphTargetInfluences[0] = 0.5`时：

```typescript
最终顶点1位置 = 基础位置 + 0.5 × (变形目标位置 - 基础位置)
= (-25, -25, -25) + 0.5 × ((-25, -100, -25) - (-25, -25, -25))
= (-25, -25, -25) + 0.5 × (0, -75, 0)
= (-25, -62.5, -25)
```



## 关键参数说明

### morphAttributes

- **用途**：存储变形目标的顶点数据
- **类型**：对象，包含position、normal、color等属性
- **position**：顶点位置变形目标数组

### morphTargetInfluences

- **用途**：控制每个变形目标的权重
- **类型**：数字数组
- **范围**：通常为0-1，但也可以超出此范围实现夸张效果
- **实时控制**：可以在运行时动态修改，实现动画效果

## 使用场景

1. **角色面部表情**：通过不同的面部形状实现表情变化
2. **物体形变**：实现弹性、挤压、拉伸等效果
3. **动画过渡**：在不同造型之间平滑切换
4. **交互反馈**：根据用户操作实时改变物体形状

## 性能优化建议

1. **顶点数量**：保持变形目标的顶点数量合理，避免过于复杂的几何体
2. **目标数量**：限制同时使用的变形目标数量
3. **动画帧率**：合理控制动画更新频率
4. **GPU加速**：现代浏览器会自动使用GPU加速变形计算

## 扩展应用

可以结合以下技术实现更复杂的效果：
- **关键帧动画**：使用`AnimationMixer`实现时间线动画
- **用户交互**：通过GUI控制器实时调整变形参数
- **音频驱动**：根据音频频谱数据驱动变形动画
- **物理模拟**：结合物理引擎实现真实的形变效果

## 注意事项

1. 所有变形目标必须具有相同的顶点数量和拓扑结构
2. 变形计算会消耗GPU资源，需要合理控制复杂度
3. 大量变形目标可能影响渲染性能
4. 建议在建模软件中预先准备好变形目标，确保顶点对应关系正确



# 人体变形场景

```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const loader = new GLTFLoader();
const group = new THREE.Group();
let mixer;
loader.load('./人.glb', gltf => {
  const mesh = gltf.scene.children[0];
  // 获取所有变形目标的顶点数据
  const tArr = mesh.geometry.morphAttributes.position;
  console.log('所有变形目标', tArr);
  console.log('所有权重', mesh.morphTargetInfluences);
  // 每个变形目标对应的含义(注意需要和变形目标对应起来)
  const nameArr = ['变胖', '丰乳肥臀', '增肌', '年龄', '变瘦'];
  group.add(mesh);

  const gui = new GUI();
  const obj = {};
  for (let i = 0; i < tArr.length; i++) {
    obj['t' + i] = 0;
    gui
      .add(obj, 't' + i, 0, 1)
      .name(nameArr[i])
      .onChange(v => {
        mesh.morphTargetInfluences[i] = v;
      });
  }
});
const clock = new THREE.Clock();
export { mixer, clock };
export default group;

```

### 1. 为什么 tArr 和 nameArr 是一一对应的？

这个对应关系不是自动的，而是由3D建模师和程序员共同约定的。

工作流程是这样的：

1. 3D建模软件 (如 Blender, Maya)：

- 3D建模师会为一个基础模型创建多个“变形目标”（在Blender中称为“形态键”或“Shape Keys”）。

- 例如，对于一个“人”的模型，他们会创建：

1. 变胖形态

1. 丰乳肥臀形态

1. 增肌形态

1. 年龄形态

1. 变瘦形态

- 关键点：这些形态在建模软件中有一个固定的顺序。

1. 导出 .glb 文件：

- 当模型被导出为 .glb 格式时，这个固定的顺序会被保存到文件中。

1. Three.js 加载模型：

- **当 GLTFLoader 加载模型后，mesh.geometry.morphAttributes.position 这个数组就会按照文件中的顺序包含所有变形目标的顶点数据。**

- 所以 tArr[0] 就对应建模软件里的第一个变形目标（变胖），tArr[1] 对应第二个（丰乳肥臀），以此类推。

- 同样，mesh.morphTargetInfluences 这个控制权重的数组也遵循完全相同的顺序。

1. 代码实现：

- 程序员需要提前知道这个顺序，然后创建一个nameArr数组，并手动确保其内容和顺序与3D模型中的变形目标完全一致。

总结：tArr 和 nameArr 的对应关系是基于顺序的硬编码约定。如果建模师在3D软件里改变了变形目标的顺序，而程序员没有同步更新 nameArr，那么UI上的标签就会和实际效果错位。

更健壮的方法：.glb 文件通常会包含变形目标的名称。可以通过 mesh.morphTargetDictionary 来获取一个名称到索引的映射，这样就不需要依赖脆弱的硬编码顺序了。

------

### 2. 为什么 tArr (顶点数据) 很重要？

您观察得很仔细，循环中直接使用的是 i 和 mesh.morphTargetInfluences[i]，似乎没有直接用 tArr 里的数据。这正是它容易让人困惑的地方。

tArr 的重要性体现在两个层面：

1. 根本上的重要性（定义“形变”）：

- tArr 存储的是最终要变成什么样的数据。每一个元素都是一个包含成千上万个顶点坐标的数组，它精确定义了一个“目标形态”。

- 没有 tArr，mesh.morphTargetInfluences 就失去了意义，因为GPU不知道要把顶点移动到哪里去。tArr 是变形的目的地，而 influences 决定了我们朝这个目的地走了多远（从0%到100%）。

1. 在这段代码中的重要性（提供“数量”）：

- 在这段代码的 for 循环里，tArr 的作用非常直接：tArr.length 告诉了我们一共有多少个变形目标。

- 循环的目的是为每一个变形目标创建一个UI滑块。为了知道要创建多少个滑块，代码需要知道变形目标的总数。tArr.length 就是这个总数。

- 所以，在这里，tArr 就像一个目录，我们通过 tArr.length 得知目录里有多少个章节，然后为每个章节创建一个控制开关。

简单来说：

- tArr 定义了形变的内容（变成什么样）。

- mesh.morphTargetInfluences 是控制每个形变权重（程度）的开关。

- for 循环利用 tArr.length 来动态创建足够数量的开关。
