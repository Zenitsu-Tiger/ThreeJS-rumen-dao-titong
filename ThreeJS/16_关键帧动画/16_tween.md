# 第 16 章收官速通：变形动画、骨骼混合与 Tween 镜头切换

本笔记按「**多节合并速通模式**」整合 `04_变形动画的基本原理`、`05_骨骼关节的动画效果`、`06_动画库tweenjs` 与 `07_镜像（镜头）切换动画缓动效果`（缺失的 `03_机械装配动画` 与 `02_解析外部模型动画` 原理完全相同，只需加载 `.glb` 后用 `AnimationMixer` 播放即可）。

> **原笔记代码排查结论**：你原有的 4 份笔记原理讲得很清晰，但在实战代码层面存在 **3 处高频隐患**，本速通笔记已直接给出修复写法：
>
> 1. **05 节手动权重过渡竞态坑**：500ms 过渡未结束时连点按钮，旧的 `requestAnimationFrame` 未取消，会导致多循环抢写 `weight`；
>
> 2. **06 节二次切镜头视角瞬跳坑**：镜头飞向设备时把起始观察点写死为 `tx: 0, ty: 0, tz: 0`，从设备 A 切去设备 B 时画面会先猛甩回原点；
>
> 3. **06 节与 `OrbitControls` 抢控制权 + 连点抖动坑**：启用阻尼时 `controls.update()` 会覆盖 `camera.lookAt()`，且连点未停止旧 Tween 会导致相机剧烈抖动。

## 路线图（重要程度一眼分清）

| 模块 | 实战重要度 | 你只需要记住什么 | 
| ----- | ----- | ----- | 
| **1. 变形动画（Morph Targets）** | 🟡 了解原理 + 会调外部模型权重 | 用 `morphTargetDictionary` 查名字，改 `morphTargetInfluences[i]`（**跳过手写几何体变形**） | 
| **2. 骨骼动画（SkinnedMesh & 权重混合）** | 🔴 实战高频（动作切换） | 理解「皮肤 + 不可见骨架」，掌握多动作 `weight` 切换与防连点过渡 | 
| **3. Tween.js 补间与镜头飞行** | 🔴 实战最高频（项目必用） | 掌握「位置 + 观察点双插值」、同步 `OrbitControls.target` 与 `TWEEN.update()` | 
| **4. Easing 缓动曲线** | 🔴 实战高频（手感决定体验） | 记住 `Out`（减速停稳）/ `In`（加速离开）/ `InOut`（启停过渡）选型口诀 | 

## 1. 变形动画（Morph Targets）：表情与体形渐变

**一句话结论** 变形动画通过在「基础形状」与「目标形状」的**对应顶点**之间按权重做线性插值，实现平滑形变；实际项目由美术在 Blender 做好形态键（Shape Keys）导出，前端只需调权重。

### 📦 先给带变形目标的模型拆箱

当你用 `GLTFLoader` 加载 `./人.glb` 拿到人物网格 `mesh` 时，与变形相关的三个核心属性长这样：

```
// 加载「人.glb」后，网格 mesh 内部与变形相关的核心数据结构（示意）
mesh = Mesh {
  // 1. 顶点目的地（几何体层）：存储每个变形目标的顶点坐标数据（了解即可，一般不用手改）
  geometry: BufferGeometry {
    attributes: { position: BufferAttribute /* 基础形状的 N 个顶点 */ },
    morphAttributes: {
      position: [
        BufferAttribute, // 索引 0：变胖的 N 个顶点
        BufferAttribute, // 索引 1：丰乳肥臀的 N 个顶点
        BufferAttribute, // 索引 2：增肌的 N 个顶点
        BufferAttribute, // 索引 3：年龄的 N 个顶点
        BufferAttribute, // 索引 4：变瘦的 N 个顶点
      ]
    }
  },

  // 2. 名称 → 索引字典（🟢 实战推荐）：建模师在 Blender 里起的名字
  morphTargetDictionary: {
    "变胖": 0,
    "丰乳肥臀": 1,
    "增肌": 2,
    "年龄": 3,
    "变瘦": 4
  },

  // 3. 权重开关数组（🔴 实战高频）：0 表示不变形，1 表示 100% 变成该目标形态
  morphTargetInfluences: [0, 0, 0, 0, 0]
};

```

### 🔴 实战高频：按名称安全驱动外部模型变形

**关键参数先看清**

