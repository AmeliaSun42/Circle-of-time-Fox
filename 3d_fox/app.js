// 初始化场景、相机和渲染器
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 控制器
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 旋转监听逻辑
let lastRotation = 0;
let rotationDelta = 0;
let fc = 0;

controls.addEventListener('change', () => {
  const currentRotation = controls.getAzimuthalAngle();
  rotationDelta = Math.abs(currentRotation - lastRotation);
  lastRotation = currentRotation;

  if (rotationDelta > 0.005) {
    let space = map(rotationDelta * 10, 0.2, 2, 10, 1);
    space = parseInt(space);

    if (fc % space === 0) {
      handleSwitchBackground();
    }
  }

  fc++;
});

// 灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x5577aa, 1.5, 10);
pointLight.position.set(2, 3, 2);
scene.add(pointLight);
pointLight.visible = false;

// 背景图加载
let currentBgIndex = 0;
const backgroundTextures = [];
const textureLoader = new THREE.TextureLoader();
let texturesLoaded = 0;

for (let i = 1; i <= 11; i++) {
  textureLoader.load(`image_${i}.png`, (texture) => {
    backgroundTextures.push(texture);
    texturesLoaded++;
    if (i === 1) {
      scene.background = texture;
    }
  });
}

// 空格监听切换备用
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    handleSwitchBackground();
  }
});

// 白天/黑夜对应表
const isDayList = [true, false, false, false, true, true, false, false, true, true, true];

// 切换背景函数
function handleSwitchBackground() {
  if (backgroundTextures.length === 0) return;
  currentBgIndex = (currentBgIndex + 1) % backgroundTextures.length;
  scene.background = backgroundTextures[currentBgIndex];

  const isDaytime = isDayList[currentBgIndex];
  if (isDaytime) {
    ambientLight.intensity = 0.5;
    directionalLight.intensity = 0.8;
    pointLight.visible = false;
    directionalLight.visible = true;
  } else {
    ambientLight.intensity = 0.3;
    directionalLight.intensity = 0.4;
    pointLight.visible = true;
    directionalLight.visible = false;
  }
}

// 加载模型和材质（路径已改为根目录）
let model;

const mtlLoader = new THREE.MTLLoader();
mtlLoader.setPath('./');
mtlLoader.load('fox2.mtl', (materials) => {
  materials.preload();

  const objLoader = new THREE.OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('./');
  objLoader.load('fox2.obj', (object) => {
    model = object;
    model.position.set(0, -1, 0);
    model.scale.set(0.5, 0.5, 0.5);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    scene.add(model);
  });
});

// 窗口自适应
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 映射函数
function map(value, start1, stop1, start2, stop2) {
  const proportion = (value - start1) / (stop1 - start1);
  return start2 + proportion * (stop2 - start2);
}
