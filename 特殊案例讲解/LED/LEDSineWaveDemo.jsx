import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// LED球体组件
function LED({ position, randValue, showLabel }) {
  const meshRef = useRef();
  const [currentState, setCurrentState] = useState({ t: 0, sinValue: 0 });

  useFrame((state) => {
    if (!meshRef.current) return;

    // 🎯 核心算法（和你的代码一模一样）
    const rand = randValue;
    const baseFreq = rand * 10000;
    const timePhase = state.clock.elapsedTime * rand;
    const sinValue = Math.sin(baseFreq + timePhase);
    const normalized = (1 + sinValue) / 2;
    const t = Math.round(normalized);

    // 应用颜色
    meshRef.current.material.color.setRGB(0, t * 1.1, t);
    
    // 更新状态用于显示
    setCurrentState({ t, sinValue: sinValue.toFixed(3) });
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial toneMapped={false} />
      </mesh>
      
      {showLabel && (
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
        >
          {`rand=${randValue.toFixed(2)}`}
        </Text>
      )}
      
      {showLabel && (
        <Text
          position={[0, -0.9, 0]}
          fontSize={0.15}
          color={currentState.t === 1 ? '#00ff88' : '#666'}
          anchorX="center"
        >
          {currentState.t === 1 ? 'ON' : 'OFF'}
        </Text>
      )}
    </group>
  );
}

// 波形可视化组件
function SineWaveVisualizer({ randValue }) {
  const [points, setPoints] = useState([]);

  useFrame((state) => {
    const newPoints = [];
    const currentTime = state.clock.elapsedTime;
    const rand = randValue;

    // 生成100个点来绘制波形
    for (let i = 0; i < 100; i++) {
      const x = (i / 100) * 8 - 4; // -4 到 4
      const timeOffset = currentTime * rand;
      const baseFreq = rand * 10000;
      
      // 计算正弦值
      const sinValue = Math.sin(baseFreq + timeOffset + i * 0.5);
      const normalized = (1 + sinValue) / 2;
      
      newPoints.push(new THREE.Vector3(x, normalized * 2 - 1, 0));
    }

    setPoints(newPoints);
  });

  return (
    <group position={[0, 3, 0]}>
      {points.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ffff" linewidth={2} />
        </line>
      )}
      
      <Text position={[0, 1.5, 0]} fontSize={0.3} color="white">
        实时正弦波形
      </Text>
    </group>
  );
}

// 主场景
function LEDScene({ randValues, showWave, showLabels }) {
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.5} />
      
      {/* LED阵列 */}
      <group position={[0, -1, 0]}>
        {randValues.map((rand, index) => (
          <LED
            key={index}
            position={[
              (index - (randValues.length - 1) / 2) * 1.5,
              0,
              0
            ]}
            randValue={rand}
            showLabel={showLabels}
          />
        ))}
      </group>

      {/* 波形可视化 */}
      {showWave && <SineWaveVisualizer randValue={randValues[0]} />}

      {/* 参考网格 */}
      <gridHelper args={[10, 10, '#333', '#222']} position={[0, -2, 0]} />
      
      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  );
}

