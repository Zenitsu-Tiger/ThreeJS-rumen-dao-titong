# PBR材质的金属度和粗糙度

## 金属度metalness

金属度属性.metalness表示材质**像**金属的程度，非金属材料比如石材或者木材，一般这个值定义为0.0，金属一般用1.0。

threejs的PBR默认是0.5,0.0到1.0之间的值用于生锈的金属外观。

```js
// 导入Three.js核心库
import * as THREE from 'three'
// 导入GLTF模型加载器，用于加载.glb/.gltf格式的3D模型文件
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 创建GLTF加载器实例
const loader = new GLTFLoader()

// 创建一个空的3D对象组，用于容纳加载的模型
const model = new THREE.Group()

// 异步加载3D模型文件
loader.load('./metal/金属.glb', (gltf) => {
  // 遍历加载的模型场景中的所有子对象
  gltf.scene.traverse((child) => {
    // 判断当前子对象是否为网格对象(Mesh)
    if (child.isMesh) {
      // 为网格对象设置新的PBR标准材质
      child.material = new THREE.MeshStandardMaterial({
        roughness: 0.5,  // 粗糙度：0.5表示半光滑表面
        metalness: 1,    // 金属度：1表示完全金属材质
      })
    }
  })
  // 将加载完成的3D场景添加到模型组中
  model.add(gltf.scene)
})

// 导出模型组，供其他模块使用
export default model
```

### 1. 模块导入

- 导入了Three.js核心库，用于3D图形渲染

- 导入了GLTFLoader，这是Three.js提供的专门用于加载GLTF/GLB格式3D模型的加载器

### 2. 创建加载器和容器

- loader：GLTF加载器实例，负责异步加载3D模型文件

- model：THREE.Group对象，作为容器来组织和管理3D对象

### 3. 模型加载和材质配置

- 加载位于./metal/金属.glb路径的3D模型文件

- 使用traverse()方法遍历模型中的所有子对象

- 对每个网格对象应用新的PBR标准材质：

- roughness: 0.5：设置表面粗糙度为中等水平

- metalness: 1：设置为完全金属材质，会产生金属的反射效果

### 4. PBR材质说明

PBR（Physically Based Rendering，基于物理的渲染）材质能够更真实地模拟材料的光学特性：

- roughness：控制表面的光滑程度，0为镜面，1为完全粗糙

- metalness：控制材质的金属特性，0为非金属，1为金属

这段代码特别适用于需要展示金属制品或工业产品的3D可视化场景。





# Three.js中环境贴图的应用与原理

环境贴图（Environment Map）是三维图形学中一种模拟物体反射周围环境的重要技术。它能极大地增强场景的真实感，尤其对于金属、玻璃等具有反射属性的材质效果显著。

## 1. envMap：设置环境反射

在Three.js中，要让一个物体反射出周围的环境，核心就是设置其材质的 envMap 属性。

- 工作原理：envMap 属性需要被赋值一个立方体纹理（CubeTexture）。这个立方体纹理是由六张图片组成的，分别代表了观察点朝向+X、-X、+Y、-Y、+Z、-Z六个方向看到的景象，共同构成一个包裹住整个场景的“天空盒”。当渲染器渲染物体时，它会根据摄像机的位置和物体表面的朝向，计算出反射光线应该从这个立方体纹理的哪个方向、哪个点上进行采样，并将采样到的颜色应用到模型表面，从而模拟出反射效果。

```typescript
  // 1. 创建一个立方体纹理加载器并加载六张贴图
  const textureCube = new THREE.CubeTextureLoader()
    .setPath('./环境贴图0/')
    .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);

  // 2. 在模型加载成功后，将其应用到材质的envMap属性上
  child.material.envMap = textureCube;
```

这段代码首先创建了一个 CubeTexture 对象 textureCube，然后将其赋值给了模型材质的 envMap 属性，这样模型就具备了反射周围环境的能力。

## 2. envMapIntensity：控制反射强度

envMapIntensity 属性用于精细地控制环境贴图对模型表面材质的影响强度。

- 作用：它相当于一个“反射率”的调节器。

- envMapIntensity = 1：表示完全反射环境贴图，反射效果最强。

- envMapIntensity = 0.5：表示反射效果为50%，模型本身的颜色和环境反射的颜色会进行混合。

