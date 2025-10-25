// Keyboard Input Controls

let input = {
    forward: false,
    brake: false,
    left: false,
    right: false
};

// Setup keyboard event listeners
function setupControls() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

// Handle key press
function onKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            input.forward = true;
            break;
        case 's':
        case 'arrowdown':
            input.brake = true;
            break;
        case 'a':
        case 'arrowleft':
            input.left = true;
            break;
        case 'd':
        case 'arrowright':
            input.right = true;
            break;
    }
}

// Handle key release
function onKeyUp(event) {
    switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            input.forward = false;
            break;
        case 's':
        case 'arrowdown':
            input.brake = false;
            break;
        case 'a':
        case 'arrowleft':
            input.left = false;
            break;
        case 'd':
        case 'arrowright':
            input.right = false;
            break;
    }
}

// Get current input state
function getInput() {
    return input;
}
