// Terrain Generation and Management System

const CHUNK_SIZE = 200;
const CHUNK_RESOLUTION = 64;
const RENDER_DISTANCE = 5; // chunks ahead
const DISPOSE_DISTANCE = 3; // chunks behind to remove

let terrainChunks = new Map();

// Generate a single terrain chunk
function generateChunk(chunkX, chunkZ) {
    const geometry = new THREE.PlaneGeometry(
        CHUNK_SIZE,
        CHUNK_SIZE,
        CHUNK_RESOLUTION - 1,
        CHUNK_RESOLUTION - 1
    );

    const vertices = geometry.attributes.position.array;
    const colors = [];

    // Apply heightmap and colors to vertices
    for (let i = 0; i < vertices.length; i += 3) {
        const localX = vertices[i];
        const localZ = vertices[i + 1];

        // Calculate world position
        const worldX = chunkX * CHUNK_SIZE + localX;
        const worldZ = chunkZ * CHUNK_SIZE + localZ;

        // Get height from noise
        const height = getNoiseHeight(worldX, worldZ);
        vertices[i + 2] = height;

        // Color based on height (gradient from green to gray for mountains)
        const normalizedHeight = (height + 40) / 120; // Normalize to 0-1 range
        const lowColor = new THREE.Color(0xc8d5a8); // Greenish
        const midColor = new THREE.Color(0xb8c8a0);
        const highColor = new THREE.Color(0xa8b8a0); // Grayish

        let color;
        if (normalizedHeight < 0.5) {
            color = new THREE.Color().lerpColors(lowColor, midColor, normalizedHeight * 2);
        } else {
            color = new THREE.Color().lerpColors(midColor, highColor, (normalizedHeight - 0.5) * 2);
        }

        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    // Create material with vertex colors
    const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        flatShading: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);

    return mesh;
}

// Update terrain chunks based on camera position
function updateTerrain(cameraPosition) {
    const scene = getScene();

    // Calculate current chunk
    const currentChunkX = Math.floor(cameraPosition.x / CHUNK_SIZE);
    const currentChunkZ = Math.floor(cameraPosition.z / CHUNK_SIZE);

    // Generate chunks in render distance
    for (let x = currentChunkX - 1; x <= currentChunkX + 1; x++) {
        for (let z = currentChunkZ - RENDER_DISTANCE; z <= currentChunkZ + RENDER_DISTANCE; z++) {
            const key = `${x},${z}`;

            if (!terrainChunks.has(key)) {
                const chunk = generateChunk(x, z);
                scene.add(chunk);
                terrainChunks.set(key, chunk);
            }
        }
    }

    // Remove chunks that are too far behind
    const chunksToRemove = [];
    terrainChunks.forEach((chunk, key) => {
        const [chunkX, chunkZ] = key.split(',').map(Number);
        const distance = chunkZ - currentChunkZ;

        if (distance < -DISPOSE_DISTANCE || Math.abs(chunkX - currentChunkX) > 2) {
            chunksToRemove.push(key);
        }
    });

    chunksToRemove.forEach(key => {
        const chunk = terrainChunks.get(key);
        scene.remove(chunk);
        chunk.geometry.dispose();
        chunk.material.dispose();
        terrainChunks.delete(key);
    });
}

// Get terrain height at world position
function getTerrainHeight(x, z) {
    return getNoiseHeight(x, z);
}

// Get terrain normal at position (for car rotation)
function getTerrainNormal(x, z, sampleDistance = 1) {
    const h0 = getTerrainHeight(x, z);
    const hx = getTerrainHeight(x + sampleDistance, z);
    const hz = getTerrainHeight(x, z + sampleDistance);

    const dx = hx - h0;
    const dz = hz - h0;

    const normal = new THREE.Vector3(-dx, sampleDistance, -dz).normalize();
    return normal;
}
