// 引入CSS2模型对象CSS2DObject
import {CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js'


const div=document.getElementById('tag')
div.style.top='-161px'
const tag=new CSS2DObject(div)

export default tag