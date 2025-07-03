# 旧知识点梳理

### GLTF 环境贴图加载与应用流程

在 Three.js 中为模型添加环境贴图，主要是为了模拟物体对周围环境的反射，从而极大地增强场景的真实感。这个过程主要分为两大步：加载环境贴图 和 将贴图应用到模型材质上。

下面是详细的步骤说明：

#### . 加载环境贴图 (CubeTexture)

环境贴图通常是一种称为“立方体贴图” (CubeTexture) 的特殊纹理，它由六张图片组成，分别代表一个立方体在 +X, -X, +Y, -Y, +Z, -Z 六个方向的视图。

1. 创建 CubeTextureLoader

首先，你需要实例化一个立方体贴图加载器。

```typescript
import * as THREE from "three";

const textureCubeLoader = new THREE.CubeTextureLoader();
```

1. 设置资源路径

使用 .setPath() 方法可以为你的六张贴图设置一个公共的父目录路径。这样在加载时，你只需要提供文件名即可。

```typescript
textureCubeLoader.setPath("./环境贴图/");
```

1. 加载贴图

调用 .load() 方法，并传入一个包含六张图片文件名的数组。

**注意： 数组中文件名的顺序是固定的，必须严格按照 [px, nx, py, ny, pz, nz] 的顺序排列，分别对应 [右, 左, 上, 下, 前, 后]。**

```typescript
const textureCube = textureCubeLoader.load([
  "px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"
]);
```

1. 设置颜色编码 (Encoding)

为了让渲染效果在物理上更准确，特别是对于 PBR (Physically-Based Rendering) 材质，通常需要将环境贴图的颜色编码设置为 sRGBEncoding。

```js
textureCube.encoding = THREE.sRGBEncoding;
```

#### 2. 加载 GLTF 模型并应用环境贴图

在加载完 GLTF 模型后，你需要遍历其内部的所有网格（Mesh），并将我们刚刚创建的环境贴图应用到它们的材质上。

1. 加载 GLTF 模型

使用 GLTFLoader 来加载 .glb 或 .gltf 文件。加载是异步的，所以主要逻辑都在回调函数中完成。

```js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
loader.load("./工厂.glb", (gltf) => {
  // ... 应用贴图的逻辑
});
```

1. 遍历场景并应用贴图

加载成功后，gltf.scene 对象包含了模型的所有信息。我们需要使用 .traverse() 方法来访问场景图中的每一个对象。

当遍历到网格（isMesh 为 true）时，我们就可以设置其材质（material）的两个关键属性：

- material.envMap: 将这个属性设置为我们之前创建的 textureCube。这样，该材质就会开始反射环境。

- material.envMapIntensity: 这个属性用于控制环境贴图反射的强度，默认值为 1。你可以根据需要调整它。

```js
loader.load("./工厂.glb", (gltf) => {
  // 遍历模型的所有子对象
  gltf.scene.traverse((obj) => {
    // 判断对象是否是网格模型
    if (obj.isMesh) {
      // 为材质设置环境贴图
      obj.material.envMap = textureCube;
      // 设置环境贴图对模型的影响强度
      obj.material.envMapIntensity = 1;
    }
  });
  // 将模型添加到场景中
  scene.add(gltf.scene);
});
```

你可以把一个GLTF模型想象成一个“文件夹”，这个文件夹里包含了：

1. 多个子模型（Mesh）：比如工厂的墙壁是一个Mesh，屋顶是另一个Mesh，里面的机器又是多个不同的Mesh。每个Mesh都有自己的几何形状（Geometry）和材质（Material）。

1. 组织结构（Group）：可能有空的Group对象，用来把相关的Mesh组织在一起，方便进行整体的移动或旋转。

1. 其他信息：可能还包含灯光、相机、动画等。

当你加载gltf.scene时，你得到的是这个“文件夹”的根节点。

### 为什么需要 .traverse()？

因为gltf.scene的结构是树状的，你不知道它具体有多少层，也不知道那些需要被渲染的Mesh具体在哪一层。

例如，这个工厂模型的内部结构可能是这样的：

```typescript
gltf.scene (Group)
  |
  +-- Factory_Building (Group)
  |   |
  |   +-- Walls (Mesh)  <-- 需要给它的 material 加 envMap
  |   +-- Roof (Mesh)   <-- 需要给它的 material 加 envMap
  |   +-- Windows (Mesh) <-- 需要给它的 material 加 envMap
  |
  +-- Machinery (Group)
      |
      +-- Machine_1 (Mesh) <-- 需要给它的 material 加 envMap
      +-- Machine_2 (Mesh) <-- 需要给它的 material 加 envMap
```

如果你只对 gltf.scene 的直接子元素操作，你可能只能访问到 Factory_Building 和 Machinery 这两个Group，而Group本身是没有.material属性的，你真正想修改的是它们内部的那些Mesh。

**`gltf.scene.traverse(obj => { ... })` 的作用就是深度遍历这个树状结构下的每一个节点（obj）。无论一个Mesh被嵌套在多深的Group里，traverse都能访问到它。**

然后，通过 if (obj.isMesh) 这个判断，我们就能确保只对真正的网格模型执行操作，把环境贴图应用到它自己的.material.envMap上。

总结：

**traverse是一种非常健壮和通用的方法，它让你不必关心模型的内部具体结构，就能确保将修改（比如添加环境贴图）应用到所有应该被渲染的部件上。**

**即使这个工厂模型恰好只有一个Mesh，使用traverse也是最标准的做法，因为你的代码可以适用于任何复杂的GLTF模型而无需改动。**

























































































