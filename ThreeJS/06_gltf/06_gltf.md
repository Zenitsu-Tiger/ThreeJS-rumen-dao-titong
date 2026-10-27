# 06 GLTF 模型

> 复习方式：每节先看「一句话结论」，能回忆起来就跳过；想不起来再看代码和「坑」。

---

## 1. 加载 GLTF 模型

**一句话结论**：用 `GLTFLoader` 加载，回调里拿到的 `gltf.scene` 才是可以加进场景的模型。加载是异步的，所以先建一个空 `Group` 导出，加载完再往里加。

```js
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
const model = new THREE.Group()   // 先建一个空容器

loader.load('/工厂.gltf', (gltf) => {
  console.log(gltf)               // 整个加载结果：scene、animations、cameras 等
  model.add(gltf.scene)           // 只需要把 scene 加进去
})

export default model              // 先导出空容器，模型加载完后自动出现在里面
```

**两种文件格式**

| 格式 | 特点 |
|---|---|
| `.gltf` | JSON 文本，贴图和二进制数据可能是单独的文件 |
| `.glb` | 二进制，所有内容打包成一个文件 |

两种格式用同一个 `GLTFLoader` 加载，代码没有区别。

**坑**
- `gltf` 不是 3D 对象，`gltf.scene` 才是。写成 `model.add(gltf)` 会出错。
- 加载是异步的，`loader.load` 下面紧接着的代码执行时，模型还没加载完。凡是要操作模型的代码，都要写在回调里面。

---

## 2. 模型的树结构与获取指定节点

**一句话结论**：GLTF 模型是一棵树（Group 嵌套 Mesh），可以用 `getObjectByName('名字')` 按名字找到任意一层的节点。

节点名称就是建模软件里的命名，可以先 `console.log(gltf.scene)` 查看树结构：

```text
gltf.scene (Group)
├── 1号楼 (Mesh)
├── 2号楼 (Mesh)
├── 洋房 (Group)          ← 分组，本身没有材质
│   ├── 洋房1 (Mesh)
│   └── 洋房2 (Mesh)
└── ...
```

```js
loader.load('/小区积木.glb', gltf => {
  // 找到单个 Mesh，直接改材质
  const building = gltf.scene.getObjectByName('1号楼')
  building.material.color.set(0xff0000)

  // 找到的是 Group：它没有 material，要改它的 children
  const group = gltf.scene.getObjectByName('洋房')
  group.children.forEach(item => {
    item.material.color.set(0x00ff00)
  })

  model.add(gltf.scene)
})
```

**坑**
- 找到的节点要先分清是 **Mesh** 还是 **Group**。Group 没有 `.material`，直接 `.material.color` 会报错。
- 名字写错时返回 `undefined`，最好先判断一下：`if (building) {...}`。

---

## 3. traverse 遍历所有节点

**一句话结论**：`traverse` 会递归访问模型树里的**每一个**节点（包括它自己）。配合 `isMesh` 筛选，就能批量处理所有网格。

```js
loader.load('/小区积木.glb', gltf => {
  gltf.scene.traverse(child => {
    if (child.isMesh) {                      // 只处理网格，跳过 Group
      console.log(child.material)            // 查看默认材质
      child.material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
      })
    }
  })
  model.add(gltf.scene)
})
```

**`children` 和 `traverse` 的区别**

| | 范围 |
|---|---|
| `obj.children` | 只有下一层 |
| `obj.traverse(fn)` | 自己 + 所有后代，不管嵌套多少层 |

**GLTF 的默认材质**：打印出来是 `MeshStandardMaterial`（PBR 材质，有 `metalness`、`roughness` 等属性）。上面的代码把它整个替换成了 Lambert，相当于主动换成更简单的材质。

**坑**
- 不加 `isMesh` 判断，遍历到 Group 时访问 `.material` 会出问题。

---

## 4. 材质共享：改一个，一群跟着变

**一句话结论**：GLTF 里多个 Mesh 可能**共用同一个材质对象**。修改其中一个 Mesh 的材质，所有共用这个材质的 Mesh 都会跟着变。解决办法是先 `clone()` 一份，让每个 Mesh 拥有自己的材质。

```text
共享时：                     clone 之后：
1号楼 ─┐                     1号楼 → 材质A
2号楼 ─┼─→ 同一个材质         2号楼 → 材质B
3号楼 ─┘                     3号楼 → 材质C
改1号楼颜色 = 三栋都变        各改各的，互不影响
```

```js
loader.load('/小区积木.glb', gltf => {
  // 第一步：给每个 Mesh 克隆一份独立材质
  gltf.scene.traverse(child => {
    if (child.isMesh) {
      child.material = child.material.clone()
    }
  })

  // 第二步：现在可以单独修改了
  const mesh1 = gltf.scene.getObjectByName('1号楼')
  const mesh2 = gltf.scene.getObjectByName('2号楼')
  if (mesh1) mesh1.material.color.set(0x00ff00)
  if (mesh2) mesh2.material.color.set(0x0000ff)

  // 默认材质是 MeshStandardMaterial，所以有 emissive、metalness
  if (mesh1) {
    mesh1.material.emissive.set(0x004400)  // 自发光
    mesh1.material.metalness = 0.5         // 金属度
  }

  model.add(gltf.scene)
})
```

