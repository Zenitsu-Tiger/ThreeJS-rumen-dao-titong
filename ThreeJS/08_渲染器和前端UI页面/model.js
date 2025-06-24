import * as THREE from 'three';


const geometry = new THREE.BoxGeometry(50, 50, 50);
const material = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);

document.getElementById('red').addEventListener('click', () => {
    mesh.material.color.set(0xff0000);
});
document.getElementById('green').addEventListener('click', () => {
    mesh.material.color.set(0x00ff00); 
});

export default mesh;