# 纹理 colorSpace 的作用

texture.colorSpace 告诉 Three.js 这个纹理数据本身是用什么色彩空间存储的：

```js
// 照片类纹理（如 diffuse map）通常是 sRGB 编码的
texture.colorSpace = THREE.SRGBColorSpace

// 技术纹理（如 normal map, roughness map）通常是线性的
normalTexture.colorSpace = THREE.LinearSRGBColorSpace
```

## renderer outputColorSpace 的作用

renderer.outputColorSpace 告诉 Three.js 最终渲染结果应该输出到什么色彩空间：

```typescript
// 通常设置为 sRGB，因为大多数显示器期望 sRGB 输出
renderer.outputColorSpace = THREE.SRGBColorSpace
```

## Three.js 内部的色彩空间转换

Three.js 会自动处理不同色彩空间之间的转换：

1. 输入阶段：根据 texture.colorSpace 将纹理数据转换为内部线性空间进行计算

1. 计算阶段：所有光照计算都在线性空间中进行（物理正确）

1. 输出阶段：根据 renderer.outputColorSpace 将结果转换为目标色彩空间

## 最佳实践

```js
// 照片纹理
const diffuseTexture = loader.load('./earth.jpg')
diffuseTexture.colorSpace = THREE.SRGBColorSpace

// 法线贴图（线性数据）
const normalTexture = loader.load('./normal.jpg')
normalTexture.colorSpace = THREE.LinearSRGBColorSpace

// 渲染器输出到 sRGB（显示器标准）
renderer.outputColorSpace = THREE.SRGBColorSpace
```

纹理贴图的colorspace和main.js中的renderer.outputColorSpace不需要一致，Three.js 会自动处理转换，关键是要正确标识每个纹理的实际色彩空间。



# 颜色贴图的更换

如果直接给gltf的模型材质设置.map属性更换贴图，会出现纹理贴图错位的情况，这主要和纹理对象Texture的翻转属性.filpY相关。

gltf1的贴图翻转属性.flipY默认是false，我们可以通过 `mesh.material.map.flipY`获取这个布尔值。

## 纹理坐标系统的差异

### 1. 图像文件的存储方式

- 图像文件（PNG、JPG等）通常按从上到下的扫描线顺序存储

- 像素数据的第一行是图片的顶部

```text
图片文件 (PNG/JPG):
(0,0) ←─── 左上角
  │ 
  ↓ Y轴向下
┌─────────┐
│  图片   │
│  内容   │  
└─────────┘
      右下角
```



### 2. Three.js的纹理坐标系统

- Three.js 默认使用 OpenGL 风格的纹理坐标系统

- Y轴向上，原点在左下角

- 所以 Three.js 默认会将加载的图片垂直翻转（flipY = true）

```text
Three.js 默认:
┌─────────┐
│  纹理   │ ↑ Y轴向上
│  内容   │ │
└─────────┘
(0,0) ←─── 左下角
```



### 3. GLTF 文件的约定

- GLTF 格式遵循DirectX 风格的纹理坐标系统

- Y轴向下，原点在左上角

- 所以 GLTF 加载器会将纹理设置为 flipY = false

## 具体例子

假设你有一张图片，上面写着 "TOP"：

```tex
┌─────────┐
│   TOP   │ ← 图片顶部
│         │
│ BOTTOM  │ ← 图片底部
└─────────┘
```

### Three.js 加载时（flipY = true，默认）：

```text
Three.js 会自动翻转:
┌─────────┐
│ BOTTOM  │ ← 现在在顶部
│         │
│   TOP   │ ← 现在在底部
└─────────┘
```

### GLTF 模型期望（flipY = false）：

```text
GLTF 期望不翻转:
┌─────────┐
│   TOP   │ ← 保持原样
│         │
│ BOTTOM  │ ← 保持原样
└─────────┘
```





## 为什么需要保持一致？

```js
// GLTF模型自带的纹理
console.log('mesh.material.map.flipY', mesh.material.map.flipY); // false

// 你手动加载的纹理
const texture = texLoader.load('./phone/黑色.png')
console.log('texture.flipY', texture.flipY); // true (默认值)

// 如果不统一，纹理就会上下颠倒
```

## 解决方案

```js
const texture=texLoader.load('./phone/黑色.png')
texture.colorSpace = THREE.SRGBColorSpace
// 设置为false，与GLTF纹理保持一致
texture.flipY = false

loader.load('/phone/手机模型.glb',(gltf)=>{
  const mesh=gltf.scene.children[0]
  mesh.material.map=texture
  model.add(gltf.scene)
})
```

## 总结

- GLTF 纹理：flipY = false（符合 GLTF 规范）

- 手动加载的纹理：flipY = true（Three.js 默认）

- 解决方法：手动设置 texture.flipY = false 使其与 GLTF 纹理一致

这样可以确保替换纹理后，图片方向正确显示！