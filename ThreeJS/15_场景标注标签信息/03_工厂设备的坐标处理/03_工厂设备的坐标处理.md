### Three.js 为GLB模型子对象添加标签及坐标原点确认方法

在Three.js项目中，为加载的复杂模型（如GLB格式的工厂模型）中的特定部件（例如某个“设备”）添加HTML标签，是一个常见的需求。核心在于精确找到目标部件，并理解其坐标系，从而正确定位标签。

#### 1. 核心流程

1. 加载模型: 使用 GLTFLoader 加载 .glb 文件。

1. 查找子对象: 在加载成功的回调中，使用 gltf.scene.getObjectByName('对象名') 来获取你想要标注的特定子对象（例如“设备A”）。

1. 创建HTML标签: 从DOM中获取HTML元素（如一个<div>），并使用 CSS2DObject 将其包装成一个Three.js对象。

1. 添加到子对象: 将创建的CSS2DObject标签 add 到找到的子对象上。

关键点: 当一个对象（标签）被添加到另一个对象（设备A）上时，它的position是相对于父对象（设备A）的 本地坐标系。这意味着，将标签的 position 设置为 (0, 0, 0)，它将精确地出现在父对象自身的坐标原点上。

#### 2. 如何确认和可视化子对象的坐标原点

要精确地将标签放置在“设备A”上，首先必须知道“设备A”自己的坐标原点在哪里。以下是三种最有效的方法：

##### 方法一：添加辅助坐标轴 (AxesHelper) - 最直观的可视化方法

这是 最推荐 的方法，因为它可以让你“眼见为实”。直接在目标子对象上添加一个AxesHelper，辅助坐标轴的原点就是该子对象的坐标原点。

```js
// ... 在GLTFLoader的回调中 ...

// 1. 通过名称找到目标对象
const obj = gltf.scene.getObjectByName('设备A');

if (obj) {
    // 2. 创建一个大小适中的坐标轴
    // 30是坐标轴在x,y,z三个方向上的长度
    const axesHelper = new THREE.AxesHelper(30);

    // 3. (可选但推荐) 提高渲染顺序，防止被模型遮挡
    axesHelper.renderOrder = 999;
    axesHelper.material.depthTest = false; // 取消深度测试，总是显示

    // 4. 将坐标轴添加到目标对象上
    obj.add(axesHelper);

    // --- 现在可以添加标签了 ---
    const div = document.getElementById('tag');
    const tag = new CSS2DObject(div);

    // 将标签放在obj的原点 (即axesHelper的交点处)
    tag.position.set(0, 0, 0); 
    obj.add(tag);
}
```

效果: 运行代码后，你会在“设备A”上看到一个独立的红绿蓝三色坐标轴，三条线的交汇点 就是“设备A”的设计坐标原点。

##### 方法二：获取世界坐标 (getWorldPosition) - 用于计算和调试

如果你需要知道“设备A”的原点在整个3D场景（世界坐标系）中的确切位置，可以使用 getWorldPosition() 方法。

```js
if (obj) {
    // 创建一个三维向量用于存储坐标
    const worldPosition = new THREE.Vector3();
    
    // 方法会计算obj的世界坐标并存入worldPosition变量
    obj.getWorldPosition(worldPosition);

    console.log('设备A在世界坐标系中的位置是:', worldPosition);

    // 这个坐标可以用于移动相机、计算距离等。
    // 例如：让相机看向这个点
    // controls.target.copy(worldPosition);
}
```

注意: 模型的 几何中心 不一定等于它的 设计坐标原点 (Pivot Point)。AxesHelper 显示的是设计坐标原点，而包围盒计算的是几何中心。

------

#### 总结

- 添加标签: targetObject.add(label)

- 定位标签: label.position.set(x, y, z)，这个坐标是相对于targetObject的。

- 确认原点: 最佳实践是给targetObject添加一个AxesHelper，实现精确定位和可视化。 



# 点击高亮与标签动态跟随

