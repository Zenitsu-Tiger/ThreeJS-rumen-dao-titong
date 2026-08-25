# WebGL / Three.js 系统学习进度总览

> 用途：按章节梳理「学过什么概念」，方便进度整理与复习。  
> 勾选方式：把 `- [ ]` 改成 `- [x]` 表示该概念已掌握。

```
WebGL/
├── Math/                 # 3D 数学基础（5 章）
├── ThreeJS/              # Three.js 主线（18 章）
└── 特殊案例讲解/          # 补充专题
```

**建议复习顺序**：数学基础 → 快速入门 → 几何/材质/层级 → UV/glTF/PBR → 曲线/相机/光影 → 精灵/后期/拾取/标注 → 动画/物理 → 综合项目。

---

# 第一部分：Math — 3D 数学基础

## Math · 01 坐标系与三角函数

**章节目标**：搞清弧度、三角函数、Vector3（位置 vs 方向），并能用方向向量控制运动与可视化。

### 概念清单

- [ ] **弧度（radian）**：弧长 = 半径时对应 1 弧度；`2π = 360°`
- [ ] **度 ↔ 弧度换算**：`degToRad` / `radToDeg`；为何图形 API 多用弧度
- [ ] **单位圆与 sin/cos**：`x = R·cos(θ)`，`y = R·sin(θ)`；圆周运动
- [ ] **Vector3 两种含义**：位置点；方向 + 长度（位移/速度）
- [ ] **向量加法**：`B = A + walk` / `addVectors`；位置 + 位移 = 新位置
- [ ] **向量长度**：`length()` / `lengthSq()`
- [ ] **单位向量与归一化**：`normalize()`；方向不变、长度为 1
- [ ] **速度向量**：`position.add(velocity * dt)` 驱动每帧位移
- [ ] **视线方向**：目标点 − 相机位置，再归一化
- [ ] **ArrowHelper**：用箭头可视化方向、起点、长度（连接两点）

### 对应练习文件

| 文件 | 练什么 |
|------|--------|
| `01_弧度和角度` | 弧度、圆周运动 |
| `02_单位向量和方向长度` / `02_Vector3向量.md` | 位置、位移、单位向量 |
| `03_向量方向应用实战` | 沿方向移动（含 GUI / Tween） |
| `04_ArrowHelper连接点` | 方向可视化 |

---

## Math · 02 位移和加速度

**章节目标**：用时间驱动位移；区分匀速与重力加速；理解积分写法 vs 逐帧累加。

### 概念清单

- [ ] **匀速运动**：`位移 = 速度向量 × 时间 t`
- [ ] **Clock / getDelta**：帧间隔；累加总时间 `t`
- [ ] **速度 ≠ 位置**：`v` 是每秒位移量，不是目标点
- [ ] **重力加速度**：`v = v0 + g·t`，位移随时间平方增长
- [ ] **积分写法（基于总时间）**：用公式直接算当前位置
- [ ] **微分写法（逐帧累加）**：每帧 `v += a·dt`，`pos += v·dt`
- [ ] **两种写法的对比**：精度、稳定性、实现差异

### 对应练习文件

| 文件 | 练什么 |
|------|--------|
| `01_匀速运动.js` + README | 匀速、重力加速两种写法 |

---

## Math · 03 向量点乘、叉乘

**章节目标**：用点乘判夹角/前后；用叉乘判左右、求法线、算面积。

### 点乘（Dot）

- [ ] **点乘定义**：`a·b = |a||b|cosθ`；`dot()`
- [ ] **单位向量点乘 = cosθ**：再 `acos` 得夹角弧度 → 角度
- [ ] **三角形顶点夹角**：两边向量单位化后点乘求角
- [ ] **方向判定**：点乘 > 0 同向/前方，< 0 反向/后方
- [ ] **扇形可视区**：半角弧度、扇区顶点离散、点乘判是否在扇内
- [ ] **扇形可视化**：`BufferGeometry` 画扇面；`computeVertexNormals`

