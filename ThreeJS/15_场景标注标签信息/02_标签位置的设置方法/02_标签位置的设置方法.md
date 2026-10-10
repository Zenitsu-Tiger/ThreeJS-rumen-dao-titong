# 世界坐标和本地坐标

```typescript
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 引入CSS2模型对象CSS2DObject
import {CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js'


const geometry=new THREE.BoxGeometry(40,40,40)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff
})

const mesh=new THREE.Mesh(geometry,material)
mesh.position.set(50,0,50)
const meshGroup=new THREE.Group()
meshGroup.add(mesh)

// mesh位置受到父对象局部坐标.position影响
meshGroup.position.x=-100
const group=new THREE.Group()
const div=document.getElementById('tag')
const tag=new CSS2DObject(div)
// 获取mesh的世界坐标
const worldPosition=new THREE.Vector3()
mesh.getWorldPosition(worldPosition)
// 世界坐标
console.log('worldPosition',worldPosition);
// mesh世界坐标赋值给tag,使其同步位移
tag.position.copy(worldPosition)
group.add(meshGroup)
group.add(tag)
// 本地坐标
console.log('mesh.position',mesh.position);

export default group
```

### mesh.position 是本地坐标

```typescript
mesh.position.set(50,0,50)  // 设置mesh的本地位置
console.log('mesh.position', mesh.position); // 输出: x=50, y=0, z=50
```

mesh.position 始终表示的是 mesh相对于其父对象（meshGroup）的本地坐标，无论父对象如何移动，这个值都不会改变。

### 世界坐标 vs 本地坐标

- 本地坐标 (mesh.position): 50, 0, 50

- 世界坐标 (在整个场景中的实际位置): -50, 0, 50

如果你想验证mesh在世界坐标系中的位置，可以使用：

```typescript
const worldPosition = new THREE.Vector3();
mesh.getWorldPosition(worldPosition);
console.log('mesh世界坐标', worldPosition); // 这里x会是-50
```

### 总结

- mesh.position.x = 50 (本地坐标，相对于meshGroup)

- mesh在世界坐标系中的x位置 = -50 (因为meshGroup.position.x = -100)



同样，子对象模型会默认继承父对象模型的位置，所以你也可以直接使用以下方式来同步世界坐标:
```js
mesh.add(tag)
```



# 标记几何体顶点

```typescript
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 引入CSS2模型对象CSS2DObject
import {CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js'


const geometry=new THREE.BoxGeometry(40,40,40)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff
})

const mesh=new THREE.Mesh(geometry,material)
mesh.position.set(50,0,50)
const meshGroup=new THREE.Group()


// mesh位置受到父对象局部坐标.position影响
meshGroup.position.x=-100
const group=new THREE.Group()
const div=document.getElementById('tag')
const tag=new CSS2DObject(div)
mesh.add(tag)
const pos=geometry.attributes.position
// 获取几何体顶点1的xyz坐标，设置标签的局部坐标.position与其同步
tag.position.set(pos.getX(0),pos.getY(0),pos.getZ(0))

meshGroup.add(mesh)
group.add(meshGroup)

// 本地坐标
console.log('mesh.position',mesh.position);

export default group
```