* `mesh.morphTargetDictionary`：对象字典，键为形态名称，值为数组下标。

* `mesh.morphTargetInfluences[index]`：范围通常为 $0 \sim 1$，可同时对多个目标赋权叠加（如同时「增肌 0.6」+「年龄 0.3」）。

**正反例对比**

```
// ✅ 正例：直接遍历 morphTargetDictionary，不依赖脆弱的下标顺序
const dict = mesh.morphTargetDictionary;
if (dict) {
  // Object.entries(dict) 会把对象转成 [["变胖", 0], ["丰乳肥臀", 1], ...]
  Object.entries(dict).forEach(([name, index]) => {
    gui
      .add(mesh.morphTargetInfluences, index, 0, 1) // 直接绑定数组对应下标
      .name(name);
  });
}

// ❌ 反例（原笔记硬编码顺序）：
// const nameArr = ['变胖', '丰乳肥臀', '增肌', '年龄', '变瘦'];
// 风险：建模师重新导出模型时只要调换了形态键顺序，前端滑块名称和变形效果就会全部错位！

```

### ⚪ 了解即可：底层原理与手写变形的前提

* **核心约束**：基础几何体与所有变形目标的**顶点数量和拓扑结构必须完全一致**（例如默认 `BoxGeometry` 都是 24 个顶点），GPU 才能一一对应插值。

* **插值公式**：当第 $i$ 个变形目标权重为 $w_i$ 时（默认绝对坐标模式）：
  

  $$
  \text{最终顶点位置} = P_{\text{基础}} + \sum_{i} w_i \cdot (P_{\text{目标 } i} - P_{\text{基础}})
  $$

  
  （注：`.glb` 外部模型内部通常直接存储差值 $\Delta P = P_{\text{目标}} - P_{\text{基础}}$，`GLTFLoader` 会自动将 `geometry.morphTargetsRelative` 设为 `true`，公式简化为 $P_{\text{基础}} + \sum w_i \cdot \Delta P_i$，GPU 自动完成计算。）

**坑** 试图拿一个球体（`SphereGeometry`）去当立方体（`BoxGeometry`）的变形目标会直接失效或画面撕裂，因为两者的顶点数和排列顺序完全不同。

## 2. 骨骼动画（SkinnedMesh）与多动作平滑切换

**一句话结论** 骨骼模型由「可见皮肤（`SkinnedMesh`）」和「不可见骨架（`Bone` 树）」组成；实战中极少手动拧关节，核心技能是用 **`action.weight`（权重）** 在待机/行走/奔跑之间平滑切换。

### 📦 先给骨骼模型拆箱

```
// 加载「士兵.glb」后的层级结构（示意）
gltf.scene (Group)
 ├── Bone_Root（不可见，无 Geometry/Material，只存位置/旋转/缩放矩阵）
 │    └── Bone_Spine
 │         ├── Bone_Arm_L
 │         └── Bone_Arm_R
 └── SkinnedMesh {           // 可见皮肤网格（每个顶点绑定了受哪些 Bone 影响及权重）
       name: "身体",
       skeleton: Skeleton {
         bones: [Bone_Root, Bone_Spine, Bone_Arm_L, Bone_Arm_R, ...]
       }
     }

```

* **为什么骨架默认看不见？** `THREE.Bone` 只是纯数据节点（无几何体、无材质），像木偶内部的隐形关节；调试时用 `const helper = new THREE.SkeletonHelper(gltf.scene); scene.add(helper);` 即可把骨架画成实时同步的彩线。

### 🔴 实战高频：多动作权重（`weight`）切换与防连点平滑过渡

**核心机制**：让 `Idle`、`Walk`、`Run` 三个 `AnimationAction` **全部处于 `.play()` 状态**，通过调整各自的 `.weight`（$0 \sim 1$）决定谁生效。`AnimationMixer` 每帧会按权重对所有播放中的动作做加权混合。

**两种靠谱的平滑切换写法（修复了原笔记连点竞态 Bug）**

```
// 前置准备：全部 play，但初始只有 Idle 权重为 1
const idleAction = mixer.clipAction(gltf.animations[0]);
const runAction  = mixer.clipAction(gltf.animations[1]);
const walkAction = mixer.clipAction(gltf.animations[3]);

[idleAction, runAction, walkAction].forEach((act) => {
  act.play();
  act.setEffectiveWeight(0);
});
idleAction.setEffectiveWeight(1);
let currentAction = idleAction;

```

