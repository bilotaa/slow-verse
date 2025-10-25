// Road Generation and Management System

const ROAD_WIDTH = 10;
const ROAD_SEGMENT_LENGTH = 2;
let roadSegments = new Map();

// Generate road path through terrain valleys
function generateRoadPath(startZ, endZ) {
    const points = [];
    const step = 10;

    for (let z = startZ; z <= endZ; z += step) {
        // Sample terrain in local area to find valley (low point)
        let lowestX = 0;
        let lowestHeight = Infinity;

        for (let x = -20; x <= 20; x += 5) {
            const height = getTerrainHeight(x, z);
            if (height < lowestHeight) {
                lowestHeight = height;
                lowestX = x;
            }
        }

        // Add some gentle curves for interest
        const curveOffset = Math.sin(z * 0.01) * 15;
        const finalX = lowestX + curveOffset;

        points.push(new THREE.Vector3(finalX, lowestHeight + 0.2, z));
    }

    return new THREE.CatmullRomCurve3(points);
}

// Generate road mesh for a chunk
function generateRoadMesh(chunkZ) {
    const startZ = chunkZ * CHUNK_SIZE;
    const endZ = startZ + CHUNK_SIZE;

    const path = generateRoadPath(startZ, endZ);
    const divisions = Math.floor(CHUNK_SIZE / ROAD_SEGMENT_LENGTH);
    const points = path.getPoints(divisions);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];

    for (let i = 0; i < points.length; i++) {
        const point = points[i];

        let forward;
        if (i < points.length - 1) {
            forward = new THREE.Vector3().subVectors(points[i + 1], point).normalize();
        } else {
            forward = new THREE.Vector3().subVectors(point, points[i - 1]).normalize();
        }

        const right = new THREE.Vector3(-forward.z, 0, forward.x).normalize();

        const halfWidth = ROAD_WIDTH / 2;
        const leftPoint = point.clone().add(right.multiplyScalar(halfWidth));
        const rightPoint = point.clone().sub(right.multiplyScalar(halfWidth));

        vertices.push(leftPoint.x, leftPoint.y, leftPoint.z);
        vertices.push(rightPoint.x, rightPoint.y, rightPoint.z);

        uvs.push(0, i / points.length);
        uvs.push(1, i / points.length);

        if (i < points.length - 1) {
            const base = i * 2;
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Create road material with gradient colors
    const material = new THREE.MeshBasicMaterial({
        color: 0xb8a89a,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

// Update road segments based on camera position
function updateRoad(cameraPosition) {
    const scene = getScene();
    const currentChunkZ = Math.floor(cameraPosition.z / CHUNK_SIZE);

    // Generate road segments ahead
    for (let z = currentChunkZ - 1; z <= currentChunkZ + RENDER_DISTANCE; z++) {
        const key = `road_${z}`;

        if (!roadSegments.has(key)) {
            const roadMesh = generateRoadMesh(z);
            scene.add(roadMesh);
            roadSegments.set(key, roadMesh);
        }
    }

    // Remove old road segments
    const segmentsToRemove = [];
    roadSegments.forEach((segment, key) => {
        const chunkZ = parseInt(key.split('_')[1]);
        const distance = chunkZ - currentChunkZ;

        if (distance < -DISPOSE_DISTANCE) {
            segmentsToRemove.push(key);
        }
    });

    segmentsToRemove.forEach(key => {
        const segment = roadSegments.get(key);
        scene.remove(segment);
        segment.geometry.dispose();
        segment.material.dispose();
        roadSegments.delete(key);
    });
}

// Get road center position at Z coordinate
function getRoadCenterAt(z) {
    // Sample terrain to find valley
    let lowestX = 0;
    let lowestHeight = Infinity;

    for (let x = -20; x <= 20; x += 5) {
        const height = getTerrainHeight(x, z);
        if (height < lowestHeight) {
            lowestHeight = height;
            lowestX = x;
        }
    }

    // Add gentle curve
    const curveOffset = Math.sin(z * 0.01) * 15;
    const finalX = lowestX + curveOffset;

    return new THREE.Vector3(finalX, lowestHeight + 0.2, z);
}
