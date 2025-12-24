import * as THREE from "three";
// Postprocessing removed to avoid multiple-instance conflicts on some browsers
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://unpkg.com/three@0.160.0/examples/jsm/geometries/TextGeometry.js";

const canvas = document.getElementById("c");
const revealBtn = document.getElementById("reveal");
const moreBtn = document.getElementById("more");
const messageEl = document.getElementById("message");
const footerEl = document.getElementById("footer");

const LOVE_TEXT = "Lina";
const MESSAGE_SETS = [
  [
    "Je t'aime ma p'tite choquette de tout mon cœur.",
    "Tu me manques à chaque instant.",
    "Pour toujours et à jamais ❤️",
  ],
  [
    "Tu es ma lumière.",
    "Chaque jour je pense à toi.",
    "Rien n'est plus doux que nous deux.",
  ],
  [
    "Ton sourire est mon soleil.",
    "Tes mots sont ma musique.",
    "Mon cœur bat pour toi.",
  ],
];
let messageIndex = 0;

// ----- Renderer / Scene -----
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
camera.position.set(0, 1.2, 8.5);

// No composer; render directly for maximum compatibility

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4.2;
controls.maxDistance = 13;
controls.minPolarAngle = 0.25;
controls.maxPolarAngle = Math.PI * 0.72;
controls.target.set(0, 0.8, 0);

// ----- Lights -----
const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

const key = new THREE.PointLight(0xff5cab, 65, 45, 2);
key.position.set(3.2, 2.8, 3.4);
scene.add(key);

const rim = new THREE.PointLight(0x7c3aed, 55, 45, 2);
rim.position.set(-4.0, 1.8, -2.0);
scene.add(rim);

const sparkleLight = new THREE.PointLight(0x22d3ee, 18, 18, 2);
sparkleLight.position.set(0, 2.2, 2.2);
scene.add(sparkleLight);

// ----- Heart -----
function makeHeartShape() {
  const s = new THREE.Shape();
  // Classic heart shape using bezier curves (2D), later extruded.
  s.moveTo(0, 0.25);
  s.bezierCurveTo(0, 0.25, -0.55, -0.1, -0.55, -0.52);
  s.bezierCurveTo(-0.55, -0.95, -0.08, -1.2, 0, -0.88);
  s.bezierCurveTo(0.08, -1.2, 0.55, -0.95, 0.55, -0.52);
  s.bezierCurveTo(0.55, -0.1, 0, 0.25, 0, 0.25);
  return s;
}

const heartGeometry = new THREE.ExtrudeGeometry(makeHeartShape(), {
  depth: 0.55,
  bevelEnabled: true,
  bevelSegments: 8,
  steps: 1,
  bevelSize: 0.12,
  bevelThickness: 0.12,
});
heartGeometry.center();
heartGeometry.rotateX(Math.PI);

const heartMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4da6,
  roughness: 0.18,
  metalness: 0.55,
  emissive: 0x280013,
  emissiveIntensity: 0.8,
});

const heart = new THREE.Mesh(heartGeometry, heartMaterial);
heart.scale.setScalar(2.1);
heart.position.set(0, 1.05, 0);
scene.add(heart);

