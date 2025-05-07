import * as THREE from 'https://esm.sh/three@0.160.0';
import { mergeGeometries } from 'https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75, // Field of view (seberapa lebar sudut pandang) ini seperti mata normal
  window.innerWidth / window.innerHeight, // Aspect ratio layar
  0.1, // Near clipping plane (seberapa dekat objek terlihat) di bawah 0.1 maka tidak akan terlihat
  1000 // Far clipping plane (seberapa jauh objek terlihat) jika lebih dari 1000 juga tidak akan terlihat
);
camera.position.z = 10; // Geser kamera menjauh agar bisa melihat objek

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// // Geometry (kotak), Material, dan Mesh
// const geometry = new THREE.BoxGeometry(2, 2, 2);
// const material = new THREE.MeshBasicMaterial({
//   color: 0x00ff00,
//   wireframe: true,
// });
// const cube = new THREE.Mesh(geometry, material);

// // Pindahkan cube di space 3D
// cube.position.set(3, 1, -2);
// scene.add(cube);

// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(2, 32, 32),
//   new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
// );
// scene.add(sphere);
// const cone = new THREE.Mesh(
//   new THREE.ConeGeometry(1, 2, 16),
//   new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })
// );
// cone.position.set(-3, 3, -2);
// scene.add(cone);

// const torus = new THREE.Mesh(
//   new THREE.TorusGeometry(1, 0.4, 16, 100),
//   new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
// );
// torus.position.set(-3, -3, -2);
// scene.add(torus);

// const plane = new THREE.Mesh(
//   new THREE.PlaneGeometry(5, 5),
//   new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
// );
// plane.rotation.x = Math.PI / 2; // Biar jadi lantai
// plane.position.set(3, -3, -2);
// scene.add(plane);

// const cylinderGeometry = new THREE.Mesh(
//   new THREE.CylinderGeometry(1, 1, 2, 32),
//   new THREE.MeshBasicMaterial({ color: 0xcc2, wireframe: true })
// );
// cylinderGeometry.position.set(-4, 0, -2);
// scene.add(cylinderGeometry);

// Group buat kepala, body, main group
const steveGroup = new THREE.Group();
const steveHead = new THREE.Group();
const steveBody = new THREE.Group();

// Kepala (kotak besar warna kulit)
const headGeometry = new THREE.BoxGeometry(2, 2, 2);
const headMaterial = new THREE.MeshBasicMaterial({ color: 0xc99666 });
const head = new THREE.Mesh(headGeometry, headMaterial);
steveHead.add(head);

// Mata kiri - putih
const eyeWhiteGeo = new THREE.BoxGeometry(0.4, 0.2, 0.05);
const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const eyeLeft = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
eyeLeft.position.set(-0.4, 0.3, 1); // depan kepala
steveHead.add(eyeLeft);

// Mata kiri - hitam (pupil)
const pupilGeo = new THREE.BoxGeometry(0.2, 0.2, 0.05);
const pupilMat = new THREE.MeshBasicMaterial({ color: 0x4d4dff });
const pupilLeft = new THREE.Mesh(pupilGeo, pupilMat);
pupilLeft.position.set(-0.4, 0.3, 1.06);
steveHead.add(pupilLeft);

// Mata kanan - putih
const eyeRight = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat.clone());
eyeRight.position.set(0.4, 0.3, 1);
steveHead.add(eyeRight);

// Mata kanan - hitam (pupil)
const pupilRight = new THREE.Mesh(pupilGeo, pupilMat.clone());
pupilRight.position.set(0.4, 0.3, 1.06);
steveHead.add(pupilRight);

// Hidung
const Nose = new THREE.Mesh(
  new THREE.BoxGeometry(0.4, 0.2, 0.2),
  new THREE.MeshBasicMaterial({ color: 0xc97e5c })
);
Nose.position.set(0, -0.1, 1.06);
steveHead.add(Nose);