### 叉乘（Cross）

- [ ] **叉乘几何意义**：结果垂直于 a、b 平面；右手法则
- [ ] **顺序影响方向**：`a×b` 与 `b×a` 相反
- [ ] **ArrowHelper 可视化** a、b、c
- [ ] **左右方位判定**：人朝前 × 指向物体 → 看结果 Y 分量符号
- [ ] **线段同侧/异侧**：两点相对线段叉乘符号是否相同
- [ ] **三角形法线**：两边叉乘再归一化
- [ ] **三角形面积**：`|a×b| / 2`
- [ ] **网格表面积**：遍历索引三角形累加面积

### 对应练习文件

| 文件 | 练什么 |
|------|--------|
| `01_点乘运算` | 点乘、夹角 |
| `02_余弦值的计算` | 三角形顶角 |
| `03_点乘判定方向` | 前后判定 |
| `04_计算和绘制扇形区域` | 扇形检测 + 绘制 |
| `05_叉乘计算` | 叉乘与可视化 |
| `06_利用叉乘判定方位` | 左右判定 |
| `07_利用叉乘判定点的侧位` | 同侧/异侧 |
| `08_叉乘计算三角形法线` | 法线 |
| `09_利用叉乘计算面积` | 单三角面积 |
| `10_利用叉乘计算物体表面积` | 网格总面积 |

---

## Math · 04 四元数和欧拉角

**章节目标**：会用欧拉角调姿态；理解万向节锁；用四元数做旋转合成与朝向对齐。

### 欧拉角（Euler）

- [ ] **三个分量**：Roll(X) / Pitch(Y) / Yaw(Z)
- [ ] **旋转顺序 `order`**：`XYZ`、`YXZ` 等结果不同
- [ ] **应用到模型**：`object.rotation` / `setRotationFromEuler`
- [ ] **优点**：直观、易调参
- [ ] **缺点 / 万向节锁**：中间轴 ±90° 时丢失一个自由度
- [ ] **适用场景**：相机俯仰偏航、简单姿态调试

### 四元数（Quaternion）

- [ ] **四元数表示**：`q = w + xi + yj + zk`；轴角关系
- [ ] **为何用四元数**：无万向节锁、易插值、易合成
- [ ] **`setFromAxisAngle`**：绕任意轴旋转
- [ ] **`setFromEuler`**：欧拉 ↔ 四元数
- [ ] **应用到向量/模型**：`vector.applyQuaternion`；`object.quaternion`
- [ ] **四元数乘法**：旋转合成；**乘积顺序**影响结果
- [ ] **`setFromUnitVectors(a, b)`**：把方向 a 旋到方向 b
- [ ] **插值**：`slerp` 平滑转向
- [ ] **朝向应用**：飞机导航、相机注视、物体对齐

### 对应练习文件

| 路径 | 练什么 |
|------|--------|
| `01_欧拉角/` | Euler、order、万向节锁 |
| `02_四元数/01~04` | 旋转特性、模型使用、乘积、方位计算 |

---

## Math · 05 矩阵（Matrix4）

**章节目标**：理解 4×4 列优先矩阵；平移/旋转/缩放；对顶点做矩阵变换。

### 概念清单

- [ ] **列优先存储**：`elements[0..15]` 与矩阵行列对应
- [ ] **平移分量位置**：`elements[12/13/14]` = Tx/Ty/Tz
- [ ] **缩放 / 剪切**在矩阵中的位置
- [ ] **齐次坐标**：为何用 4×4 统一表示仿射变换
- [ ] **构造变换**：平移矩阵、缩放矩阵、组合矩阵
- [ ] **矩阵分解**：从矩阵取 position / quaternion / scale
- [ ] **变换顺序**：先旋转后平移 ≠ 先平移后旋转
- [ ] **顶点批量变换**：对 `position` 属性逐点 `applyMatrix4`
- [ ] **Object3D 变换链**：本地矩阵 → 世界矩阵（`matrix` / `matrixWorld`）

