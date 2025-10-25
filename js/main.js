// Main Game Entry Point and Loop

let previousTime = 0;
let isInitialized = false;

// Initialize game
function init() {
    console.log('Initializing Slow Roads - Mountain Drive...');

    // Initialize scene and renderer
    initScene();

    // Create camera
    createGameCamera();

    // Setup controls
    setupControls();

    // Load sprite textures
    loadSpriteTextures();

    // Create vehicle
    createVehicle();

    // Mark as initialized
    isInitialized = true;

    console.log('Game initialized successfully!');

    // Start game loop
    previousTime = performance.now();
    gameLoop();
}

// Main game loop
function gameLoop() {
    // Calculate delta time
    const currentTime = performance.now();
    let deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;

    // Clamp delta time to prevent huge jumps
    deltaTime = Math.min(deltaTime, 0.1);

    // Get current input
    const currentInput = getInput();

    // Update vehicle
    updateVehicle(deltaTime, currentInput);

    // Get vehicle position and rotation
    const vehiclePos = getVehiclePosition();
    const vehicleRot = getVehicleRotation();

    // Update camera
    updateGameCamera(vehiclePos, vehicleRot, deltaTime);

    // Update terrain chunks
    updateTerrain(vehiclePos);

    // Update road segments
    updateRoad(vehiclePos);

    // Update environment chunks
    updateEnvironmentChunks(vehiclePos);

    // Update billboard rotations to face camera
    updateEnvironment(vehiclePos);

    // Render scene
    const scene = getScene();
    const camera = getCamera();
    const renderer = getRenderer();

    if (scene && camera && renderer) {
        renderer.render(scene, camera);
    }

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
