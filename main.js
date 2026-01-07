import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { personas } from './data/personas.js';

// ======================
// CONTENEDOR
// ======================
const container = document.getElementById('three-container');

// ======================
// ESCENA
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f9fb);

// ======================
// CÁMARA PERSPECTIVA
// ======================
const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);

// ======================
// RENDERER
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// ======================
// CONTROLES
// ======================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.zoomSpeed = 0.5;
controls.minDistance = 6;
controls.maxDistance = 30;

// ======================
// LUCES
// ======================
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ======================
// GRUPO ÁRBOL
// ======================
const grupoArbol = new THREE.Group();
grupoArbol.position.x = -1.5;
scene.add(grupoArbol);

// ======================
// RAYCASTER
// ======================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ======================
// UI
// ======================
const panel = document.getElementById('info-panel');
const nombreEl = document.getElementById('info-nombre');
const fechasEl = document.getElementById('info-fechas');
const descripcionEl = document.getElementById('info-descripcion');
const sagaEl = document.getElementById('info-saga');
const cerrarEl = document.getElementById('info-cerrar');

cerrarEl.addEventListener('click', () => {
  panel.style.display = 'none';
});

panel.addEventListener('click', (e) => {
  if (e.target === panel) {
    panel.style.display = 'none';
  }
});

// ======================
// ESTADO
// ======================
let autoRotate = true;

// ======================
// CARGA ÁRBOL
// ======================
const loader = new GLTFLoader();
loader.load(
  './arbol.glb',
  (gltf) => {
    const arbol = gltf.scene;
    grupoArbol.add(arbol);

    const box = new THREE.Box3().setFromObject(arbol);
    const center = box.getCenter(new THREE.Vector3());
    arbol.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 12 / maxDim;
    arbol.scale.setScalar(scale);

    camera.position.set(0, 6, 14);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    console.log('Objetos:', arbol.children.map(child => child.name));

    // CLICK PERSONAS
    window.addEventListener('pointerdown', (event) => {
      if (panel.style.display === 'block' && event.target.closest('#info-panel')) return;

      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(arbol.children, true);

      if (intersects.length === 0) return;

      const objeto = intersects[0].object;
      console.log('Click:', objeto.name);

      let targetObj = objeto;
      while (targetObj && targetObj !== arbol) {
        if (personas[targetObj.name]) {
          mostrarInfo(personas[targetObj.name]);
          return;
        }
        targetObj = targetObj.parent;
      }
      if (personas[objeto.name]) {
        mostrarInfo(personas[objeto.name]);
      }
    });
  }
);

// ======================
// MOSTRAR INFO
// ======================
function mostrarInfo(datos) {
  nombreEl.textContent = datos.nombreCompleto || datos.nombre || 'Sin nombre';
  fechasEl.textContent = datos.periodo || '';
  descripcionEl.textContent = datos.relevancia || datos.descripcion || '';
  sagaEl.textContent = datos.saga ? `Saga: ${datos.saga}` : '';
  panel.style.display = 'block';
  autoRotate = false;
}

// ======================
// ANIMACIÓN
// ======================
function animate() {
  requestAnimationFrame(animate);

  if (autoRotate) {
    grupoArbol.rotation.y += 0.001;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ======================
// RESIZE
// ======================
window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