#### 方案 A：使用 Three.js 内置 `crossFadeTo`（最简洁，推荐日常使用）

```
function switchActionBuiltIn(toAction, duration = 0.5) {
  if (toAction === currentAction) return;

  // ✅ 关键防坑 3 步：确保目标动作处于启用、从头/满权就绪状态，否则二次切回容易无反应
  toAction.enabled = true;
  toAction.setEffectiveTimeScale(1);
  toAction.setEffectiveWeight(1);
  toAction.play();

  // 第 3 参数 warp = true 会自动同步不同时长动作的步频节奏
  currentAction.crossFadeTo(toAction, duration, true);
  currentAction = toAction;
}

```

#### 方案 B：手动权重插值（修复原笔记「快速连点竞态」Bug）

```
let transitionRafId = null; // 🔑 关键修复：记录当前过渡循环 ID

function switchActionManual(toAction, duration = 500) {
  if (toAction === currentAction) return;

  // 🔑 修复 1：如果上一次 500ms 过渡还没跑完就又点了按钮，先立刻终止旧循环！
  if (transitionRafId !== null) {
    cancelAnimationFrame(transitionRafId);
    transitionRafId = null;
  }

  // 🔑 修复 2：记录所有动作当前瞬间的起始权重（防止半途切回时权重突变跳帧）
  const allActions = [idleAction, runAction, walkAction];
  const startWeights = allActions.map((act) => act.weight);
  const startTime = performance.now();
  currentAction = toAction;

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1);

    allActions.forEach((act, idx) => {
      const targetWeight = act === toAction ? 1 : 0;
      // 从各自当前权重平滑插值到 0 或 1
      act.weight = startWeights[idx] + (targetWeight - startWeights[idx]) * progress;
    });

    if (progress < 1) {
      transitionRafId = requestAnimationFrame(animate);
    } else {
      transitionRafId = null;
    }
  }

  transitionRafId = requestAnimationFrame(animate);
}

```

**坑（原笔记隐患）** 如果在 500ms 过渡到一半时快速连点另一个按钮，未调用 `cancelAnimationFrame` 会让两个 `animate` 循环同时争夺并覆写同一个 `action.weight`，导致角色动作鬼畜或最终权重无法归零。

## 3. Tween.js 补间动画与工业级镜头飞行（🔴 实战最高频）

**一句话结论** 关键帧动画适合“模型自己演预设剧本”，而 **Tween.js** 适合“响应用户点击，把任意 JS 对象的数值（相机位置、观察目标、材质透明度）在指定时间内丝滑过渡到目标值”。

> **版本小提示**：传统教程多直接调用全局 `TWEEN.update()`；在较新版本的 `@tweenjs/tween.js`（v21+）中官方推荐创建 `const tweenGroup = new TWEEN.Group()`，新建动画时传第二参数 `new TWEEN.Tween(obj, tweenGroup)`，渲染循环里调 `tweenGroup.update()`。无论哪种版本，核心 API 链完全一致。

### 📦 先给双插值对象 `obj` 拆箱

为什么要把相机位置 `(x, y, z)` 和观察目标 `(tx, ty, tz)` 塞进**同一个普通对象**交给 `TWEEN.Tween`？

```
// 起点对象（传入 new TWEEN.Tween(...)）
const state = {
  x: camera.position.x, y: camera.position.y, z: camera.position.z, // 相机当前在哪
  tx: controls.target.x, ty: controls.target.y, tz: controls.target.z // 相机当前正盯着哪
};

// 终点对象（传入 .to(..., 2000)）
const targetState = {
  x: endPos.x, y: endPos.y, z: endPos.z,
  tx: lookAtPos.x, ty: lookAtPos.y, tz: lookAtPos.z
};

// 动画跑了一半（progress = 0.5）时，onUpdate((obj) => ...) 收到的 obj 就是被 Tween 实时改写后的 state：
// obj.x  = 起点x + (终点x - 起点x) * 缓动进度
// obj.tx = 起点tx + (终点tx - 起点tx) * 缓动进度

```

这样**一个 Tween 就能同时同步驱动相机移动和视角转向**，不会出现位置到了、镜头还没转过来的割裂感。

### ✅ 正例 vs ❌ 反例：修复原笔记中的 3 个经典镜头坑