- envMapIntensity = 0：表示完全不反射环境，envMap 将不起任何作用。

```typescript
  // 设置环境贴图的反射强度为1
  child.material.envMapIntensity = 1;
```

通过调整这个值，你可以控制物体表面的反光程度，让它看起来更像一个镜面（值为1时），或者只是带有轻微环境反光的磨砂表面。

------

## 3. 为什么环境贴图不像“贴纸”一样直接贴在模型上？

这是一个非常好的问题，它触及了环境贴图（envMap）和纹理贴图（map）的根本区别。

- 纹理贴图 (material.map)：

- 作用：像给物体“穿衣服”或“贴贴纸”。它将一张二维图片根据模型的UV坐标（可以理解为模型表面展开后的二维坐标）直接包裹或平铺在模型表面。

- 视觉效果：图片会固定在模型的表面上，无论你从哪个角度观察，图片在模型上的位置是不会变的。它定义了物体表面的固有颜色和图案。

- 环境贴图 (material.envMap)：

- 作用：模拟物体对周围环境的反射。它与模型的UV坐标无关。

- 视觉效果：你看到的不是贴图本身，而是贴图所代表的环境经过物体表面反射后进入你眼睛的样子。当你移动摄像机（改变观察角度）或者旋转物体时，表面反射的景象会随之实时发生变化，就像你照镜子时，移动自己的位置，镜中的景象也会跟着变一样。它定义了物体如何反射光线。

总结一下：

您看到的现象是完全正确的，这正是环境贴图应该有的效果。它不是要把“环境”这张图画在模型上，而是要让模型表面像一面镜子（或磨砂金属）一样，反射出这个环境。

在您的代码中，metalness: 1 和 roughness: 0.5 这两个PBR材质属性也共同影响了最终效果：

- metalness: 1 告诉渲染器这个物体是纯金属，应该具有强烈的反射能力。

- roughness: 0.5 告诉渲染器这个金属表面是半粗糙的，所以反射出来的影像是模糊的，而不是镜面一样清晰的。如果将 roughness 改为 0，您就会看到更清晰、更像镜子的反射效果。



## 环境贴图：不仅仅是反射，更是光源

```typescript
// 导入Three.js核心库
import * as THREE from 'three'
// 导入GLTF模型加载器，用于加载.glb/.gltf格式的3D模型文件
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 创建GLTF加载器实例
const loader = new GLTFLoader()

// 创建一个空的3D对象组，用于容纳加载的模型
const model = new THREE.Group()


// CubeTexture代表了立方体纹理对象，父类是纹理对象Texture
// 先设置路径
// 再加载6个方向的立方体贴图：x轴正负，y轴正负，z轴正负
const textureCube=new THREE.CubeTextureLoader()
.setPath('./环境贴图0/')
.load(['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg'])


loader.load('./工厂/工厂.gltf',(gltf)=>{
   gltf.scene.traverse((child)=>{
    if(child.isMesh){

      // 设置环境贴图属性的值为立方体纹理对象
      child.material.envMap=textureCube

      //envMapIntensity 用于设置模型表面反射周围环境贴图的能力
      child.material.envMapIntensity=1
    }
  }) 
  model.add(gltf.scene)
})

// 导出模型组，供其他模块使用
export default model
```

在场景中没有添加任何Light对象（如DirectionalLight、AmbientLight等）的情况下，模型依然被照亮并且清晰可见——其根本原因在于环境贴图 (envMap) 本身就可以作为一种光源。

这种技术被称为基于图像的照明 (Image-Based Lighting, IBL)。

### 1. 基于图像的照明 (IBL) 如何工作？

在传统的3D光照中，我们会在场景中放置一些虚拟的光源（点光源、平行光等），渲染器会计算这些光源如何照射到物体表面。

而IBL则完全不同，它将一张环境贴图（在您的代码中就是那个由六张图片组成的textureCube）视为一个包裹着整个场景的、巨大的、发光的天球。这个天球的每一个像素都在发光。

当Three.js渲染一个使用了envMap的PBR材质（例如MeshStandardMaterial）时，它会做两件事：

- 计算反射 (Specular)：这是我们通常理解的“镜面反射”效果。渲染器会根据摄像机和模型表面的角度，计算出应该反射环境中的哪个部分。这就是您之前看到的模型表面映出环境影像的原因。