**坑**
- 先 clone 再修改，顺序不能反。
- 这是第 2 节「改 1 号楼，结果别的楼也变了」的根本原因。

---

## 5. 色彩空间 colorSpace

**一句话结论**：`texture.colorSpace` 声明**纹理本身**用的是什么色彩空间，`renderer.outputColorSpace` 声明**最终输出**到什么色彩空间。两者不需要一致，中间的转换由 Three.js 自动完成。

**Three.js 内部的处理流程**

```text
纹理（按 colorSpace 解读） → 转成线性空间 → 光照计算（线性，物理正确） → 按 outputColorSpace 输出 → 显示器
```

**怎么设置**

| 纹理类型 | 举例 | colorSpace |
|---|---|---|
| 颜色类（给人看的） | 照片、颜色贴图 `map` | `THREE.SRGBColorSpace` |
| 数据类（给计算用的） | 法线贴图、粗糙度贴图 | `THREE.LinearSRGBColorSpace` |

```js
// 颜色贴图：手动加载的要自己声明 sRGB
const texture = new THREE.TextureLoader().load('./earth.jpg')
texture.colorSpace = THREE.SRGBColorSpace

// 法线贴图：线性数据
const normalTexture = new THREE.TextureLoader().load('./normal.jpg')
normalTexture.colorSpace = THREE.LinearSRGBColorSpace

// 渲染器输出到 sRGB（显示器标准）
renderer.outputColorSpace = THREE.SRGBColorSpace
```

**为什么手动加载的贴图要自己设置**：GLTF 模型自带的颜色贴图，加载器已经自动标成 sRGB；用 `TextureLoader` 手动加载的贴图不会自动标记，不设置的话颜色会偏淡、发灰，和模型原有的贴图对不上。

**补充**：当前版本中 `renderer.outputColorSpace` 默认就是 `SRGBColorSpace`，代码里显式写出来是为了表达清楚。

---

## 6. 更换颜色贴图与 flipY

**一句话结论**：要不要翻转贴图，要和**模型 UV 的约定**匹配。Three.js 自带的几何体按「翻转」设计，GLTF 模型按「不翻转」设计。所以给 GLTF 模型换贴图时，要设置 `texture.flipY = false`。

### 两边的默认值

| 来源 | flipY 默认值 | 原因 |
|---|---|---|
| `TextureLoader` 手动加载 | `true` | 配合 Three.js 几何体的 UV（原点在左下角，OpenGL 风格） |
| GLTF 模型自带贴图 | `false` | 配合 GLTF 规范的 UV（原点在左上角） |

可以直接打印对比：

```js
console.log(mesh.material.map.flipY)   // GLTF 自带的：false
console.log(texture.flipY)             // TextureLoader 加载的：true
```

### 同一张图，贴到两种模型上的结果

```text
                        flipY = true（默认）    flipY = false
Three.js 几何体            ✅ 正常              ❌ 上下颠倒
（如 SphereGeometry）
GLTF 模型                  ❌ 上下颠倒          ✅ 正常
```

- 第 5 节的地球贴图贴在 `SphereGeometry` 上，用的是默认的 `true`，显示正常。
- 同样的加载方式贴到 GLTF 手机模型上，就会颠倒、错位。

所以 flipY 本身没有对错，**只看和模型 UV 是否匹配**。

### 解决方案

```js
const texLoader = new THREE.TextureLoader()
const texture = texLoader.load('./phone/黑色.png')
texture.colorSpace = THREE.SRGBColorSpace   // 第 5 节：颜色贴图声明 sRGB
texture.flipY = false                        // 本节：与 GLTF 约定保持一致

loader.load('/phone/手机模型.glb', gltf => {
  const mesh = gltf.scene.children[0]
  mesh.material.map = texture
  model.add(gltf.scene)
})
```

**坑**
- 给 GLTF 换贴图一般要设两个属性：`colorSpace` 和 `flipY`，漏了任何一个都会出问题（颜色发灰，或者图案颠倒）。
- 如果这个材质是多个 Mesh 共用的，换贴图会影响所有共用它的 Mesh，参考第 4 节。

---

## 7. 一页速记

| 现象 / 需求 | 原因 | 解法 |
|---|---|---|
| `scene.add(gltf)` 报错 | gltf 不是 3D 对象 | 用 `gltf.scene` |
| 加载后马上操作模型，取不到 | 加载是异步的 | 写在 `load` 回调里 |
| 想改某个部件 | — | `getObjectByName('名字')` |
| 找到的节点没有 `.material` | 它是 Group | 改它的 `children`，或者用 `traverse` |
| 想批量改所有网格 | — | `traverse` + `if (child.isMesh)` |
| 改一栋楼，其他楼也变了 | 材质共享 | 先 `material.clone()` |
| 手动加载的贴图颜色发灰 | 没声明 sRGB | `texture.colorSpace = THREE.SRGBColorSpace` |
| 给 GLTF 换贴图后图案颠倒 | flipY 和模型 UV 约定不匹配 | `texture.flipY = false` |