```
// ❌ 原笔记中的 3 处隐患写法：
new TWEEN.Tween({
  x: camera.position.x, y: camera.position.y, z: camera.position.z,
  tx: 0, ty: 0, tz: 0 // ❌ 坑 1：写死从原点看起！从设备A切设备B时，第一帧画面会猛地甩回原点
})
.to({ x: pos2.x, y: pos2.y, z: pos2.z, tx: pos.x, ty: pos.y, tz: pos.z }, 2000)
.onUpdate((obj) => {
  camera.position.set(obj.x, obj.y, obj.z);
  camera.lookAt(obj.tx, obj.ty, obj.tz);
  // ❌ 坑 2：没同步 controls.target！若渲染循环开着 controls.update()，下一毫秒控制器就会把镜头掰回旧目标
})
.start();
// ❌ 坑 3：没有 stop() 上一次未完成的 Tween，用户连点按钮 A 和 B 时画面疯狂抽搐

```

### 🏆 直接可抄的「工业级镜头飞行函数」

```
import * as TWEEN from "@tweenjs/tween.js";

let activeCameraTween = null; // 记录当前正在飞行的动画，用于防连点冲突

/**
 * 平滑将相机飞向目标观察点
 * @param {THREE.Vector3} targetPos 想要盯住的目标世界坐标（如设备标注点）
 * @param {THREE.Vector3} offset    相机相对目标点的停靠偏移量（默认右上方 30 单位）
 * @param {number} duration         飞行耗时（毫秒）
 */
function flyToTarget(
  targetPos,
  offset = new THREE.Vector3(30, 30, 30),
  duration = 1500
) {
  // 1. 停止尚未结束的旧镜头动画，避免连点打架
  if (activeCameraTween) {
    activeCameraTween.stop();
  }

  // 2. 算出终点相机位置（clone 防止改坏原始 targetPos）
  const endCamPos = targetPos.clone().add(offset);

  // 3. 起点动态取「当前相机位置」和「当前 controls.target」，彻底杜绝视角瞬跳
  const state = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    tx: controls.target.x,
    ty: controls.target.y,
    tz: controls.target.z,
  };

  activeCameraTween = new TWEEN.Tween(state)
    .to(
      {
        x: endCamPos.x,
        y: endCamPos.y,
        z: endCamPos.z,
        tx: targetPos.x,
        ty: targetPos.y,
        tz: targetPos.z,
      },
      duration
    )
    .easing(TWEEN.Easing.Quadratic.Out) // 先快后慢，停靠稳重
    .onStart(() => {
      controls.enabled = false; // 飞行期间禁止鼠标抢夺镜头
    })
    .onUpdate((obj) => {
      camera.position.set(obj.x, obj.y, obj.z);
      // 🔑 同时更新 controls.target，兼容渲染循环里的 controls.update()
      controls.target.set(obj.tx, obj.ty, obj.tz);
      camera.lookAt(obj.tx, obj.ty, obj.tz);
    })
    .onComplete(() => {
      controls.enabled = true;
      controls.update();
      activeCameraTween = null;
    })
    .start();
}

// 4. 别忘了在渲染循环里每帧驱动 Tween！
function render() {
  TWEEN.update();       // 🔑 漏写这行，所有 Tween 动画一动不动
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

```

**调用示例（点击设备 A / 恢复全局）**

```
// 飞向设备 A
document.getElementById("A").addEventListener("click", () => {
  const pos = new THREE.Vector3();
  group.getObjectByName("设备A标注").getWorldPosition(pos);
  flyToTarget(pos, new THREE.Vector3(30, 30, 30), 2000);
});

// 恢复全局俯瞰视角
document.getElementById("all").addEventListener("click", () => {
  flyToTarget(new THREE.Vector3(0, 0, 0), new THREE.Vector3(200, 200, 200), 2000);
});

```

## 4. Easing 缓动曲线选型口诀（告别机械匀速感）

**一句话结论** 线性匀速（`Linear`）启动和刹停都很僵硬；给补间挂上 `.easing(TWEEN.Easing.曲线.方向)` 可以模拟真实物理惯性，瞬间拉升 3D 交互质感。

### 1. 先选方向：`In` / `Out` / `InOut`（最关键）

| 方向 | 速度变化 | 类比 | 典型实战场景 | 
| ----- | ----- | ----- | ----- | 
| **`.Out`**（最常用） | 快 $\rightarrow$ 慢（减速刹车） | 飞船平稳着陆 | 镜头飞近目标、弹窗弹出、按钮反馈 | 
| **`.In`** | 慢 $\rightarrow$ 快（加速离开） | 汽车起步加速 | 物体加速飞离视野、重物自由下落 | 
| **`.InOut`** | 慢 $\rightarrow$ 快 $\rightarrow$ 慢 | 高铁出站到进站 | 两台设备之间的镜头平顺穿梭、巡检漫游 | 