- 计算漫反射 (Diffuse)：这是让模型在没有直接光源时依然被“照亮”的关键。渲染器会采集整个环境贴图提供的光照信息，并计算出它如何均匀地或有方向性地影响模型表面。简单来说，环境贴图中的亮部（比如天空、窗户）会照亮模型，暗部则贡献较少的光。最终，模型表面的颜色和亮度是由整个环境贴图共同决定的。

### 2. 在您的代码中是如何体现的？

- 在 mesh.js 中，您将加载的 textureCube 赋值给了模型材质的 envMap 属性：

```js
    child.material.envMap = textureCube;
```

- 您加载的 .gltf 模型，其内部材质通常默认就是 MeshStandardMaterial，这种材质天生就支持并能理解IBL。

- 因此，当您在 main.js 中将DirectionalLight注释掉后，MeshStandardMaterial 就完全依赖 envMap 来获取光照信息。环境贴图不仅提供了反射的影像，也提供了照亮模型本身所需要的所有光。

总结来说，您的模型之所以可见，是因为它正被它所“反射”的那个环境所照亮。 这是一种非常高效且能产生高度真实感光照效果的技术，因为它能模拟出真实世界中来自四面八方的环境光，使得光照效果更加柔和、自然。



# 深入理解Three.js中的清漆层 (Clear Coat)

清漆层是MeshPhysicalMaterial提供的一种高级功能，它用于模拟在物体基础材质之上的一层薄而透明的涂层。想象一下现实生活中的汽车车漆、涂了清漆的木制家具或是碳纤维制品，它们表面都有一层光亮的保护层，这个保护层就是清漆层。

## 什么是清漆层？

从渲染的角度来看，清漆层在原有的PBR（基于物理的渲染）材质模型上，增加了一个额外的反射层。这意味着光线照射到物体表面时，会发生两次主要的反射：

1. 清漆层反射：一部分光线会直接在最外层的清漆层表面被反射回来。这个反射通常是镜面反射（specular），非常光滑。

1. 基础层反射：另一部分光线会穿透清漆层，与下面的基础材质（由color, metalness, roughness等属性定义）相互作用，然后再反射出来。

这种双层反射的模型，极大地增强了材质的真实感和深度感。

## 清漆层的核心参数

在Three.js中，清漆层主要由两个参数控制：

### clearcoat

这个属性用于控制清漆层的强度或厚度，它的取值范围是 0.0 到 1.0。

- clearcoat: 0：表示完全没有清漆层，此时材质的表现和MeshStandardMaterial几乎一样。

- clearcoat: 1：表示清漆层达到最大强度，它会在物体表面产生一层非常明显的光滑反射。

- 0.0到1.0之间的值：可以模拟不同厚度或磨损程度的清漆效果。

在您的代码中，clearcoat: 1 赋予了车壳一个完整的、高强度的清漆涂层。

### clearcoatRoughness

这个属性用于控制清漆层本身的粗糙度，它的取值范围也是 0.0 到 1.0。它与基础层的roughness是完全独立的。

- clearcoatRoughness: 0：表示清漆层表面是绝对光滑的镜面，能产生非常清晰、锐利的反射。

- clearcoatRoughness: 1：表示清漆层表面非常粗糙，产生的反射会非常模糊和发散，类似磨砂玻璃的效果。

- 中间值：可以模拟出有轻微划痕或不那么完美的清漆表面。

在您的代码中，clearcoatRoughness: 0.01 设置了一个非常光滑的清漆层，所以车壳的表面反光会像镜子一样清晰。

## 清漆层的具体作用与应用

清漆层的主要作用是提升材质的真实感和视觉复杂度，尤其适用于以下场景：

1. 汽车车漆：这是最经典的应用。基础层是带有金属颗粒的彩色油漆（由color和metalness控制），清漆层则是覆盖在上面的那一层光亮的保护漆。

1. 抛光木材或乐器：基础层是木材的纹理贴图，清漆层模拟了表面的透明亮漆。

1. 碳纤维材料：基础层是碳纤维的编织纹理，清漆层是覆盖在其上的环氧树脂。

1. 潮湿表面：可以模拟物体表面覆盖着一层薄薄的水膜的效果。

通过组合clearcoat和clearcoatRoughness，并配合基础层的metalness和roughness，您可以创造出极其丰富和逼真的材质效果，这对于追求顶级渲染质量的项目至关重要。