// Mulut
const Mouth = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.2, 0),
  new THREE.MeshBasicMaterial({ color: 0x2e1f11 })
);
Mouth.position.set(0, -0.5, 1.06);
steveHead.add(Mouth);

// Buat 3 kotak rambut
const hair1 = new THREE.BoxGeometry(0.2, 1, 2.2); // kiri
hair1.translate(-1, 0.65, 0); // Geser ke tempatnya

const hair2 = new THREE.BoxGeometry(2, 0.5, 2.2); // tengah lebih panjang ke depan
hair2.translate(0, 0.9, 0);

const hairBack = new THREE.BoxGeometry(2, 1, 1.2); // tengah lebih panjang ke depan
hairBack.translate(0, 0.65, -0.5);

const hair3 = new THREE.BoxGeometry(0.2, 1, 2.2); // kanan
hair3.translate(1, 0.65, 0);

// Gabungkan semua geometry jadi satu bentuk
const mergedHairGeo = mergeGeometries([hair1, hair2, hairBack, hair3]);
const hairMaterial = new THREE.MeshBasicMaterial({ color: 0x331a00 });
const hair = new THREE.Mesh(mergedHairGeo, hairMaterial);

// Tambahkan ke steve
steveHead.add(hair);

// Tambahkan ke scene
steveGroup.add(steveHead);

// base badan
const baseBody = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2.8, 1.5),
  new THREE.MeshBasicMaterial({ color: 0x43f3ff })
);
steveBody.add(baseBody);

function createHand(isRight = false) {
  // Baju
  const shirtGeo = new THREE.BoxGeometry(1, 1, 1.5);
  shirtGeo.translate(0, 1, 0); // posisi relatif terhadap grup
  setOrigin(shirtGeo, 'top');
  const shirtMat = new THREE.MeshBasicMaterial({ color: 0x43f3ff });
  const shirt = new THREE.Mesh(shirtGeo, shirtMat);

  // Tangan
  const handGeo = new THREE.BoxGeometry(1, 2.5, 1.5);
  // handGeo.translate(0, -1.25, 0);
  setOrigin(handGeo, 'top');
  const handMat = new THREE.MeshBasicMaterial({ color: 0xf1c27d });
  const hand = new THREE.Mesh(handGeo, handMat);

  // Gabungkan
  const handGroup = new THREE.Group();
  handGroup.add(shirt);
  handGroup.add(hand);

  // Posisikan ke kiri atau kanan
  const xPos = isRight ? 1.5 : -1.5;
  handGroup.position.set(xPos, 0.4, 0);

  return handGroup;
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}

const leftHand = createHand(false);
const rightHand = createHand(true);
rightHand.rotation.x = -degToRad(30);
leftHand.rotation.x = degToRad(35);

steveBody.add(leftHand);
steveBody.add(rightHand);

function createLeg(isRight = false) {
  // celana
  const pantsGeo = new THREE.BoxGeometry(1, 3, 1.5);
  pantsGeo.translate(0, -1.5, 0); // posisi relatif terhadap grup
  const pantsMat = new THREE.MeshBasicMaterial({ color: 0x4d4dcc });
  const pants = new THREE.Mesh(pantsGeo, pantsMat);

  // kaki
  const legGeo = new THREE.BoxGeometry(1, 0.5, 1.5);
  legGeo.translate(0, -3.25, 0);
  const legMat = new THREE.MeshBasicMaterial({ color: 0x50565e });
  const leg = new THREE.Mesh(legGeo, legMat);

  // Gabungkan
  const legGroup = new THREE.Group();
  legGroup.add(pants);
  legGroup.add(leg);

  // Posisikan ke kiri atau kanan
  const xPos = isRight ? 0.5 : -0.5;
  legGroup.position.set(xPos, -1.5, 0);

  return legGroup;
}

const pants = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 1.5),
  new THREE.MeshBasicMaterial({ color: 0x4d4dcc })
);
pants.position.set(0, -1.5, 0); // letakkan di bawah body
steveBody.add(pants);