### 对应练习文件

| 文件 | 练什么 |
|------|--------|
| `01_4x4矩阵` | 矩阵结构、elements |
| `02_matrix4的应用` | 组合变换 |
| `03_顶点坐标进行矩阵变换` | 顶点级变换 |

---

# 第二部分：ThreeJS — 主线课程

## ThreeJS · 01 快速入门

**章节目标**：搭出第一个可交互场景；理解渲染循环、基础光材质与 GUI 调试。

### 01_basic_knowledge — 场景骨架

- [ ] 模块引入：`three`、`OrbitControls`
- [ ] **Scene** 作为对象容器
- [ ] **Geometry + Material → Mesh**
- [ ] `MeshBasicMaterial` vs `MeshLambertMaterial`
- [ ] **AxesHelper** 辅助坐标系
- [ ] **PointLight**：intensity / decay / distance / Helper
- [ ] **PerspectiveCamera**：fov、aspect、near、far、lookAt
- [ ] **WebGLRenderer**：setSize、domElement
- [ ] **渲染循环** + OrbitControls

### 02_进阶知识点

- [ ] 四种光：**Ambient / Point / Directional / Spot** 特点对比
- [ ] 漫反射 vs 镜面反射；Lambert vs Phong
- [ ] **requestAnimationFrame** vs setInterval
- [ ] **Clock.getDelta** 算帧间隔与 FPS
- [ ] **Stats** 观察帧率
- [ ] canvas **resize** 时更新相机 aspect 与 renderer 尺寸
- [ ] 常见几何体；立方体阵列
- [ ] **MeshPhongMaterial**：高光、emissive

### 03_GUI 的使用

- [ ] **lil-gui** 绑定属性实时调参

---

## ThreeJS · 02 几何体的顶点模型

**章节目标**：理解 BufferGeometry 数据布局；点/线/网格与顶点法线。

### 概念清单

- [ ] **BufferGeometry** 与 Typed Array（Float32Array 等）
- [ ] **BufferAttribute**：position / normal / uv / color
- [ ] **index** 索引绘制；顶点复用、节省内存
- [ ] 网格本质是**三角形**；顺/逆时针与正反面
- [ ] `side`：FrontSide / BackSide / DoubleSide
- [ ] **点模型** `Points` + PointsMaterial
- [ ] **线模型** `Line` / `LineLoop` / `LineSegments`
- [ ] **顶点法线**：光照计算；`computeVertexNormals`；ArrowHelper 可视化
- [ ] 动态改顶点：`attribute.needsUpdate = true`

---

## ThreeJS · 03 模型对象和材质

**章节目标**：掌握 Object3D 变换属性与材质基础表现。

### 概念清单

- [ ] **position / scale / rotation** 基本属性
- [ ] Vector3 常用 API：`set`、`copy`、`add`、`normalize`
- [ ] **`translateOnAxis`**：沿自定义单位方向平移
- [ ] 材质**颜色**（Color）
- [ ] **透明度**：transparent、opacity
- [ ] **可见面** side 设置
- [ ] **共享几何/材质**：改一处影响全部；何时 clone
- [ ] **角度与旋转**：弧度；绕轴旋转

---

## ThreeJS · 04 层级模型

**章节目标**：用 Group 组织场景；分清本地坐标与世界坐标。

### 概念清单

- [ ] **Group**：逻辑分组、统一变换
- [ ] 嵌套 Group；变换累积顺序
- [ ] **本地坐标** `object.position` vs **世界坐标** `getWorldPosition`
- [ ] **`traverse`**：递归遍历子树
- [ ] 按名称查找：`getObjectByName`

---

## ThreeJS · 05 几何顶点 UV 和纹理

**章节目标**：理解 UV 映射；控制贴图重复/偏移；雾与环境贴图入门。

### 概念清单

