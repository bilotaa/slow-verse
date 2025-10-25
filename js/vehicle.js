// Vehicle Physics and Rendering System

let vehicle = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    velocity: 0,
    steering: 0,
    mesh: null
};

// Physics constants
const ACCELERATION = 15;
const DECELERATION = 8;
const BRAKING = 25;
const MAX_SPEED = 60;
const TURN_RATE = 2.5;

// Create vehicle mesh
function createVehicle() {
    const carGroup = new THREE.Group();

    // Car body (main box)
    const bodyGeometry = new THREE.BoxGeometry(4, 3, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xe8a8a8 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    carGroup.add(body);

    // Windows (darker inset boxes)
    const windowGeometry = new THREE.BoxGeometry(3.5, 1.5, 4);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0xd8c8c8 });
    const windows = new THREE.Mesh(windowGeometry, windowMaterial);
    windows.position.set(0, 2.5, 0);
    carGroup.add(windows);

    // Wheels (four cylinders)
    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x5a5a5a });

    const wheelPositions = [
        [-1.8, 0.8, 3],   // Front left
        [1.8, 0.8, 3],    // Front right
        [-1.8, 0.8, -3],  // Back left
        [1.8, 0.8, -3]    // Back right
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        carGroup.add(wheel);
    });

    // Position car at starting point
    const roadCenter = getRoadCenterAt(0);
    carGroup.position.copy(roadCenter);
    carGroup.position.y += 1.5;

    vehicle.position.copy(carGroup.position);
    vehicle.mesh = carGroup;

    const scene = getScene();
    scene.add(carGroup);

    return vehicle;
}

// Linear interpolation helper
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Update vehicle physics and position
function updateVehicle(deltaTime, input) {
    // Acceleration and braking
    if (input.forward) {
        vehicle.velocity += ACCELERATION * deltaTime;
    } else if (input.brake) {
        vehicle.velocity -= BRAKING * deltaTime;
    } else {
        // Natural deceleration
        if (vehicle.velocity > 0) {
            vehicle.velocity -= DECELERATION * deltaTime;
        } else if (vehicle.velocity < 0) {
            vehicle.velocity += DECELERATION * deltaTime;
        }
    }

    // Clamp velocity
    vehicle.velocity = Math.max(0, Math.min(MAX_SPEED, vehicle.velocity));

    // Steering
    let targetSteering = 0;
    if (input.left) {
        targetSteering = 1;
    } else if (input.right) {
        targetSteering = -1;
    }

    vehicle.steering = lerp(vehicle.steering, targetSteering, 0.1);

    // Update rotation based on steering
    vehicle.rotation.y += vehicle.steering * TURN_RATE * deltaTime;

    // Update position based on velocity and rotation
    vehicle.position.x += Math.sin(vehicle.rotation.y) * vehicle.velocity * deltaTime;
    vehicle.position.z += Math.cos(vehicle.rotation.y) * vehicle.velocity * deltaTime;

    // Get road center and gently pull car toward it
    const roadCenter = getRoadCenterAt(vehicle.position.z);
    const pullForce = 0.05;
    vehicle.position.x = lerp(vehicle.position.x, roadCenter.x, pullForce);

    // Update Y position based on terrain height
    const terrainHeight = getTerrainHeight(vehicle.position.x, vehicle.position.z);
    vehicle.position.y = terrainHeight + 1.5;

    // Calculate car pitch and roll based on terrain
    const sampleDist = 2;
    const heightFront = getTerrainHeight(
        vehicle.position.x + Math.sin(vehicle.rotation.y) * sampleDist,
        vehicle.position.z + Math.cos(vehicle.rotation.y) * sampleDist
    );
    const heightBack = getTerrainHeight(
        vehicle.position.x - Math.sin(vehicle.rotation.y) * sampleDist,
        vehicle.position.z - Math.cos(vehicle.rotation.y) * sampleDist
    );

    const heightLeft = getTerrainHeight(
        vehicle.position.x + Math.cos(vehicle.rotation.y) * sampleDist,
        vehicle.position.z - Math.sin(vehicle.rotation.y) * sampleDist
    );
    const heightRight = getTerrainHeight(
        vehicle.position.x - Math.cos(vehicle.rotation.y) * sampleDist,
        vehicle.position.z + Math.sin(vehicle.rotation.y) * sampleDist
    );

    // Calculate pitch (forward/backward tilt)
    const targetPitch = Math.atan2(heightFront - heightBack, sampleDist * 2);
    vehicle.rotation.x = lerp(vehicle.rotation.x, targetPitch, 0.1);

    // Calculate roll (left/right tilt)
    const targetRoll = Math.atan2(heightRight - heightLeft, sampleDist * 2);
    vehicle.rotation.z = lerp(vehicle.rotation.z, targetRoll, 0.1);

    // Update mesh
    if (vehicle.mesh) {
        vehicle.mesh.position.copy(vehicle.position);
        vehicle.mesh.rotation.set(vehicle.rotation.x, vehicle.rotation.y, vehicle.rotation.z);
    }
}

// Get vehicle position
function getVehiclePosition() {
    return vehicle.position;
}

// Get vehicle rotation
function getVehicleRotation() {
    return vehicle.rotation;
}
