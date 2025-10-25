// Camera Controller - Third Person View

let gameCamera;

const CAMERA_DISTANCE = 10;  // Distance behind car
const CAMERA_HEIGHT = 4;     // Height above car
const CAMERA_SMOOTHING = 0.1; // Smooth follow factor

// Create perspective camera
function createGameCamera() {
    gameCamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );

    gameCamera.position.set(0, CAMERA_HEIGHT, -CAMERA_DISTANCE);
    setCamera(gameCamera);

    return gameCamera;
}

// Update camera to follow vehicle smoothly
function updateGameCamera(vehiclePosition, vehicleRotation, deltaTime) {
    if (!gameCamera) return;

    // Calculate target camera position (behind and above vehicle)
    const targetX = vehiclePosition.x - Math.sin(vehicleRotation.y) * CAMERA_DISTANCE;
    const targetY = vehiclePosition.y + CAMERA_HEIGHT;
    const targetZ = vehiclePosition.z - Math.cos(vehicleRotation.y) * CAMERA_DISTANCE;

    // Smooth interpolation toward target position
    gameCamera.position.x += (targetX - gameCamera.position.x) * CAMERA_SMOOTHING;
    gameCamera.position.y += (targetY - gameCamera.position.y) * CAMERA_SMOOTHING;
    gameCamera.position.z += (targetZ - gameCamera.position.z) * CAMERA_SMOOTHING;

    // Look slightly ahead of the vehicle
    const lookAtZ = vehiclePosition.z + 5;
    gameCamera.lookAt(vehiclePosition.x, vehiclePosition.y, lookAtZ);
}