const leftLeg = createLeg(false);
const rightLeg = createLeg(true);
leftLeg.rotation.x = -degToRad(45);
rightLeg.rotation.x = degToRad(45);
steveBody.add(leftLeg);
steveBody.add(rightLeg);

steveGroup.add(steveBody);
steveHead.position.set(2, 3, 0);
steveBody.position.set(2, 0.6, 0);
scene.add(steveGroup);

renderer.shadowMap.enabled = true; // mengaktifkan banyangan Bayangkan kamu punya panggung teater dan objek di atasnya. Kalau shadowMap dimatikan, semua lampu tetap menyala tapi tidak ada bayangan yang jatuh ke lantai atau ke objek lain.
// === Light ===
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // cahaya lembut yang menyinari seluruh object rangenya 0 - 1
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // cahaya seperti matahari datang dari satu arah lurus dan bisa menghasilkan bayangan.
directionalLight.position.set(10, 10, 10); // set posisi cahaya, x, y, z
directionalLight.castShadow = true; // mengaktifkan cahaya jadinya ada bayangan
scene.add(directionalLight);

// === Geometry ===
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

// --- Standard Material ---
const standardMat = new THREE.MeshStandardMaterial({
  color: 0x44aa88,
  metalness: 0.5, // seberapa metalik permukaannya. 0 seperti plastik - 1 seperti logam
  roughness: 0.5, // seberapa kasar permukaannya. 0 licin seperti kaca - 1 sangat kasar seperti pasir.
});
const cubeStandard = new THREE.Mesh(boxGeo, standardMat);
cubeStandard.castShadow = true; // mengaktifkan cahaya jadinya ada bayangan
cubeStandard.position.set(-3.5, 2, 5);
scene.add(cubeStandard);

// --- Phong Material ---
const phongMat = new THREE.MeshPhongMaterial({
  color: 0x4488aa,
  shininess: 100, // semakin besar semakin mengkilap 300++ seperti keramik mengkilap
  specular: 0xFFCC33, // warna pantulan highlight.
});
const cubePhong = new THREE.Mesh(boxGeo, phongMat);
cubePhong.castShadow = true; // mengaktifkan cahaya jadinya ada bayangan
cubePhong.position.set(-2, 2, 5);
scene.add(cubePhong);

function setOrigin(geometry, anchor = 'center') {
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  geometry.computeBoundingBox();

  if (!geometry.boundingBox) return;

  geometry.boundingBox.getSize(size);
  geometry.boundingBox.getCenter(center);

  const offset = new THREE.Vector3();

  switch (anchor) {
    case 'top':
      offset.set(0, -size.y / 2, 0);
      break;
    case 'bottom':
      offset.set(0, size.y / 2, 0);
      break;
    case 'left':
      offset.set(size.x / 2, 0, 0);
      break;
    case 'right':
      offset.set(-size.x / 2, 0, 0);
      break;
    case 'topleft':
      offset.set(size.x / 2, -size.y / 2, 0);
      break;
    case 'topright':
      offset.set(-size.x / 2, -size.y / 2, 0);
      break;
    case 'bottomleft':
      offset.set(size.x / 2, size.y / 2, 0);
      break;
    case 'bottomright':
      offset.set(-size.x / 2, size.y / 2, 0);
      break;
    default: // center
      offset.copy(center).multiplyScalar(-1);
      break;
  }

  geometry.translate(offset.x, offset.y, offset.z);
}

// Render
function animate() {
  requestAnimationFrame(animate);
  // steveGroup.rotation.y += 0.01;
  rightHand.rotation.x = (Math.sin(Date.now() * 0.005) * Math.PI) / 6;
  leftHand.rotation.x = (-Math.sin(Date.now() * 0.005) * Math.PI) / 6;
  leftLeg.rotation.x = (Math.sin(Date.now() * 0.005) * Math.PI) / 6;
  rightLeg.rotation.x = (-Math.sin(Date.now() * 0.005) * Math.PI) / 6;

  cubeStandard.rotation.y += 0.01;
  cubePhong.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
