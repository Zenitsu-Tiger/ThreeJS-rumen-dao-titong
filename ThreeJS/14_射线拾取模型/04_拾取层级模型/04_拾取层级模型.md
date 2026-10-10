# 射线击中规律

```typescript
if(intersects.length>0){
outlinePass.selectedObjects=[intersects[0].object]
}
```

为什么说这里如果采用[intersects[0].object]，则选中的不一定是父模型数组中的第一个，而可能是子模型数组中的第一个？


outlinePass.selectedObjects = [intersects[0].object] 这行代码，选中的是射线 最先 碰到的那个 Mesh （网格模型），而不是它所属的整个父对象（比如从 GLB 加载的整个模型）。

下面我用一个形象的比喻来解释为什么会这样。

------

### 比喻：你买了一辆完整的乐高汽车模型

1. 父模型 (Parent Model):

- 这指的是你从 loader.load() 加载进来的整个 GLB 模型，比如 gltf.scene。它在 Three.js 中通常是一个 THREE.Group。

- 相当于： 一整辆拼好的乐高汽车。它是一个整体的概念。

1. 子模型 (Child Model / Mesh):

- 一个复杂的模型（比如工厂、汽车）是由很多独立的几何部分组成的，每个部分都是一个 THREE.Mesh。

- 相当于： 乐高汽车的车身、四个轮子、车窗、方向盘。这些都是具体的、可以触摸到的零件。

1. raycaster.intersectObjects() 的工作方式：

- raycaster 发出的射线就像你的一根手指。

- 当你调用 raycaster.intersectObjects(cunchu.children) 时，你是在说：“我的手指从屏幕戳进去了，请告诉我，我的指尖最先碰到了哪个零件？”

1. intersects[0].object 是什么？

- intersects 是一个报告，按照被碰到的远近顺序，记录了所有被你手指碰到的零件。

- intersects[0] 就是报告的第一条记录，也就是离你最近、最先被碰到的那个零件。

- intersects[0].object 就是那个零件本身。如果你戳到了汽车的左前轮，intersects[0].object 就是“左前轮”这个 Mesh，而不是“整辆乐高汽车”这个 Group。

------

### 结论

当你执行 outlinePass.selectedObjects = [intersects[0].object] 时，你是在告诉 OutlinePass：

\> “请只给我手指碰到的那个零件（比如工厂模型的屋顶，或者汽车的一个轮子）画上描边。”

所以，结果就是只有模型的一个小部分被描边了，而不是你期望的整个父模型。

### 如何解决：选中整个父模型？

給需要射线拾取父对象的所有子对象Mesh自定义一个属性`.ancestors`，然后让该属性指向需要射线拾取父对象。

```typescript
renderer.domElement.addEventListener('click',(event)=>{
  // 1.座标转化(屏幕坐标转标准设备坐标)
  const px=event.offsetX
  const py=event.offsetY
  // 屏幕坐标px,py转WebGL标准设备坐标x,y
  // width,height表示canvas画布宽高度
  const x=(px/window.innerWidth)*2-1
  const y=-(py/window.innerHeight)*2+1

  // 2.创建一个射线投射器Raycaster
const raycaster=new THREE.Raycaster()
// setFromCamera()是用于计算射线投射器Raycaster的射线属性.ray
// 也就是在点击位置创建一条射线，用于选中拾取模型对象
// 这种方式不用定义射线起点和射线方向
raycaster.setFromCamera(new THREE.Vector2(x,y),camera)


// 射线拾取模型
const cunchu=group.getObjectByName('存储罐')
for(let i=0;i<cunchu.children.length;i++){
  // 先获取父对象
  const group=cunchu.children[i]
  // 再递归遍历每一个父对象中的子对象，打上标记设置其祖宗tag，方便后面拾取模型直接定位父对象
  group.traverse((obj)=>{
    if(obj.isMesh){
      obj.ancestors=group
    }
  })

}

const intersects=raycaster.intersectObjects(cunchu.children)
console.log('intersects',intersects);

if(intersects.length>0){
  // 这里如果采用[intersects[0].object]，则选中的不一定是父模型数组中的第一个，而可能是子模型数组中的第一个
outlinePass.selectedObjects=[intersects[0].object.ancestors]
}

})
```





# webGL坐标系复习

## 1. 坐标系统统一性

WebGL和Three.js内部都使用标准化设备坐标系（Normalized Device Coordinates, NDC），这个坐标系的特点是：

- X轴：-1（左边缘）到 +1（右边缘）

- Y轴：-1（下边缘）到 +1（上边缘）

- Z轴：-1（近平面）到 +1（远平面）

这个坐标系与屏幕分辨率无关，是一个标准化的3D空间。

## 2. 相机投影的数学原理

当你使用 setFromCamera() 时，Three.js需要：

1. 逆向投影计算：从2D屏幕点反推到3D空间中的射线