- [ ] **UV 坐标**：u、v ∈ [0,1]；顶点 ↔ 贴图像素
- [ ] **TextureLoader** + `material.map`
- [ ] PNG **透明贴图**原理（alpha）
- [ ] 手写 UV 数组 / UV 超出 [0,1] 时的表现
- [ ] **wrapS / wrapT**：RepeatWrapping、MirroredRepeatWrapping
- [ ] **`texture.repeat`** 平铺；**`texture.offset`** UV 动画偏移
- [ ] **复合纹理**（多贴图叠加思路）
- [ ] **Fog / FogExp2** 雾效
- [ ] **HDR / RGBELoader**、环境贴图作为背景与 envMap（入门）

---

## ThreeJS · 06 glTF

**章节目标**：正确加载外部模型；处理节点、材质共享与色彩空间。

### 概念清单

- [ ] **GLTFLoader** 加载 `.gltf` / `.glb`
- [ ] **`traverse`** 遍历 Mesh 改材质
- [ ] **避免共享材质副作用**：`material.clone()`
- [ ] **获取指定节点**：`getObjectByName`
- [ ] **colorSpace**：贴图 `SRGBColorSpace` vs 线性数据
- [ ] **`renderer.outputColorSpace`**
- [ ] glTF 贴图 **`flipY = false`** 与 Three 默认差异

---

## ThreeJS · 07 PBR 材质

**章节目标**：用物理材质表达金属/粗糙度；环境照明与清漆层。

### 概念清单

- [ ] **MeshStandardMaterial / MeshPhysicalMaterial**
- [ ] **metalness**（0 非金属 ~ 1 金属）
- [ ] **roughness**（光滑 ~ 粗糙）
- [ ] **envMap / envMapIntensity**：环境反射
- [ ] 环境贴图作为 **IBL 照明**（不只是“贴纸”）
- [ ] 环境贴图与**自发光/场景亮感**关系
- [ ] **clearcoat / clearcoatRoughness** 清漆层（车漆等）
- [ ] GUI 调 PBR 参数

---

## ThreeJS · 08 渲染器和前端 UI 页面

**章节目标**：渲染画布与页面布局联动；画布导出。

### 概念清单

- [ ] 渲染器尺寸与 **window / 布局区域** 对齐
- [ ] **`setPixelRatio(devicePixelRatio)`** 防模糊
- [ ] **`preserveDrawingBuffer`** 以便截图
- [ ] **canvas 导出 PNG**（`toDataURL`）
- [ ] 页面 UI（按钮等）与 3D 场景交互

---

## ThreeJS · 09 生成曲线和几何体

**章节目标**：从数学曲线采样到管道/拉伸/Shape 成型。

### 01 生成圆弧顶点

- [ ] 三角函数离散圆/弧顶点
- [ ] 单位圆理解 cos/sin

### 02 setFromPoints

- [ ] **`BufferGeometry.setFromPoints`**：点列 → 线/几何
- [ ] Vector3 高层写法 vs 直接写顶点数组

### 03 Curve

- [ ] **EllipseCurve / ArcCurve** 参数含义
- [ ] **CatmullRomCurve3** 等样条：控制点 ≠ 曲线点
- [ ] **`getPoints(n)`**：曲线采样 → 可渲染折线
- [ ] **组合曲线** CurvePath
- [ ] **贝塞尔** + **TubeGeometry** 管道
- [ ] 轮廓线；**ExtrudeGeometry** 拉伸
- [ ] **扫描成型**（沿路径扫掠）
- [ ] **Shape**：平面轮廓、结合 arc、**孔洞 holes**
- [ ] 边材质模型；**顶点颜色**；渐变曲线

---

## ThreeJS · 10 相机和投影

**章节目标**：透视/正交差异；包围盒适配；漫游与控件限制。

### 概念清单