// 控制面板
function ControlPanel({ randValues, setRandValues, showWave, setShowWave, showLabels, setShowLabels }) {
  return (
    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-6 rounded-xl border border-white/20 text-white w-80 z-10">
      <h3 className="text-xl font-bold mb-4 text-cyan-400">LED 正弦波动画控制器</h3>
      
      {/* LED数量控制 */}
      <div className="mb-4">
        <label className="block text-sm mb-2">LED 数量: {randValues.length}</label>
        <input
          type="range"
          min="1"
          max="8"
          value={randValues.length}
          onChange={(e) => {
            const count = parseInt(e.target.value);
            const newValues = Array.from({ length: count }, (_, i) => 
              Math.abs(2 + (i - count / 2) * 0.5)
            );
            setRandValues(newValues);
          }}
          className="w-full"
        />
      </div>

      {/* 第一个LED的rand值控制 */}
      <div className="mb-4">
        <label className="block text-sm mb-2">
          第一个LED的 rand 值: {randValues[0]?.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={randValues[0] || 1.5}
          onChange={(e) => {
            const newValues = [...randValues];
            newValues[0] = parseFloat(e.target.value);
            setRandValues(newValues);
          }}
          className="w-full"
        />
        <p className="text-xs text-gray-400 mt-1">
          调节频率：rand × 10000 = {(randValues[0] * 10000).toFixed(0)} Hz
        </p>
      </div>

      {/* 显示选项 */}
      <div className="space-y-2 mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showWave}
            onChange={(e) => setShowWave(e.target.checked)}
            className="w-4 h-4"
          />
          <span>显示波形图</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="w-4 h-4"
          />
          <span>显示标签</span>
        </label>
      </div>

      {/* 算法说明 */}
      <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/30">
        <p className="text-xs font-mono leading-relaxed">
          <span className="text-cyan-300">const</span> rand = {randValues[0]?.toFixed(2)}<br/>
          <span className="text-cyan-300">const</span> t = Math.round(<br/>
          &nbsp;&nbsp;(1 + Math.sin(<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;rand × 10000 +<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;time × rand<br/>
          &nbsp;&nbsp;)) / 2<br/>
          )<br/>
          <span className="text-green-300">color.setRGB</span>(0, t×1.1, t)
        </p>
      </div>
    </div>
  );
}

// 数据面板
function DataPanel() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      const rand = 1.5;
      const baseFreq = rand * 10000;
      const sinValue = Math.sin(baseFreq + time * rand);
      const normalized = (1 + sinValue) / 2;
      const t = Math.round(normalized);

      setData(prev => {
        const newData = [...prev, {
          time: time % 10,
          sin: sinValue,
          normalized: normalized,
          binary: t
        }].slice(-50); // 保留最近50个数据点
        return newData;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white w-80 z-10">
      <h4 className="text-sm font-bold mb-2 text-cyan-400">实时数值</h4>
      {data.length > 0 && (
        <div className="space-y-1 text-xs font-mono">
          <div className="flex justify-between">
            <span>sin(x):</span>
            <span className="text-yellow-300">{data[data.length - 1].sin.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>归一化:</span>
            <span className="text-blue-300">{data[data.length - 1].normalized.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>二值化:</span>
            <span className={data[data.length - 1].binary === 1 ? 'text-green-300' : 'text-gray-500'}>
              {data[data.length - 1].binary} {data[data.length - 1].binary === 1 ? '🟢 ON' : '⚫ OFF'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// 说明面板
function InfoPanel() {
  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white w-80 z-10">
      <h4 className="text-sm font-bold mb-3 text-cyan-400">工作原理</h4>
      <div className="space-y-2 text-xs leading-relaxed">
        <div className="bg-purple-900/30 p-2 rounded border border-purple-500/30">
          <p className="font-semibold text-purple-300">① 随机偏移</p>
          <p className="text-gray-300">rand = Math.abs(2 + position.x)</p>
          <p className="text-gray-400">让每个LED有不同的闪烁节奏</p>
        </div>
        
        <div className="bg-blue-900/30 p-2 rounded border border-blue-500/30">
          <p className="font-semibold text-blue-300">② 正弦振荡</p>
          <p className="text-gray-300">sin(rand × 10000 + time × rand)</p>
          <p className="text-gray-400">高频振荡产生快速变化</p>
        </div>
        
        <div className="bg-green-900/30 p-2 rounded border border-green-500/30">
          <p className="font-semibold text-green-300">③ 归一化</p>
          <p className="text-gray-300">(1 + sinValue) / 2</p>
          <p className="text-gray-400">从 [-1,1] 转换为 [0,1]</p>
        </div>
        
        <div className="bg-yellow-900/30 p-2 rounded border border-yellow-500/30">
          <p className="font-semibold text-yellow-300">④ 二值化</p>
          <p className="text-gray-300">Math.round(normalized)</p>
          <p className="text-gray-400">得到 0 或 1，形成开关效果</p>
        </div>
      </div>
    </div>
  );
}

// 主组件
export default function LEDSineWaveDemo() {
  const [randValues, setRandValues] = useState([1.59, 2.22, 1.17, 0.79, 0.1]);
  const [showWave, setShowWave] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-black relative">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <LEDScene 
          randValues={randValues} 
          showWave={showWave}
          showLabels={showLabels}
        />
      </Canvas>

      <ControlPanel
        randValues={randValues}
        setRandValues={setRandValues}
        showWave={showWave}
        setShowWave={setShowWave}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />

      <DataPanel />
      <InfoPanel />

      {/* 标题 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <h1 className="text-4xl font-bold text-white/10 text-center">
          LED 正弦波动画原理演示
        </h1>
      </div>
    </div>
  );
}
