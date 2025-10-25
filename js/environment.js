// Environment Objects - Billboard Sprite System

let environmentChunks = new Map();
let spriteTextures = {};

// Load sprite textures
function loadSpriteTextures() {
    const loader = new THREE.TextureLoader();
    const texturePaths = {
        tree: 'assets/sprites/tree.png',
        rock1: 'assets/sprites/rock1.png',
        rock2: 'assets/sprites/rock2.png',
        rock3: 'assets/sprites/rock3.png',
        grass: 'assets/sprites/grass.png',
        cloud: 'assets/sprites/cloud.png',
        flowerPink: 'assets/sprites/flower-pink.png',
        flowerYellow: 'assets/sprites/flower-yellow.png',
        flowerPurple: 'assets/sprites/flower-purple.png',
        mountain: 'assets/sprites/mountain-bg.png',
        shrub: 'assets/sprites/shrub.png'
    };

    // Load all textures (or use fallback if not available)
    Object.keys(texturePaths).forEach(key => {
        // For now, we'll create placeholder textures programmatically
        // In production, these would be loaded from actual PNG files
        spriteTextures[key] = createPlaceholderTexture(key);
    });
}

// Create placeholder texture until real sprites are generated
function createPlaceholderTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 256, 256);

    // Draw simple shapes based on type
    switch (type) {
        case 'tree':
            // Triangle for pine tree
            ctx.fillStyle = '#7a9a7a';
            ctx.beginPath();
            ctx.moveTo(128, 50);
            ctx.lineTo(50, 220);
            ctx.lineTo(206, 220);
            ctx.closePath();
            ctx.fill();
            break;
        case 'rock1':
        case 'rock2':
        case 'rock3':
            // Irregular rock shape
            ctx.fillStyle = '#a8a8a0';
            ctx.beginPath();
            ctx.arc(128, 128, 60, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'grass':
            // Grass clump
            ctx.fillStyle = '#9ab89a';
            ctx.beginPath();
            ctx.ellipse(128, 150, 80, 50, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'cloud':
            // Fluffy cloud
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(80, 128, 50, 0, Math.PI * 2);
            ctx.arc(128, 120, 60, 0, Math.PI * 2);
            ctx.arc(176, 128, 50, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'flowerPink':
        case 'flowerYellow':
        case 'flowerPurple':
            const colors = { flowerPink: '#e8a8a8', flowerYellow: '#f5e6a8', flowerPurple: '#d8a8d8' };
            ctx.fillStyle = colors[type];
            ctx.beginPath();
            ctx.arc(128, 100, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8aaa8a';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(128, 120);
            ctx.lineTo(128, 200);
            ctx.stroke();
            break;
        case 'mountain':
            // Mountain silhouette
            ctx.fillStyle = 'rgba(154, 154, 160, 0.5)';
            ctx.beginPath();
            ctx.moveTo(128, 50);
            ctx.lineTo(30, 220);
            ctx.lineTo(226, 220);
            ctx.closePath();
            ctx.fill();
            break;
        case 'shrub':
            // Round bush
            ctx.fillStyle = '#8aaa8a';
            ctx.beginPath();
            ctx.arc(128, 150, 70, 0, Math.PI * 2);
            ctx.fill();
            break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Create a billboard sprite
function createBillboard(texture, width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide
    });

    const sprite = new THREE.Mesh(geometry, material);
    return sprite;
}

// Random helper
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Random integer helper
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if position is far enough from road
function isFarFromRoad(x, z, minDistance) {
    const roadCenter = getRoadCenterAt(z);
    const distance = Math.abs(x - roadCenter.x);
    return distance >= minDistance;
}

// Get terrain slope at position
function getTerrainSlope(x, z) {
    const h0 = getTerrainHeight(x, z);
    const h1 = getTerrainHeight(x + 1, z);
    const h2 = getTerrainHeight(x, z + 1);

    const dx = h1 - h0;
    const dz = h2 - h0;

    const slope = Math.sqrt(dx * dx + dz * dz);
    return Math.atan(slope) * (180 / Math.PI);
}

// Populate chunk with environmental objects
function populateChunk(chunkX, chunkZ) {
    const scene = getScene();
    const objects = [];

    const baseX = chunkX * CHUNK_SIZE;
    const baseZ = chunkZ * CHUNK_SIZE;

    // Pine Trees (10-20 per chunk)
    const treeCount = randomInt(10, 20);
    for (let i = 0; i < treeCount; i++) {
        const x = baseX + random(-CHUNK_SIZE / 2, CHUNK_SIZE / 2);
        const z = baseZ + random(0, CHUNK_SIZE);

        if (isFarFromRoad(x, z, 15)) {
            const slope = getTerrainSlope(x, z);
            if (slope >= 15 && slope <= 45) {
                const height = random(40, 80);
                const scale = random(0.8, 1.3);
                const tree = createBillboard(spriteTextures.tree, height * scale, height * scale);
                tree.position.set(x, getTerrainHeight(x, z) + height * scale / 2, z);
                tree.userData.isBillboard = true;
                scene.add(tree);
                objects.push(tree);
            }
        }
    }

    // Rocks (30-50 per chunk)
    const rockCount = randomInt(30, 50);
    for (let i = 0; i < rockCount; i++) {
        const x = baseX + random(-CHUNK_SIZE / 2, CHUNK_SIZE / 2);
        const z = baseZ + random(0, CHUNK_SIZE);

        if (isFarFromRoad(x, z, 5)) {
            const sizeType = Math.random();
            let size;
            if (sizeType < 0.6) size = random(3, 5);        // Small
            else if (sizeType < 0.9) size = random(8, 12);  // Medium
            else size = random(15, 25);                     // Large

            const rockTexture = spriteTextures[`rock${randomInt(1, 3)}`];
            const rock = createBillboard(rockTexture, size, size);
            rock.position.set(x, getTerrainHeight(x, z) + size / 2, z);
            rock.rotation.y = random(0, Math.PI * 2);
            rock.userData.isBillboard = true;
            scene.add(rock);
            objects.push(rock);
        }
    }

    // Grass patches (50-80 per chunk)
    const grassCount = randomInt(50, 80);
    for (let i = 0; i < grassCount; i++) {
        const x = baseX + random(-CHUNK_SIZE / 2, CHUNK_SIZE / 2);
        const z = baseZ + random(0, CHUNK_SIZE);

        const distToRoad = Math.abs(x - getRoadCenterAt(z).x);
        if (distToRoad >= 3 && distToRoad <= 20) {
            const slope = getTerrainSlope(x, z);
            if (slope <= 20) {
                const width = random(8, 15);
                const height = random(5, 8);
                const scale = random(0.7, 1.2);
                const grass = createBillboard(spriteTextures.grass, width * scale, height * scale);
                grass.position.set(x, getTerrainHeight(x, z) + height * scale / 2, z);
                grass.userData.isBillboard = true;
                scene.add(grass);
                objects.push(grass);
            }
        }
    }

    // Clouds (3-5 per chunk)
    const cloudCount = randomInt(3, 5);
    for (let i = 0; i < cloudCount; i++) {
        const x = baseX + random(-CHUNK_SIZE, CHUNK_SIZE);
        const z = baseZ + random(0, CHUNK_SIZE);
        const y = random(150, 250);
        const width = random(100, 200);
        const height = random(30, 50);

        const cloud = createBillboard(spriteTextures.cloud, width, height);
        cloud.position.set(x, y, z);
        cloud.userData.isBillboard = true;
        scene.add(cloud);
        objects.push(cloud);
    }

    // Wildflowers (15-25 per chunk)
    const flowerCount = randomInt(15, 25);
    const flowerTypes = ['flowerPink', 'flowerYellow', 'flowerPurple'];
    for (let i = 0; i < flowerCount; i++) {
        const x = baseX + random(-CHUNK_SIZE / 2, CHUNK_SIZE / 2);
        const z = baseZ + random(0, CHUNK_SIZE);

        const distToRoad = Math.abs(x - getRoadCenterAt(z).x);
        if (distToRoad >= 5 && distToRoad <= 25) {
            const slope = getTerrainSlope(x, z);
            if (slope <= 15) {
                const flowerType = flowerTypes[randomInt(0, 2)];
                const height = random(20, 35);
                const scale = random(0.8, 1.0);
                const flower = createBillboard(spriteTextures[flowerType], height * scale * 0.5, height * scale);
                flower.position.set(x, getTerrainHeight(x, z) + height * scale / 2, z);
                flower.userData.isBillboard = true;
                scene.add(flower);
                objects.push(flower);
            }
        }
    }

    // Distant mountain silhouettes (2-3 per chunk)
    const mountainCount = randomInt(2, 3);
    for (let i = 0; i < mountainCount; i++) {
        const x = baseX + random(-CHUNK_SIZE, CHUNK_SIZE);
        const z = baseZ + random(CHUNK_SIZE / 2, CHUNK_SIZE);
        const distance = random(800, 1500);
        const width = random(300, 500);
        const height = random(150, 300);

        const mountain = createBillboard(spriteTextures.mountain, width, height);
        mountain.position.set(x, height / 2, z + distance);
        mountain.userData.isBillboard = true;
        scene.add(mountain);
        objects.push(mountain);
    }

    // Shrubs (20-35 per chunk)
    const shrubCount = randomInt(20, 35);
    for (let i = 0; i < shrubCount; i++) {
        const x = baseX + random(-CHUNK_SIZE / 2, CHUNK_SIZE / 2);
        const z = baseZ + random(0, CHUNK_SIZE);

        if (isFarFromRoad(x, z, 12)) {
            const slope = getTerrainSlope(x, z);
            if (slope <= 50) {
                const width = random(25, 40);
                const height = random(15, 25);
                const scale = random(0.8, 1.4);
                const shrub = createBillboard(spriteTextures.shrub, width * scale, height * scale);
                shrub.position.set(x, getTerrainHeight(x, z) + height * scale / 2, z);
                shrub.userData.isBillboard = true;
                scene.add(shrub);
                objects.push(shrub);
            }
        }
    }

    const key = `${chunkX},${chunkZ}`;
    environmentChunks.set(key, objects);
}

// Update environment objects (make billboards face camera)
function updateEnvironment(cameraPosition) {
    const camera = getCamera();
    if (!camera) return;

    const scene = getScene();
    scene.traverse((object) => {
        if (object.userData.isBillboard) {
            object.lookAt(camera.position);
        }
    });
}

// Remove chunk objects
function removeChunkObjects(chunkX, chunkZ) {
    const key = `${chunkX},${chunkZ}`;
    const objects = environmentChunks.get(key);

    if (objects) {
        const scene = getScene();
        objects.forEach(obj => {
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        environmentChunks.delete(key);
    }
}

// Update environment chunks based on camera position
function updateEnvironmentChunks(cameraPosition) {
    const currentChunkX = Math.floor(cameraPosition.x / CHUNK_SIZE);
    const currentChunkZ = Math.floor(cameraPosition.z / CHUNK_SIZE);

    // Populate new chunks
    for (let x = currentChunkX - 1; x <= currentChunkX + 1; x++) {
        for (let z = currentChunkZ - 1; z <= currentChunkZ + RENDER_DISTANCE; z++) {
            const key = `${x},${z}`;
            if (!environmentChunks.has(key)) {
                populateChunk(x, z);
            }
        }
    }

    // Remove distant chunks
    const chunksToRemove = [];
    environmentChunks.forEach((objects, key) => {
        const [chunkX, chunkZ] = key.split(',').map(Number);
        const distance = chunkZ - currentChunkZ;

        if (distance < -DISPOSE_DISTANCE || Math.abs(chunkX - currentChunkX) > 2) {
            chunksToRemove.push(key);
        }
    });

    chunksToRemove.forEach(key => {
        const [chunkX, chunkZ] = key.split(',').map(Number);
        removeChunkObjects(chunkX, chunkZ);
    });
}
