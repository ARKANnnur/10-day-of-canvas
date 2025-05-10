import * as THREE from 'https://esm.sh/three@0.160.0';
import { mergeGeometries } from 'https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'https://esm.sh/cannon-es';

// ===== THREE.JS SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cahaya
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // buat gerakan lebih halus
controls.dampingFactor = 0.05;

controls.enableZoom = true; // boleh zoom scroll
controls.enablePan = true; // bisa digeser

controls.minDistance = 5; // zoom minimal
controls.maxDistance = 50; // zoom maksimal
// BAYANGAN
renderer.shadowMap.enabled = true;

// ===== THREE OBJECT: GROUND =====
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const groundMeshThree = new THREE.Mesh(groundGeometry, groundMaterial);
groundMeshThree.rotation.x = -Math.PI / 2;
groundMeshThree.position.y = -2;
groundMeshThree.receiveShadow = true;
scene.add(groundMeshThree);

// ===== THREE OBJECT: SPHERE =====
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const sphereMeshThree = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMeshThree.castShadow = true;
scene.add(sphereMeshThree);

// Buat world Cannon.js
const worldCannon = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});

const groundBodyCannon = new CANNON.Body({
  mass: 0, // statik, tidak bergerak
  shape: new CANNON.Plane(),
  position: new CANNON.Vec3(0, -2, 0),
});
groundBodyCannon.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // rotasi horizontal
worldCannon.addBody(groundBodyCannon);

const sphereBodyCannon = new CANNON.Body({
  mass: 0.5, // Ada massa, berarti akan jatuh
  shape: new CANNON.Sphere(1), // Radius 1
  position: new CANNON.Vec3(0, 10, 15), // Mulai di atas (Y = 10)
  material: new CANNON.Material(),
});
worldCannon.addBody(sphereBodyCannon);

const defaultMaterial = new CANNON.Material();
const bounceMaterial = new CANNON.Material();
bounceMaterial.restitution = 0.8; // nilai antara 0 (tidak pantul) hingga 1 (pantul sempurna)

// Buat contact material antara bola dan lantai
const bounceContactMaterial = new CANNON.ContactMaterial(
  bounceMaterial,
  defaultMaterial,
  {
    restitution: 0.8,
  }
);

worldCannon.addContactMaterial(bounceContactMaterial);

// Set material bola
sphereBodyCannon.material = bounceMaterial;

class Box {
  constructor(x, y, z, size, color) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.color = color;

    this.mesh = this.draw();
    this.body = this.physic();
  }

  draw() {
    const geometry = new THREE.BoxGeometry(
      this.size.w,
      this.size.h,
      this.size.d
    );
    const Material = new THREE.MeshStandardMaterial({ color: this.color });

    const mesh = new THREE.Mesh(geometry, Material);
    mesh.position.set(this.x, this.y, this.z);
    mesh.castShadow = true;

    return mesh;
  }

  physic() {
    // const defaultMaterial = new CANNON.Material();
    const body = new CANNON.Body({
      mass: 0.5,
      position: new CANNON.Vec3(this.x, this.y, this.z),
      shape: new CANNON.Box(
        new CANNON.Vec3(this.size.w / 2, this.size.h / 2, this.size.d / 2)
      ), // setengah ukuran box
      material: Box.material,
    });

    return body;
  }

  updateMeshFromBody() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

Box.material = new CANNON.Material();

let boxes = [];

const blockSize = 2;
const gridY = 3; // 3x3 grid
const gridX = 5; // 3x3 grid
const gridZ = 3; // 3x3 grid

for (let y = 0; y < gridY; y++) {
  for (let x = 0; x < gridX; x++) {
    for (let z = 0; z < gridZ; z++) {
      const posX = (x + -2) * blockSize;
      const posY = -1 + y * blockSize;
      const posZ = (z + -5) * blockSize;

      const box = new Box(posX, posY, posZ, { w: 2, h: 2, d: 2 }, 0xfff432);

      scene.add(box.mesh);
      worldCannon.addBody(box.body);
      boxes.push(box);
    }
  }
}

const spacing = 2;
const levels = 3;