// Subtle halo (cheap glow)
const haloGeometry = new THREE.SphereGeometry(1.35, 48, 48);
const haloMaterial = new THREE.MeshBasicMaterial({
  color: 0xff4da6,
  transparent: true,
  opacity: 0.08,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const halo = new THREE.Mesh(haloGeometry, haloMaterial);
halo.position.copy(heart.position);
scene.add(halo);

// Orbital light rings for extra wow
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xff9bd1,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const ringGeo1 = new THREE.TorusGeometry(2.4, 0.03, 12, 64);
const ringGeo2 = new THREE.TorusGeometry(1.9, 0.025, 12, 64);
const ring1 = new THREE.Mesh(ringGeo1, ringMat.clone());
const ring2 = new THREE.Mesh(ringGeo2, ringMat.clone());
ring1.rotation.x = Math.PI / 2.3;
ring2.rotation.x = Math.PI / 1.9;
ring1.position.set(0, 1.0, 0);
ring2.position.set(0, 1.25, 0);
scene.add(ring1);
scene.add(ring2);

// Floating mini hearts for a more romantic vibe
const miniHearts = [];
function makeMiniHeart() {
  const g = new THREE.ExtrudeGeometry(makeHeartShape(), {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  });
  g.center();
  g.rotateX(Math.PI);
  const cols = [0xff4da6, 0xa855f7, 0xff9bd1, 0x22d3ee];
  const m = new THREE.MeshStandardMaterial({
    color: cols[(Math.random() * cols.length) | 0],
    roughness: 0.3,
    metalness: 0.35,
    emissive: 0x18081b,
    emissiveIntensity: 0.5,
  });
  const mesh = new THREE.Mesh(g, m);
  const r = 3 + Math.random() * 5;
  const ang = Math.random() * Math.PI * 2;
  mesh.position.set(Math.cos(ang) * r, 0.6 + Math.random() * 2.6, Math.sin(ang) * r * 0.6);
  const s = 0.14 + Math.random() * 0.18;
  mesh.scale.setScalar(s);
  mesh.userData.vy = 0.12 + Math.random() * 0.25;
  mesh.userData.rot = new THREE.Vector3(Math.random() * 0.2, Math.random() * 0.4, Math.random() * 0.2);
  miniHearts.push(mesh);
  scene.add(mesh);
}
function spawnMiniHearts(count = 12, cap = 160) {
  const room = Math.max(0, cap - miniHearts.length);
  const toMake = Math.min(room, count);
  for (let i = 0; i < toMake; i++) makeMiniHeart();
}
spawnMiniHearts(42);

// ----- Starfield -----
function makeStarfield(count = 2500) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c0 = new THREE.Color(0xff4da6);
  const c1 = new THREE.Color(0xa855f7);
  const c2 = new THREE.Color(0x22d3ee);

  for (let i = 0; i < count; i++) {
    const r = 22 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const u = Math.random() * 2 - 1;
    const phi = Math.acos(u);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) * 0.65 + 0.8;
    const z = r * Math.sin(phi) * Math.sin(theta);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const t = Math.random();
    const col = (t < 0.45 ? c0 : t < 0.8 ? c1 : c2).clone();
    col.offsetHSL((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.06);
    colors[i * 3 + 0] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

const stars = makeStarfield(3200);
scene.add(stars);

// ----- Spark particles (burst on click) -----
const MAX_SPARKS = 1400;
const sparkGeometry = new THREE.BufferGeometry();
const sparkPositions = new Float32Array(MAX_SPARKS * 3);
const sparkVel = new Float32Array(MAX_SPARKS * 3);
const sparkLife = new Float32Array(MAX_SPARKS);
const sparkColor = new Float32Array(MAX_SPARKS * 3);

sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
sparkGeometry.setAttribute("color", new THREE.BufferAttribute(sparkColor, 3));

const sparkMaterial = new THREE.PointsMaterial({
  size: 0.06,
  transparent: true,
  opacity: 0.95,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
sparks.frustumCulled = false;
scene.add(sparks);

const palette = [0xff4da6, 0xa855f7, 0x22d3ee, 0xff9bd1];
function burstSparks(worldPos, power = 1) {
  const base = new THREE.Vector3().copy(worldPos);
  const color = new THREE.Color();
  for (let i = 0; i < MAX_SPARKS; i++) {
    if (sparkLife[i] > 0) continue;
    sparkPositions[i * 3 + 0] = base.x;
    sparkPositions[i * 3 + 1] = base.y;
    sparkPositions[i * 3 + 2] = base.z;

    const dir = new THREE.Vector3(
      (Math.random() * 2 - 1),
      (Math.random() * 2 - 1),
      (Math.random() * 2 - 1)
    ).normalize();

    const speed = (0.9 + Math.random() * 1.8) * power;
    sparkVel[i * 3 + 0] = dir.x * speed;
    sparkVel[i * 3 + 1] = dir.y * speed + 0.6 * power;
    sparkVel[i * 3 + 2] = dir.z * speed;

    sparkLife[i] = 0.9 + Math.random() * 0.9;

    color.setHex(palette[(Math.random() * palette.length) | 0]);
    sparkColor[i * 3 + 0] = color.r;
    sparkColor[i * 3 + 1] = color.g;
    sparkColor[i * 3 + 2] = color.b;
  }

  sparkGeometry.attributes.position.needsUpdate = true;
  sparkGeometry.attributes.color.needsUpdate = true;
}

// ----- 3D Text (loads font) -----
const textGroup = new THREE.Group();
textGroup.position.set(0, 0.25, 0);
scene.add(textGroup);

let textMesh = null;
let subTextMesh = null;

function createText(font) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf6f3ff,
    roughness: 0.25,
    metalness: 0.15,
    emissive: 0x0b0720,
    emissiveIntensity: 0.8,
  });

  const geo = new TextGeometry(LOVE_TEXT, {
    font,
    size: 0.55,
    height: 0.12,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 5,
  });
  geo.center();
  textMesh = new THREE.Mesh(geo, mat);
  // Move text slightly higher and forward to avoid intersecting the heart
  // Lifted higher so it floats clearly above the heart
  textMesh.position.set(0, 3.15, 0.82);
  textMesh.visible = true;
  textGroup.add(textMesh);

  const geo2 = new TextGeometry("Je t'aime • Tu me manques", {
    font,
    size: 0.22,
    height: 0.06,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.01,
    bevelSegments: 4,
  });
  geo2.center();
  subTextMesh = new THREE.Mesh(geo2, mat);
  subTextMesh.position.set(0, 2.55, 0.72);
  subTextMesh.visible = true;
  textGroup.add(subTextMesh);
}

new FontLoader().load(
  "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json",
  (font) => createText(font),
  undefined,
  () => {
    // If font fails, keep scene working without it.
  }
);

// ----- Interactions -----
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let didReveal = false;

function setPointerFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  pointer.set(x, y);
}

function worldPointOnHeart() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(heart, false);
  if (hits.length) return hits[0].point;
  const p = new THREE.Vector3();
  raycaster.ray.at(7, p);
  return p;
}