- [ ] **OrthographicCamera**：视景体盒子；尺寸不随距离变化
- [ ] 正交参数 `left/right/top/bottom`（如 `s`）与远近感
- [ ] **PerspectiveCamera** 回顾；遮挡与近远裁剪
- [ ] **canvas resize**：更新相机与 renderer
- [ ] **Box3 包围盒**：`setFromObject`、size、center
- [ ] 用包围盒匹配正交范围 / 相机距离（地图案例）
- [ ] 相机**圆周运动** + 每帧 `lookAt`
- [ ] **管道漫游**：路径采样 → Tube → 沿点移动相机并朝向下一点
- [ ] **OrbitControls** 旋转角/缩放距离限制
- [ ] 投影视图相关练习（`05_投影视图`）

---

## ThreeJS · 11 光源与阴影

**章节目标**：聚光灯特性；阴影三件套；工厂场景阴影落地。

### 概念清单

- [ ] **SpotLight**：锥形照射、衰减、与平行光区别
- [ ] 影响聚光亮度的因素（距离、angle、penumbra、intensity）
- [ ] **阴影三要素**：renderer.shadowMap.enabled；光 `castShadow`；物体 cast/receive
- [ ] 接收阴影的平面/地面为何常见
- [ ] **阴影相机**范围（light.shadow.camera）防裁切
- [ ] 更新投影矩阵；阴影 mapSize 清晰度
- [ ] **VSMShadowMap** 等阴影类型差异（工厂案例）
- [ ] glTF 模型遍历开阴影；按包围盒设阴影范围

---

## ThreeJS · 12 精灵模型

**章节目标**：广告牌 Sprite；场景标注与粒子式雨雪思路。

### 概念清单

- [ ] **Sprite + SpriteMaterial**：始终朝向相机（billboard）
- [ ] 与 Mesh 的区别（无“侧面”）
- [ ] 正投影下填充/铺满思路
- [ ] 精灵贴图做**场景标注**
- [ ] 大量精灵模拟雨雪：顶点少、无复杂光照的性能优势

---

## ThreeJS · 13 后期处理

**章节目标**：EffectComposer 通道管线；描边/发光/故障与抗锯齿。

### 概念清单

- [ ] **正常渲染 vs 后处理**：先画到缓冲再过 Pass
- [ ] **EffectComposer** + **RenderPass**
- [ ] **OutlinePass** 描边高亮
- [ ] **UnrealBloomPass** 泛光
- [ ] **GlitchPass** 故障风
- [ ] **OutputPass** 伽马/输出校正
- [ ] **FXAA**（ShaderPass）抗锯齿；与 SMAA 对比
- [ ] **devicePixelRatio** 与 Pass 分辨率设置
- [ ] glTF 工厂模型选中描边实战

---

## ThreeJS · 14 射线拾取模型

**章节目标**：从屏幕点击到选中 3D 物体；处理层级拾取。

### 概念清单

- [ ] **Ray**：原点 + 方向；方向需 **normalize**
- [ ] **Raycaster**：`intersectObject(s)` 交点、距离排序
- [ ] **屏幕坐标 → NDC**：`x = (px/w)*2-1`，`y = -(py/h)*2+1`
- [ ] **`setFromCamera(ndc, camera)`**：由相机反推射线
- [ ] 鼠标单击选中；改材质/描边反馈
- [ ] **层级拾取**：打中的是子 Mesh；向上找父 Group / 业务根节点
- [ ] 与场景标注结合的选中展示

---

## ThreeJS · 15 场景标注标签信息

**章节目标**：HTML/Canvas 标签锚定 3D 位置；CSS2D vs CSS3D。

### 概念清单

- [ ] 世界坐标 → 屏幕坐标的手动投影思路
- [ ] **CSS2DRenderer + CSS2DObject**：HTML 标签跟随物体，近似恒定屏幕尺寸
- [ ] **本地坐标 vs 世界坐标**：标签要用 `getWorldPosition`
- [ ] 标签位置同步方法；父级位移对本地坐标的影响
- [ ] 工厂设备坐标处理（节点世界坐标贴标签）
- [ ] **CSS3DRenderer + CSS3DObject**：标签参与 3D 透视/旋转
- [ ] CSS2D vs CSS3D 选用场景
- [ ] **批量标注**
- [ ] **Canvas 2D 绘字 → Texture** 做 Sprite/平面标签