### 2. 再选曲线性格

* **`Quadratic`（二次方） / `Cubic`（三次方）**：最百搭的自然加减速。以 `Quadratic.Out` 为例，进度函数为：
  

  $$
  y = 1 - (1 - x)^2
  $$

  
  当时间走到 $x = 0.5$（一半时间）时，路程已经走了 $y = 1 - 0.5^2 = 0.75$（$75\%$），后半程用剩下的一半时间优雅刹停；`Cubic.Out` 对应 $y = 1 - (1 - x)^3$，刹停感更强。

* **`Back.Out`**：冲过头一点再轻轻回弹停稳，做 UI 卡片弹出极有弹性。

* **`Elastic.Out` / `Bounce.Out`**：橡皮筋震荡 / 小球落地反弹，适合趣味或游戏向效果（工业数字孪生慎用）。

> **现代项目迁移提示**：工业级前端项目现在也大量使用 **GSAP**（`gsap.to(camera.position, { x: 30, duration: 1.5, ease: "power2.out" })`）。它和 Tween.js 的思想 **100% 互通**——你现在掌握的「双对象插值 + 同步 `controls.target` + 缓动方向选择」，换到 GSAP 上完全零学习成本！

## 第 16 章收官速记总表

| 动画类型 | 适用场景 | 核心 API / 关键一行 | 最大避坑点 | 
| ----- | ----- | ----- | ----- | 
| **变形动画** | 面部表情、体型变化 | `mesh.morphTargetDictionary` + `mesh.morphTargetInfluences[i]` | 别硬编码下标顺序；所有变形目标顶点数必须一致 | 
| **骨骼动画** | 人物/动物动作切换 | `action.weight`、`crossFadeTo()`、`SkeletonHelper` | 手动 `rAF` 过渡连点前必须 `cancelAnimationFrame` | 
| **Tween 补间** | 按钮切镜头、UI 驱动属性 | `new TWEEN.Tween(state).to(..., ms).onUpdate(...).start()` + `TWEEN.update()` | 起点 `tx/ty/tz` 必须读 `controls.target`；连点前先 `stop()` 旧 Tween | 
| **Easing 缓动** | 消除匀速机械感 | `.easing(TWEEN.Easing.Quadratic.Out)` | 到达用 `.Out`，离开用 `.In`，点对点穿梭用 `.InOut` | 

## 自测

1. 加载带形态键的人物 `.glb` 时，为什么推荐通过 `mesh.morphTargetDictionary` 而不是自己手写 `nameArr = ['变胖', ...]` 来绑定滑块？

2. 为什么场景里明明加载了带骨骼的角色模型，画面上却看不到骨架？想调试查看骨架该用什么工具？

3. 在用 Tween.js 做「点击按钮 A 飞向设备 A，再点击按钮 B 飞向设备 B」时，如果起点的观察目标写死为 `tx: 0, ty: 0, tz: 0`，从 A 切到 B 时画面会出现什么异常？怎么改？

4. 在镜头飞行动画中，如果只写 `camera.lookAt(obj.tx, obj.ty, obj.tz)`，既不更新 `controls.target` 也没在 `onComplete` 同步它，动画结束后用户拖动鼠标旋转视角会发生什么？


1. 手写 `nameArr` 强依赖建模软件导出时的顺序，一旦美术调整形态键顺序就会全部错位；`mesh.morphTargetDictionary` 自带「名称 → 索引」映射，更健壮。

2. `THREE.Bone` 只是存储变换矩阵的数据节点，没有 `Geometry` 和 `Material`，所以默认不可见。调试时可用 `new THREE.SkeletonHelper(gltf.scene)` 将骨架可视化并实时同步。

3. 相机在 A 处正盯着设备 A，点击 B 的第一帧 `obj.tx/ty/tz` 会突然跳回 `(0, 0, 0)`，导致镜头先猛甩回场景原点再慢慢转向 B。正确做法是起点读取当前的 `controls.target.x / y / z`。

4. `OrbitControls` 的旋转中心 `controls.target` 仍停留在旧位置（如原点），用户一拖鼠标，相机会瞬间绕着旧中心甩开，脱离当前选中的目标设备。