function typeLines(el, lines) {
  const full = lines.join("\n");
  el.textContent = "";
  let i = 0;
  const tick = () => {
    i += Math.max(1, Math.floor(full.length / 80));
    el.textContent = full.slice(0, i);
    if (i < full.length) requestAnimationFrame(tick);
  };
  tick();
}

function reveal() {
  const lines = MESSAGE_SETS[messageIndex];
  messageIndex = (messageIndex + 1) % MESSAGE_SETS.length;

  typeLines(messageEl, lines);
  footerEl.textContent = "Lina, tu es tout pour moi.";
  revealBtn.textContent = "Révéler encore";
  revealBtn.disabled = false;
  moreBtn.disabled = false;

  // On first reveal, show 3D text and trigger burst; afterwards, only burst.
  if (!didReveal) {
    didReveal = true;
    if (textMesh) textMesh.visible = true;
    if (subTextMesh) subTextMesh.visible = true;
  }
  burstSparks(heart.position.clone().add(new THREE.Vector3(0, 0.2, 0)), 1.4);
}

revealBtn.addEventListener("click", reveal);
moreBtn.addEventListener("click", () => {
  // Add extra floating hearts and a stronger sparkle burst
  spawnMiniHearts(24);
  burstSparks(heart.position.clone().add(new THREE.Vector3(0, 0.2, 0)), 1.6);
});

canvas.addEventListener("pointerdown", (e) => {
  // Only trigger sparks on canvas clicks; reveal remains button-only
  setPointerFromEvent(e);
  burstSparks(worldPointOnHeart(), 1.0);
});

// ----- Resize -----
function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// ----- Animation loop -----
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  const dt = Math.min(0.033, clock.getDelta());

  // Heart motion
  heart.rotation.y = t * 0.55;
  heart.rotation.z = Math.sin(t * 0.9) * 0.05;
  heart.position.y = 1.05 + Math.sin(t * 1.15) * 0.08;
  halo.position.copy(heart.position);
  halo.scale.setScalar(1.0 + (Math.sin(t * 1.2) * 0.04 + 0.04));
  heartMaterial.emissiveIntensity = 0.75 + Math.sin(t * 2.2) * 0.1;

  // Orbital rings motion
  ring1.rotation.y = t * 0.25;
  ring2.rotation.y = -t * 0.18;
  ring1.material.opacity = 0.25 + Math.sin(t * 1.6) * 0.12;
  ring2.material.opacity = 0.22 + Math.cos(t * 1.3) * 0.1;

  // Lights breathe
  key.intensity = 58 + Math.sin(t * 1.1) * 10;
  rim.intensity = 46 + Math.sin(t * 1.3 + 1.2) * 9;
  sparkleLight.intensity = 12 + Math.sin(t * 1.9 + 0.5) * 7;

  // Star drift
  stars.rotation.y = t * 0.02;
  stars.rotation.x = Math.sin(t * 0.05) * 0.02;

  // Text float
  textGroup.rotation.y = Math.sin(t * 0.35) * 0.18;
  textGroup.position.y = 0.22 + Math.sin(t * 0.75) * 0.08;

  // Floating mini hearts update
  for (const mh of miniHearts) {
    mh.position.y += mh.userData.vy * dt;
    mh.rotation.x += mh.userData.rot.x * dt;
    mh.rotation.y += mh.userData.rot.y * dt;
    mh.rotation.z += mh.userData.rot.z * dt;
    if (mh.position.y > 3.6) {
      mh.position.y = 0.4 + Math.random() * 0.6;
      mh.position.x += (Math.random() - 0.5) * 1.5;
      mh.position.z += (Math.random() - 0.5) * 1.5;
    }
  }

  // Sparks update
  for (let i = 0; i < MAX_SPARKS; i++) {
    const life = sparkLife[i];
    if (life <= 0) continue;

    sparkLife[i] = life - dt;
    const idx = i * 3;

    sparkVel[idx + 1] -= 2.35 * dt; // gravity

    sparkPositions[idx + 0] += sparkVel[idx + 0] * dt;
    sparkPositions[idx + 1] += sparkVel[idx + 1] * dt;
    sparkPositions[idx + 2] += sparkVel[idx + 2] * dt;

    // damp
    sparkVel[idx + 0] *= 0.985;
    sparkVel[idx + 1] *= 0.985;
    sparkVel[idx + 2] *= 0.985;
  }
  sparkGeometry.attributes.position.needsUpdate = true;

  // Fade sparks material slightly with active count
  let active = 0;
  for (let i = 0; i < MAX_SPARKS; i++) if (sparkLife[i] > 0) active++;
  sparkMaterial.opacity = 0.25 + Math.min(1, active / 180) * 0.75;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();