这是一个常见的进阶需求：用户点击模型上的任意一个零件，我们不仅要高亮这个零件，还要高亮它所属的整个设备（逻辑分组），并在设备上方显示一个信息标签。

### 设计思路 (Design Rationale)

1.  **问题分析**: 一个复杂的GLB模型，通常一个设备（比如一个储物罐）是由多个独立的网格（Mesh）组成的，例如罐体、管道、支架等。如果直接使用射线拾取，我们只能选中用户指针命中的那一个零件，而不是整个设备。
2.  **核心思路**: 建立“零件”到“设备”的反向引用。我们在模型加载完成后，对模型进行一次**预处理**。遍历所有需要交互的设备，为它们的每一个零件（Mesh）都添加一个自定义的指针（我们称之为`ancestors`属性），让这个指针指回它所属的设备分组（Group）。
3.  **交互流程**:
    *   用户点击时，射线拾取到具体的零件Mesh。
    *   我们检查这个Mesh上是否存在`ancestors`属性。
    *   如果存在，我们就能通过`mesh.ancestors`立刻找到它所属的整个设备Group。
    *   然后，我们将这个Group作为高亮对象，并将信息标签`tag`动态地添加到这个Group上。

### 实现流程 (Implementation Steps)

#### Step 1: 模型预处理 (在`mesh.js`中)

此步骤只在模型加载后执行一次，用于建立零件和设备分组的关联，非常高效。

```javascript
// ... 在GLTFLoader的load回调函数中 ...

// 1. 找到所有可交互设备的父容器，比如一个名叫'存储罐'的Group
const storageTanksContainer = gltf.scene.getObjectByName('存储罐');
if (storageTanksContainer) {
    // 2. 遍历每一个设备分组 (比如 存储罐A, 存储罐B)
    storageTanksContainer.children.forEach(tankGroup => {
        // 3. 遍历设备分组下的所有网格(Mesh)零件
        tankGroup.traverse((child) => {
            if (child.isMesh) {
                // 4. 为每个零件mesh添加一个`ancestors`属性，指回它所属的设备分组
                child.ancestors = tankGroup;
            }
        });
    });
}
```

#### Step 2: 点击事件处理 (在`index.js`中)

在主逻辑中监听点击事件，执行射线拾取。

```javascript
window.addEventListener('click', (event) => {
    // 1. 将屏幕坐标转换为标准化设备坐标 (NDC)
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 2. 更新射线
    raycaster.setFromCamera(pointer, camera);

    // 3. 执行拾取
    const intersects = raycaster.intersectObjects(model.children, true);

    // 4. 处理拾取结果 (见下一步)
    // ...
});
```

#### Step 3: 处理高亮与标签

这是点击事件的核心逻辑，根据预处理的结果来执行高亮和标签操作。

```javascript
if (intersects.length > 0) {
    const firstIntersect = intersects[0].object;

    // 关键：检查点击到的零件(mesh)是否有我们预设的ancestors属性
    if (firstIntersect.ancestors) {
        // 获取它所属的整个设备分组
        const parentGroup = firstIntersect.ancestors;

        // 高亮整个分组，而不是单个零件
        outlinePass.selectedObjects = [parentGroup];

        // --- 动态附加和定位Tag ---
        // 1. 将tag添加到分组上
        parentGroup.add(tag);
        // 2. 计算分组的包围盒，以确定tag的精确上方位置
        const box = new THREE.Box3().setFromObject(parentGroup);
        const size = box.getSize(new THREE.Vector3());
        // 3. 将tag放置在分组的顶部中心
        tag.position.set(0, size.y, 0); 
        
        // 4. 显示tag
        tag.visible = true;

    } else {
        // 点击到无关联的物体（如地面），清空高亮
        outlinePass.selectedObjects = [];
        tag.visible = false;
    }
} else {
    // 点击到空白处，清空高亮
    outlinePass.selectedObjects = [];
    tag.visible = false;
}
```