---

## ThreeJS · 16 关键帧动画

**章节目标**：Three 动画系统全链路；变形/骨骼；Tween 与缓动。

### 01 关键帧数据

- [ ] **KeyframeTrack**：name / times / values
- [ ] **AnimationClip**：多轨道合成
- [ ] **AnimationMixer**：绑定根对象
- [ ] **AnimationAction**：play / stop / reset / setLoop
- [ ] 渲染循环 `mixer.update(delta)`
- [ ] 时间缩放、循环模式、颜色关键帧等控制技巧

### 02 解析外部动画

- [ ] 读取 `gltf.animations`
- [ ] mixer 绑定 group；多 clip 选择（animIndex）
- [ ] clip 与 mixer 解耦；混合 / crossFade 概念

### 03 机械装配动画

- [ ] 装配过程分步动画思路（位移/显隐等）

### 04 变形动画（Morph）

- [ ] **morphAttributes** 目标顶点集
- [ ] **morphTargetInfluences** 权重插值
- [ ] 顶点一一对应；鸟模型等实例

### 05 骨骼动画

- [ ] **SkinnedMesh**；骨骼默认不可见
- [ ] **SkeletonHelper** 可视化骨架
- [ ] 外部骨骼模型；关节点控制
- [ ] **action.weight** 多动画混合；手动 crossfade

### 06 Tween.js

- [ ] Tween 链式动画；`onUpdate`
- [ ] 相机/物体插值贴近目标
- [ ] 与 **OrbitControls.target** 同步更新
- [ ] 工厂环绕动画；渲染循环 `TWEEN.update()`

### 07 Easing 缓动

- [ ] 线性 vs 缓动曲线
- [ ] Quadratic / Cubic / Elastic / Bounce
- [ ] In / Out / InOut 含义与选用

---

## ThreeJS · 17 cannon-es 物理

**章节目标**：物理世界与渲染同步；碰撞、材质、音效。

### 概念清单

- [ ] **World ≈ 物理版 Scene**；`world.step(dt)`
- [ ] **Body / Shape / Material / ContactMaterial**
- [ ] 重力、质量、速度
- [ ] **Restitution** 弹性；**Friction** 摩擦
- [ ] **同步**：每帧 `mesh.position/quaternion.copy(body.*)`
- [ ] Cannon 旋转多用四元数 vs Three Euler 的差异
- [ ] 落体 → 碰撞场景 → 碰撞音效 → 多物体真实碰撞
- [ ] 碰撞检测由引擎自动完成，业务只读事件/同步位姿

### 对应练习文件

| 文件 | 练什么 |
|------|--------|
| `01_cannon物体世界` | World / Body 基础 |
| `02_cannon碰撞场景` | 地面与碰撞 |
| `03_cannon碰撞音效` | 碰撞事件驱动声音 |
| `04_cannon真实物体碰撞` | 多物体同步 |

---

## ThreeJS · 18 粮仓基地（综合项目）

**章节目标**：把前序能力组合成可交互业务场景。

### 综合运用概念

- [ ] glTF 场景加载；`getObjectByName` 换地面/道路材质
- [ ] 纹理 repeat / wrapping
- [ ] 环境光 + 平行光阴影 + **HDR（RGBELoader）**
- [ ] **FogExp2** 氛围雾
- [ ] 粮仓 Mesh **材质 clone**；收集业务数组
- [ ] **CSS2D 标签** + 世界坐标锚定
- [ ] **射线选中**粮仓 + 面板数据（mock messageData）
- [ ] 后期处理选中描边（`choose.js` / composer）
- [ ] **卡车路径动画**（truckAnimation）
- [ ] **火焰特效**（flame）启停
- [ ] UI 信息面板与 3D 拾取联动

