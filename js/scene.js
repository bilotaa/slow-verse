// Three.js Scene Setup and Initialization

let scene, renderer, camera;
let ambientLight, directionalLight;

function initScene() {
    // Create scene
    scene = new THREE.Scene();

    // Create sky gradient background using fog
    scene.background = new THREE.Color(0xc5d8e8);
    scene.fog = new THREE.FogExp2(0xe8d5c5, 0.0008);

    // Create WebGL renderer
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false; // Disable shadows for performance

    // Create ambient light (soft overall illumination)
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Create directional light (sun-like lighting)
    directionalLight = new THREE.DirectionalLight(0xfff5e6, 0.6);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function getScene() {
    return scene;
}

function getRenderer() {
    return renderer;
}

function getCamera() {
    return camera;
}

function setCamera(cam) {
    camera = cam;
}