1. 相机矩阵运算：使用相机的投影矩阵和视图矩阵进行坐标变换

这些计算都是基于标准化坐标系进行的。如果直接使用屏幕像素坐标（比如800x600），那么：

- 不同分辨率的屏幕会得到不同的结果

- 数学计算会变得复杂且不准确

## 3. 坐标转换的必要性

```js
// 屏幕坐标转换为标准设备坐标

const x = (px / window.innerWidth) * 2 - 1;  *// 0~width → -1~+1*

const y = -(py / window.innerHeight) * 2 + 1; *// 0~height → +1~-1 (注意Y轴翻转)*
```

这个转换确保了：

- 设备无关性：无论屏幕是1920x1080还是800x600，同一个相对位置总是得到相同的标准化坐标

- 数学正确性：投影矩阵的逆运算基于[-1,1]范围设计

## 4. Y轴翻转的原因

注意转换公式中Y轴有负号：

- 屏幕坐标：Y轴向下为正（0在顶部）

- WebGL坐标：Y轴向上为正（-1在底部，+1在顶部）

所以需要翻转Y轴来匹配WebGL的坐标系统。

## 5. 射线计算的内部流程

当你调用 setFromCamera(new THREE.Vector2(x,y), camera) 时，Three.js内部会：

```typescript
// 简化的内部逻辑
const projectionMatrixInverse = camera.projectionMatrixInverse;
const worldMatrix = camera.matrixWorld;

// 将NDC坐标转换为相机空间的近平面和远平面点
const nearPoint = new Vector3(x, y, -1).applyMatrix4(projectionMatrixInverse);
const farPoint = new Vector3(x, y, 1).applyMatrix4(projectionMatrixInverse);

// 转换到世界空间
nearPoint.applyMatrix4(worldMatrix);
farPoint.applyMatrix4(worldMatrix);

// 计算射线方向
const direction = farPoint.sub(nearPoint).normalize();
```

这整个过程都依赖于标准化的坐标输入。

总结：使用标准设备坐标是为了确保射线计算在所有设备和分辨率下都能准确工作，这是WebGL图形管道的标准做法。



# 向量选择原理

## 为什么使用二维向量？

raycaster.setFromCamera() 使用二维向量是因为：

### 射线的定义需求

- 鼠标点击本质上就是一个2D屏幕位置（x, y）

- 射线是从相机位置出发，穿过这个2D屏幕点，延伸到3D空间的一条直线

- 我们只需要知道射线"穿过屏幕的哪个点"，不需要指定Z值

### 相机投影的工作原理

```js
// 相机投影就像一个"窗口"
屏幕2D点 → 通过相机投影 → 3D空间中的射线
```

相机已经定义了：

- 位置（射线起点）

- 朝向和视野（投影方式）

- 近远平面距离

所以只需要屏幕上的(x,y)坐标就能确定整条射线。

## 2. 为什么Z轴默认选-1？

这涉及到WebGL的标准化设备坐标系（NDC）：

### NDC坐标系定义

```typescript
X: -1(左) 到 +1(右)
Y: -1(下) 到 +1(上)  
Z: -1(近平面) 到 +1(远平面)
```

### Z=-1表示近平面

- Z = -1：相机的近平面（最近可见距离）

- Z = +1：相机的远平面（最远可见距离）

### 射线计算的数学原理

```js
// Three.js内部的简化逻辑
function setFromCamera(coords, camera) {
  // 1. 在近平面上找到对应点
  const nearPoint = new Vector3(coords.x, coords.y, -1);
  
  // 2. 在远平面上找到对应点  
  const farPoint = new Vector3(coords.x, coords.y, +1);
  
  // 3. 通过逆投影矩阵转换到世界坐标
  nearPoint.applyMatrix4(camera.projectionMatrixInverse);
  farPoint.applyMatrix4(camera.projectionMatrixInverse);
  
  // 4. 转换到世界空间
  nearPoint.applyMatrix4(camera.matrixWorld);
  farPoint.applyMatrix4(camera.matrixWorld);
  
  // 5. 计算射线：起点 + 方向
  this.ray.origin.copy(nearPoint);
  this.ray.direction.subVectors(farPoint, nearPoint).normalize();
}
```

### 为什么选择-1而不是其他值？

1. 标准化：-1是NDC中近平面的标准位置

1. 一致性：所有WebGL应用都使用这个约定

1. 数学简洁：投影矩阵专门为这个坐标系设计

### 可视化理解

```typescript
相机位置 ────→ [近平面Z=-1] ────→ [远平面Z=+1]
              ↑
            屏幕点(x,y,-1)
```

射线从相机出发，穿过近平面上的点(x,y,-1)，延伸到远平面的对应点(x,y,+1)，然后继续延伸到无穷远。

所以使用二维向量是因为只需要指定"射线穿过屏幕的哪个位置"，而Z=-1是WebGL标准中近平面的固定位置。