---

# 第三部分：特殊案例讲解

## CameraPig（CameraRig）

- [ ] CameraRig ≠ 模型，是**相机跟随控制器**
- [ ] 根据指针位置算相机目标偏移
- [ ] **平滑阻尼**（如 `damp3` / 插值）避免抖动
- [ ] `delta` 与帧率无关的平滑
- [ ] R3F `useFrame(state)` 与原生 render 循环对照

## LED 闪烁

- [ ] 用 **`sin(time)`** 得到周期波
- [ ] 映射到 0/1 或亮度实现闪烁
- [ ] 时间系数控制快慢（如乘大常数加快频率）

---

# 进度速查表

| 模块 | 章节 | 核心产出 | 进度 |
|------|------|----------|------|
| Math | 01 坐标系与三角函数 | 弧度、Vector3、方向运动 | ☐ |
| Math | 02 位移和加速度 | 匀速 / 重力 | ☐ |
| Math | 03 点乘叉乘 | 夹角、左右、法线、面积 | ☐ |
| Math | 04 欧拉角与四元数 | 姿态旋转 | ☐ |
| Math | 05 Matrix4 | 矩阵变换 | ☐ |
| ThreeJS | 01 快速入门 | 场景三要素 + 循环 + GUI | ☐ |
| ThreeJS | 02 顶点模型 | BufferGeometry / 点线法线 | ☐ |
| ThreeJS | 03 模型与材质 | 变换与材质属性 | ☐ |
| ThreeJS | 04 层级模型 | Group / 世界坐标 | ☐ |
| ThreeJS | 05 UV 与纹理 | 贴图、偏移、雾 | ☐ |
| ThreeJS | 06 glTF | 加载、节点、色彩空间 | ☐ |
| ThreeJS | 07 PBR | 金属粗糙度、IBL、清漆 | ☐ |
| ThreeJS | 08 渲染器与 UI | 布局、截图 | ☐ |
| ThreeJS | 09 曲线与几何 | Curve / Shape / 管道拉伸 | ☐ |
| ThreeJS | 10 相机与投影 | 正交、包围盒、漫游 | ☐ |
| ThreeJS | 11 光源与阴影 | 聚光、阴影三件套 | ☐ |
| ThreeJS | 12 精灵 | Billboard 标注 | ☐ |
| ThreeJS | 13 后期处理 | Composer 通道 | ☐ |
| ThreeJS | 14 射线拾取 | Raycaster 选中 | ☐ |
| ThreeJS | 15 场景标注 | CSS2D/3D、Canvas 标签 | ☐ |
| ThreeJS | 16 关键帧动画 | Mixer / Morph / 骨骼 / Tween | ☐ |
| ThreeJS | 17 cannon-es | 物理同步与碰撞 | ☐ |
| ThreeJS | 18 粮仓基地 | 综合业务场景 | ☐ |
| 专题 | CameraRig / LED | 平滑相机、sin 闪烁 | ☐ |

---

# 能力地图（学完应能回答）

1. **数学**：如何用向量表示速度？如何判断物体在角色左/右/前？欧拉角与四元数何时用哪个？Matrix4 里平移存在哪几个下标？
2. **渲染基础**：Scene–Camera–Renderer 循环如何转起来？BufferGeometry 为何比旧 Geometry 快？
3. **资源与材质**：glTF 加载后如何安全改材质？PBR 金属度/粗糙度/环境贴图各自控制什么？
4. **造型**：如何从曲线生成管道、拉伸体、带孔 Shape？
5. **交互**：点击屏幕如何选中模型？标签如何钉在设备世界坐标上？
6. **动画与物理**：KeyframeTrack→Clip→Mixer→Action 链路？物理 Body 如何与 Mesh 同步？
7. **综合**：粮仓项目里选中、标签、后期、车辆与特效如何串在一起？