for (let level = 0; level < levels; level++) {
  const gridSize = levels - level; // makin ke atas, ukuran makin kecil
  const yPos = level * spacing;

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const posX = (x + 3 - gridSize / 2) * spacing;
      const posY = yPos;
      const posZ = (z - gridSize / 2) * spacing;

      const box = new Box(posX, posY, posZ, { w: 2, h: 2, d: 2 }, 0x00ff00);

      scene.add(box.mesh);
      worldCannon.addBody(box.body);
      boxes.push(box);
    }
  }
}

const rows = 5;
const cols = 5;
const height = 3;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < rows; x++) {
    for (let z = 0; z < cols; z++) {
      // Random chance to skip some blocks
      if (Math.random() > 0.3) continue;

      const posX = (-5 + -x - rows / 2) * spacing + spacing / 2;
      const posY = y * spacing;
      const posZ = (z - cols / 2) * spacing + spacing / 2;

      const randomColor = Math.random() * 0xffffff;
      const box = new Box(posX, posY, posZ, { w: 2, h: 2, d: 2 }, randomColor);
      scene.add(box.mesh);
      worldCannon.addBody(box.body);
      boxes.push(box);
    }
  }
}

const timeStep = 1 / 120;

function animate() {
  requestAnimationFrame(animate);

  // Step the physics world
  worldCannon.step(timeStep);

  // Sync Three.js sphere position with Cannon.js body
  sphereMeshThree.position.copy(sphereBodyCannon.position);
  sphereMeshThree.quaternion.copy(sphereBodyCannon.quaternion);

  boxes.forEach((box) => {
    box.updateMeshFromBody();
  });

  controls.update();

  renderer.render(scene, camera);
}
animate();

sphereBodyCannon.addEventListener('collide', (event) => {
  const impactVelocity = event.contact.getImpactVelocityAlongNormal();
  console.log(
    'Tabrakan terjadi! Kecepatan tabrakan:',
    impactVelocity.toFixed(2),
    'm/s'
  );

  if (impactVelocity > 1) {
    console.log('Bola mengenai kubus dengan cukup keras!');
  }
});

let balls = [];
let isDragging = false;
let clickStartTime;
let startMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', (event) => {
  isDragging = false;
  clickStartTime = performance.now();

  // Simpan posisi awal mouse
  startMousePosition.x = event.clientX;
  startMousePosition.y = event.clientY;
});

window.addEventListener('mousemove', () => {
  isDragging = true; // Jika ada gerakan, anggap sebagai drag
});

window.addEventListener('mouseup', (event) => {
  const clickDuration = performance.now() - clickStartTime;
  const moveThreshold = 5; // maksimum perpindahan dalam pixel
  const timeThreshold = 300; // maksimal waktu klik dalam ms

  const dx = Math.abs(event.clientX - startMousePosition.x);
  const dy = Math.abs(event.clientY - startMousePosition.y);

  const isClick =
    !isDragging &&
    dx < moveThreshold &&
    dy < moveThreshold &&
    clickDuration < timeThreshold;

  if (isClick) {
    shootSphere(event); // baru tembak kalau ini klik beneran
  }

  isDragging = false; // reset setelah mouse up
});

// window.addEventListener('click', shootSphere);

function shootSphere(event) {
  // Normalisasi koordinat mouse (-1 sampai 1)
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycaster untuk menentukan arah penembakan
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const shootDirection = raycaster.ray.direction; // THREE.Vector3

  // 1. Ambil posisi dan arah
  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);

  const direction = shootDirection.clone().normalize();

  // 2. Buat bola keluar dari depan kamera
  const spawnOffset = direction.clone().multiplyScalar(5); // 5 unit ke depan
  const spawnPosition = cameraPosition.clone().add(spawnOffset);

  // 3. Set posisi bola
  sphereBodyCannon.position.copy(new CANNON.Vec3().copy(spawnPosition));
  sphereBodyCannon.velocity.set(0, 0, 0);
  sphereBodyCannon.angularVelocity.set(0, 0, 0);

  // Konversi direction ke CANNON.Vec3 dan beri gaya
  const cannonDirection = new CANNON.Vec3().copy(direction);
  const forceMagnitude = 15;

  sphereBodyCannon.applyImpulse(
    cannonDirection.scale(forceMagnitude),
    sphereBodyCannon.position
  );
}
