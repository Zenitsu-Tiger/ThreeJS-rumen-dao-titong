import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { CSS3DSprite } from 'three/addons/renderers/CSS3DRenderer.js'
const loader=new GLTFLoader()
const group=new THREE.Group()
loader.load('./工厂.glb',(gltf)=>{ 
  console.log(gltf);
  const scene=gltf.scene
  group.add(scene)



  const arr=['设备A','设备B','停车场']
  for(let i=0;i<arr.length;i++){
    const div=document.getElementById('tag').cloneNode()
    div.innerHTML=arr[i]
    const tag=new CSS3DSprite(div)
    div.style.pointerEvents='none'
    // obj对应的是一个专门用于设备上方标注作用创建的空对象
      const obj=scene.getObjectByName(`${arr[i]}标注`)
      obj.add(tag)
  
  
    tag.scale.set(0.1,0.1,1)
    tag.position.y=40/2*0.1
  }

})

export default group