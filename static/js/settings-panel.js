/**
 * Settings Panel Overlay for Speed Verse
 * Injects a unified settings panel into the game UI
 */

(function() {
  'use strict';

  let settingsPanelOpen = false;
  let stateObjects = {}; // Will store references to game state objects

  // Wait for the page to be fully loaded and React to render
  function init() {
    let initAttempts = 0;
    const maxAttempts = 60; // 30 seconds with 500ms checks
    let checkInterval = null;

    function tryInitialize() {
      initAttempts++;

      // Check if required elements exist
      const menuBarLeft = document.getElementById('menu-bar-left');

      if (menuBarLeft) {
        // Elements exist - initialize!
        clearInterval(checkInterval);
        try {
          findStateObjects();
          injectStyles();
          injectSettingsIcon();
          createSettingsPanel();
          setupEventListeners();
          removeMenuBarButtons();
          console.log('[Settings Panel] Initialized successfully');
        } catch (error) {
          console.error('[Settings Panel] Initialization error:', error);
        }
      } else if (initAttempts >= maxAttempts) {
        // Timeout - give up silently
        clearInterval(checkInterval);
        console.log('[Settings Panel] Menu bar not found after 30s, giving up');
      }
      // Otherwise keep checking
    }

    // Start checking every 500ms
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        checkInterval = setInterval(tryInitialize, 500);
      });
    } else {
      checkInterval = setInterval(tryInitialize, 500);
    }
  }

  /**
   * Find and store references to game state objects
   * These are exposed on the window object by the game
   */
  function findStateObjects() {
    // Find the autodrive state object (referenced as 'y' in minified code)
    // We'll need to access it through the React component instance
    // For now, we'll interact directly with the DOM elements

    // Store reference to existing autodrive button for synchronization
    stateObjects.autodriveButton = document.getElementById('autodrive');

    // Store references to menu items BEFORE they are removed
    stateObjects.sceneMenuItems = [];
    stateObjects.weatherMenuItems = [];
    stateObjects.vehicleMenuItems = [];
    stateObjects.inputMenuItems = [];

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      const img = item.querySelector('img');
      if (img && img.alt) {
        const alt = img.alt;

        // Categorize menu items by type
        // Scenes: Earth, Mars, Moon, Venus
        if (alt === 'Earth' || alt === 'Mars' || alt === 'Moon' || alt === 'Venus') {
          stateObjects.sceneMenuItems.push({ name: alt, element: item });
        }
        // Weather: Sunrise, Clear, Rain, Sunset, Night
        else if (alt === 'Sunrise' || alt === 'Clear' || alt === 'Rain' || alt === 'Sunset' || alt === 'Night') {
          stateObjects.weatherMenuItems.push({ name: alt, element: item });
        }
        // Vehicles: Car, Bus, Bike
        else if (alt === 'Car' || alt === 'Bus' || alt === 'Bike') {
          stateObjects.vehicleMenuItems.push({ name: alt, element: item });
        }
        // Input methods: Mouse, Keyboard
        else if (alt === 'Mouse' || alt === 'Keyboard') {
          stateObjects.inputMenuItems.push({ name: alt, element: item });
        }
      }
    });

    console.log('[Settings Panel] State objects located');
    console.log('[Settings Panel] Stored menu items:', {
      scenes: stateObjects.sceneMenuItems.length,
      weather: stateObjects.weatherMenuItems.length,
      vehicles: stateObjects.vehicleMenuItems.length,
      inputs: stateObjects.inputMenuItems.length
    });
  }

  /**
   * Inject settings icon into menu bar
   */
  function injectSettingsIcon() {
    const menuBarLeft = document.getElementById('menu-bar-left');
    if (!menuBarLeft) {
      console.error('[Settings Panel] Could not find menu-bar-left');
      return;
    }

    // Create settings menu item
    const settingsItem = document.createElement('div');
    settingsItem.className = 'menu-item';
    settingsItem.id = 'settings-menu-item';
    settingsItem.tabIndex = -1;

    // Create icon element
    const iconImg = document.createElement('img');
    iconImg.className = 'menu-icon';
    iconImg.src = './static/media/config.fa1e0797.svg';
    iconImg.alt = 'Settings';

    settingsItem.appendChild(iconImg);

    // Add click handler to toggle panel
    settingsItem.addEventListener('mousedown', toggleSettingsPanel);

    // Add mouse enter/leave handlers to disable game mouse controls
    settingsItem.addEventListener('mouseenter', () => {
      if (window.p && window.p.setMouseEnabled) {
        window.p.setMouseEnabled(false);
      }
    });

    settingsItem.addEventListener('mouseleave', () => {
      if (window.p && window.p.setMouseEnabled) {
        window.p.setMouseEnabled(true);
      }
    });

    // Insert as 4th item (after scene, weather, terrain, before divider)
    // Find the first vertical divider
    const divider = menuBarLeft.querySelector('.menu-bar-vertical-divider');
    if (divider) {
      menuBarLeft.insertBefore(settingsItem, divider);
    } else {
      menuBarLeft.appendChild(settingsItem);
    }

    console.log('[Settings Panel] Settings icon injected');
  }

  /**
   * Remove all menu bar buttons except the settings icon
   * This creates a cleaner UI with all controls in the settings panel
   */
  function removeMenuBarButtons() {
    const menuBarLeft = document.getElementById('menu-bar-left');
    const menuBarRight = document.getElementById('menu-bar-right');

    if (menuBarLeft) {
      // Remove all children except settings icon and its following divider
      const settingsIcon = document.getElementById('settings-menu-item');
      const children = Array.from(menuBarLeft.children);

      children.forEach(child => {
        // Keep settings icon and the divider immediately after it
        if (child.id === 'settings-menu-item') {
          return; // Keep settings icon
        }
        if (child === settingsIcon?.nextElementSibling &&
            child.classList.contains('menu-bar-vertical-divider')) {
          return; // Keep divider after settings icon
        }
        // Remove everything else
        child.remove();
      });

      console.log('[Settings Panel] Removed left menu bar buttons');
    }

    if (menuBarRight) {
      // Remove all children from right side
      while (menuBarRight.firstChild) {
        menuBarRight.removeChild(menuBarRight.firstChild);
      }
      console.log('[Settings Panel] Removed right menu bar buttons');
    }
  }

  /**
   * Inject CSS styles for the settings panel
   */
  function injectStyles() {
    const styleId = 'settings-panel-styles';
    if (document.getElementById(styleId)) return; // Already injected

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Settings panel width */
      #settings-panel {
        width: 320px !important;
      }

      /* Expand button container */
      .settings-expand-container {
        margin-bottom: 8px;
      }

      /* Expand button */
      .settings-expand-button {
        width: 100%;
        padding: 12px;
        background: #cccccc;
        border: 1px solid #999;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        cursor: pointer;
        font-family: 'Jura', sans-serif;
        color: #000;
      }

      .settings-expand-button:hover {
        background: #d9d9d9;
      }

      .expand-arrow {
        font-size: 12px;
      }

      /* Option list */
      .settings-option-list {
        background: #fff;
        border: 1px solid #999;
        border-top: none;
        max-height: 200px;
        overflow-y: auto;
      }

      /* Option item */
      .settings-option-item {
        padding: 10px 12px;
        border-bottom: 1px solid #e0e0e0;
        font-size: 13px;
        cursor: pointer;
        font-family: 'Jura', sans-serif;
        color: #000;
      }

      .settings-option-item:last-child {
        border-bottom: none;
      }

      .settings-option-item:hover {
        background: #f5f5f5;
      }

      .settings-option-item.selected {
        background: #e0e0e0;
        font-weight: bold;
      }

      /* Button group */
      .settings-button-group {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      /* Button */
      .settings-button {
        flex: 1;
        padding: 10px;
        background: #cccccc;
        border: 1px solid #999;
        text-align: center;
        font-size: 12px;
        cursor: pointer;
        font-family: 'Jura', sans-serif;
        color: #000;
      }

      .settings-button:hover {
        background: #d9d9d9;
      }

      .settings-button.active {
        background: #999;
        color: #fff;
        font-weight: bold;
      }

      /* Slider container */
      .settings-slider-container {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: #fff;
        border: 1px solid #999;
      }

      /* Slider */
      .settings-slider {
        flex: 1;
        height: 6px;
        background: #e0e0e0;
        border: 1px solid #999;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
      }

      .settings-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: #999;
        cursor: pointer;
        border-radius: 50%;
      }

      .settings-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #999;
        cursor: pointer;
        border-radius: 50%;
        border: none;
      }

      /* Mute button */
      .settings-mute-button {
        width: 32px;
        height: 32px;
        background: #cccccc;
        border: 1px solid #999;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
      }

      .settings-mute-button:hover {
        background: #d9d9d9;
      }

      .settings-mute-button img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /* Settings active state for icon */
      #settings-menu-item.settings-active {
        background: rgba(255, 255, 255, 0.2);
      }
    `;

    document.head.appendChild(style);
    console.log('[Settings Panel] Styles injected');
  }

  /**
   * Create the settings panel HTML structure
   */
  function createSettingsPanel() {
    const panel = document.createElement('div');
    panel.className = 'menu-panel';
    panel.id = 'settings-panel';
    panel.style.display = 'none'; // Initially hidden

    panel.innerHTML = `
      <div class="menu-panel-content">
        <!-- Section 1: Driving Controls -->
        <div class="settings-section">
          <div class="settings-section-title">DRIVING CONTROLS</div>

          <div class="settings-item" data-control="autodrive">
            <div class="settings-checkbox" id="settings-autodrive-checkbox"></div>
            <span>Autodrive</span>
          </div>

          <div class="settings-item" data-control="headlights">
            <div class="settings-checkbox" id="settings-headlights-checkbox"></div>
            <span>Headlights</span>
          </div>
        </div>

        <!-- Section 2: Environment (Scene & Weather) -->
        <div class="settings-section">
          <div class="settings-section-title">ENVIRONMENT</div>

          <!-- Scene Selector -->
          <div class="settings-expand-container">
            <button class="settings-expand-button" id="scene-expand-button">
              <span><strong>Scene:</strong> <span id="scene-current-name">Loading...</span></span>
              <span class="expand-arrow">▼</span>
            </button>
            <div class="settings-option-list" id="scene-option-list" style="display: none;"></div>
          </div>

          <!-- Weather Selector -->
          <div class="settings-expand-container">
            <button class="settings-expand-button" id="weather-expand-button">
              <span><strong>Weather:</strong> <span id="weather-current-name">Loading...</span></span>
              <span class="expand-arrow">▼</span>
            </button>
            <div class="settings-option-list" id="weather-option-list" style="display: none;"></div>
          </div>
        </div>

        <!-- Section 3: Vehicle -->
        <div class="settings-section">
          <div class="settings-section-title">VEHICLE</div>
          <div class="settings-button-group">
            <button class="settings-button" data-vehicle="car">Car</button>
            <button class="settings-button" data-vehicle="bus">Bus</button>
            <button class="settings-button" data-vehicle="bike">Bike</button>
          </div>
        </div>

        <!-- Section 4: Controls -->
        <div class="settings-section">
          <div class="settings-section-title">CONTROLS</div>
          <div class="settings-button-group">
            <button class="settings-button" data-input="2">Keyboard</button>
            <button class="settings-button" data-input="1">Mouse</button>
          </div>
        </div>

        <!-- Section 5: Audio -->
        <div class="settings-section">
          <div class="settings-section-title">AUDIO</div>
          <div class="settings-slider-container">
            <input type="range" class="settings-slider" id="volume-slider" min="0" max="1" step="0.01" value="0.5">
            <button class="settings-mute-button" id="mute-button">
              <img src="./static/media/vol_high.30de055e.svg" alt="Volume" id="volume-icon">
            </button>
          </div>
        </div>

        <!-- Section 6: Display -->
        <div class="settings-section">
          <div class="settings-section-title">DISPLAY</div>

          <div class="settings-item" data-control="showui">
            <div class="settings-checkbox" id="settings-showui-checkbox"></div>
            <span>Show UI Elements</span>
          </div>
        </div>

        <!-- Section 7: Quick Actions -->
        <div class="settings-section">
          <div class="settings-section-title">QUICK ACTIONS</div>

          <div class="settings-action-item">
            <button class="settings-action-button" data-action="reset">Reset Vehicle (R)</button>
          </div>

          <div class="settings-action-item">
            <button class="settings-action-button" data-action="camera">Change Camera (C)</button>
          </div>
        </div>
      </div>
    `;

    // Add mouse enter/leave handlers to disable game mouse controls
    panel.addEventListener('mouseenter', () => {
      if (window.p && window.p.setMouseEnabled) {
        window.p.setMouseEnabled(false);
      }
    });

    panel.addEventListener('mouseleave', () => {
      if (window.p && window.p.setMouseEnabled) {
        window.p.setMouseEnabled(true);
      }
    });

    // Append to body or menu-bar
    const menuBar = document.getElementById('menu-bar');
    if (menuBar && menuBar.parentNode) {
      menuBar.parentNode.insertBefore(panel, menuBar.nextSibling);
    } else {
      document.body.appendChild(panel);
    }

    console.log('[Settings Panel] Panel created');
  }

  /**
   * Setup event listeners for all controls
   */
  function setupEventListeners() {
    // Autodrive toggle
    const autodriveItem = document.querySelector('[data-control="autodrive"]');
    if (autodriveItem) {
      autodriveItem.addEventListener('click', () => {
        const autodriveButton = document.getElementById('autodrive');
        if (autodriveButton) {
          autodriveButton.click();
          updateCheckboxes();
        }
      });
    }

    // Headlights toggle
    const headlightsItem = document.querySelector('[data-control="headlights"]');
    if (headlightsItem) {
      headlightsItem.addEventListener('click', () => {
        simulateKeyPress('H');
        setTimeout(updateCheckboxes, 100);
      });
    }

    // Show UI toggle
    const showUIItem = document.querySelector('[data-control="showui"]');
    if (showUIItem) {
      showUIItem.addEventListener('click', () => {
        simulateKeyPress('U');
        setTimeout(updateCheckboxes, 100);
      });
    }

    // Reset Vehicle button
    const resetButton = document.querySelector('[data-action="reset"]');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        simulateKeyPress('R');
      });
    }

    // Change Camera button
    const cameraButton = document.querySelector('[data-action="camera"]');
    if (cameraButton) {
      cameraButton.addEventListener('click', () => {
        simulateKeyPress('C');
      });
    }

    // Scene expand/collapse
    const sceneExpandButton = document.getElementById('scene-expand-button');
    const sceneOptionList = document.getElementById('scene-option-list');
    if (sceneExpandButton && sceneOptionList) {
      sceneExpandButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = sceneOptionList.style.display === 'block';
        sceneOptionList.style.display = isExpanded ? 'none' : 'block';
        sceneExpandButton.querySelector('.expand-arrow').textContent = isExpanded ? '▼' : '▲';
      });
    }

    // Weather expand/collapse
    const weatherExpandButton = document.getElementById('weather-expand-button');
    const weatherOptionList = document.getElementById('weather-option-list');
    if (weatherExpandButton && weatherOptionList) {
      weatherExpandButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = weatherOptionList.style.display === 'block';
        weatherOptionList.style.display = isExpanded ? 'none' : 'block';
        weatherExpandButton.querySelector('.expand-arrow').textContent = isExpanded ? '▼' : '▲';
      });
    }

    // Vehicle buttons
    const vehicleButtons = document.querySelectorAll('[data-vehicle]');
    vehicleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const vehicleType = button.dataset.vehicle;
        changeVehicle(vehicleType);
      });
    });

    // Input method buttons
    const inputButtons = document.querySelectorAll('[data-input]');
    inputButtons.forEach(button => {
      button.addEventListener('click', () => {
        const inputMethod = parseInt(button.dataset.input);
        changeInputMethod(inputMethod);
      });
    });

    // Volume slider
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        setVolume(parseFloat(e.target.value));
      });
    }

    // Mute button
    const muteButton = document.getElementById('mute-button');
    if (muteButton) {
      muteButton.addEventListener('click', toggleMute);
    }

    // Only start intervals if required elements exist
    const settingsPanel = document.getElementById('settings-panel');
    const menuBarLeft = document.getElementById('menu-bar-left');

    if (settingsPanel && menuBarLeft) {
      // Setup periodic updates to keep UI in sync
      setInterval(() => {
        // Safety check before each update
        if (document.getElementById('settings-panel')) {
          updateAllControls();
        }
      }, 500);

      // Setup periodic visibility enforcement
      setInterval(() => {
        // Safety check before each update
        if (document.getElementById('settings-panel')) {
          ensureSettingsPanelVisible();
        }
      }, 500);
    }

    // Initialize scene and weather lists
    setTimeout(initializeSceneList, 500);
    setTimeout(initializeWeatherList, 500);

    console.log('[Settings Panel] Event listeners setup');
  }

  /**
   * Toggle settings panel open/closed
   */
  function toggleSettingsPanel() {
    settingsPanelOpen = !settingsPanelOpen;

    const panel = document.getElementById('settings-panel');
    const menuItem = document.getElementById('settings-menu-item');
    const pauseDom = document.getElementById('game-paused');

    if (panel) {
      panel.style.display = settingsPanelOpen ? 'block' : 'none';
    }

    if (menuItem) {
      if (settingsPanelOpen) {
        menuItem.classList.add('settings-active');
      } else {
        menuItem.classList.remove('settings-active');
      }
    }

    // Pause/unpause game based on settings panel state
    if (pauseDom) {
      pauseDom.style.display = settingsPanelOpen ? 'block' : 'none';
    }

    // Update checkboxes when opening
    if (settingsPanelOpen) {
      updateCheckboxes();
    }
  }

  /**
   * Update checkbox states based on actual game state
   */
  function updateCheckboxes() {
    // Autodrive - check if autodrive button has active class
    const autodriveButton = document.getElementById('autodrive');
    const autodriveCheckbox = document.getElementById('settings-autodrive-checkbox');
    if (autodriveButton && autodriveCheckbox) {
      const isActive = autodriveButton.classList.contains('autodrive-active');
      if (isActive) {
        autodriveCheckbox.classList.add('active');
      } else {
        autodriveCheckbox.classList.remove('active');
      }
    }

    // Headlights - we'll need to track this with a custom state since there's no visible indicator
    // For now, we'll just maintain internal state

    // Show UI - check if main UI elements are visible
    const uiElement = document.getElementById('autodrive');
    const showUICheckbox = document.getElementById('settings-showui-checkbox');
    if (uiElement && showUICheckbox) {
      const isVisible = uiElement.style.display !== 'none' &&
                       window.getComputedStyle(uiElement).display !== 'none';
      if (isVisible) {
        showUICheckbox.classList.add('active');
      } else {
        showUICheckbox.classList.remove('active');
      }
    }
  }

  /**
   * Ensure settings panel and menu bar remain visible when UI is hidden
   * This function can be called periodically to enforce this rule
   */
  function ensureSettingsPanelVisible() {
    const settingsPanel = document.getElementById('settings-panel');
    const menuBar = document.getElementById('menu-bar');

    if (settingsPanel && typeof settingsPanelOpen !== 'undefined') {
      // Only manipulate if panel exists
      const computedStyle = window.getComputedStyle(settingsPanel);
      if (settingsPanel.style.display === 'none' && settingsPanelOpen) {
        settingsPanel.style.display = 'block';
      }
    }

    if (menuBar) {
      // Always make sure menu bar is not hidden by UI toggle
      const computedStyle = window.getComputedStyle(menuBar);
      if (menuBar.style.display === 'none') {
        menuBar.style.display = 'flex';
      }
    }
  }

  /**
   * Initialize scene list from game state
   */
  function initializeSceneList() {
    const sceneOptionList = document.getElementById('scene-option-list');
    if (!sceneOptionList) return;

    // Find all scene menu items in the original menu
    const sceneMenuItems = document.querySelectorAll('.menu-item');
    const scenes = [];

    sceneMenuItems.forEach(item => {
      const img = item.querySelector('img');
      if (img && img.alt && img.alt !== 'Settings' && img.alt !== 'Weather') {
        // This is likely a scene item (Earth, Mars, Moon, etc.)
        scenes.push({
          name: img.alt,
          element: item
        });
      }
    });

    // If we found scenes in the menu, populate the list
    if (scenes.length > 0) {
      sceneOptionList.innerHTML = '';
      scenes.forEach(scene => {
        const option = document.createElement('div');
        option.className = 'settings-option-item';
        option.textContent = scene.name;
        option.addEventListener('click', () => {
          scene.element.click();
          updateSceneDisplay();
          sceneOptionList.style.display = 'none';
          document.getElementById('scene-expand-button').querySelector('.expand-arrow').textContent = '▼';
        });
        sceneOptionList.appendChild(option);
      });
    }

    updateSceneDisplay();
  }

  /**
   * Initialize weather list from game state
   */
  function initializeWeatherList() {
    const weatherOptionList = document.getElementById('weather-option-list');
    if (!weatherOptionList) return;

    // Find weather menu items
    const weatherMenuItems = document.querySelectorAll('.menu-item');
    const weathers = [];

    weatherMenuItems.forEach(item => {
      const img = item.querySelector('img');
      if (img && img.alt && (
        img.alt === 'Sunrise' || img.alt === 'Clear' ||
        img.alt === 'Rain' || img.alt === 'Sunset' || img.alt === 'Night'
      )) {
        weathers.push({
          name: img.alt,
          element: item
        });
      }
    });

    // If we found weathers, populate the list
    if (weathers.length > 0) {
      weatherOptionList.innerHTML = '';
      weathers.forEach(weather => {
        const option = document.createElement('div');
        option.className = 'settings-option-item';
        option.textContent = weather.name;
        option.addEventListener('click', () => {
          weather.element.click();
          updateWeatherDisplay();
          weatherOptionList.style.display = 'none';
          document.getElementById('weather-expand-button').querySelector('.expand-arrow').textContent = '▼';
        });
        weatherOptionList.appendChild(option);
      });
    }

    updateWeatherDisplay();
  }

  /**
   * Update scene display in settings panel
   */
  function updateSceneDisplay() {
    const sceneNameElement = document.getElementById('scene-current-name');
    if (!sceneNameElement) return;

    // Try to find the active scene from menu items
    const sceneItems = document.querySelectorAll('.menu-item');
    let foundScene = false;

    sceneItems.forEach(item => {
      if (item.classList.contains('menu-item-active')) {
        const img = item.querySelector('img');
        if (img && img.alt) {
          sceneNameElement.textContent = img.alt;
          foundScene = true;
        }
      }
    });

    if (!foundScene) {
      sceneNameElement.textContent = 'Unknown';
    }
  }

  /**
   * Update weather display in settings panel
   */
  function updateWeatherDisplay() {
    const weatherNameElement = document.getElementById('weather-current-name');
    if (!weatherNameElement) return;

    // Try to find active weather indicator
    const weatherItems = document.querySelectorAll('.menu-item');
    let foundWeather = false;

    weatherItems.forEach(item => {
      if (item.classList.contains('menu-item-active')) {
        const img = item.querySelector('img');
        if (img && img.alt && (
          img.alt === 'Sunrise' || img.alt === 'Clear' ||
          img.alt === 'Rain' || img.alt === 'Sunset' || img.alt === 'Night'
        )) {
          weatherNameElement.textContent = img.alt;
          foundWeather = true;
        }
      }
    });

    if (!foundWeather) {
      weatherNameElement.textContent = 'Unknown';
    }
  }

  /**
   * Change vehicle type
   */
  function changeVehicle(vehicleType) {
    // Find the vehicle selector in the menu
    const vehicleMenuItems = document.querySelectorAll('.menu-item');

    vehicleMenuItems.forEach(item => {
      const img = item.querySelector('img');
      if (img && img.alt) {
        const alt = img.alt.toLowerCase();
        if (alt === vehicleType || alt.includes(vehicleType)) {
          item.click();
          setTimeout(updateVehicleButtons, 100);
        }
      }
    });
  }

  /**
   * Update vehicle button states
   */
  function updateVehicleButtons() {
    const vehicleButtons = document.querySelectorAll('[data-vehicle]');
    const vehicleMenuItems = document.querySelectorAll('.menu-item');

    vehicleButtons.forEach(button => {
      button.classList.remove('active');
    });

    vehicleMenuItems.forEach(item => {
      if (item.classList.contains('menu-item-active')) {
        const img = item.querySelector('img');
        if (img && img.alt) {
          const alt = img.alt.toLowerCase();
          vehicleButtons.forEach(button => {
            if (alt.includes(button.dataset.vehicle)) {
              button.classList.add('active');
            }
          });
        }
      }
    });
  }

  /**
   * Change input method
   */
  function changeInputMethod(inputMethod) {
    // Find the input selector in the menu
    const inputMenuItems = document.querySelectorAll('.menu-item');

    inputMenuItems.forEach(item => {
      const img = item.querySelector('img');
      if (img && img.alt) {
        const alt = img.alt.toLowerCase();
        // Input method: 1 = mouse, 2 = keyboard
        if ((inputMethod === 1 && alt.includes('mouse')) ||
            (inputMethod === 2 && alt.includes('keyboard'))) {
          item.click();
          setTimeout(updateInputButtons, 100);
        }
      }
    });
  }

  /**
   * Update input method button states
   */
  function updateInputButtons() {
    const inputButtons = document.querySelectorAll('[data-input]');
    const inputMenuItems = document.querySelectorAll('.menu-item');

    inputButtons.forEach(button => {
      button.classList.remove('active');
    });

    inputMenuItems.forEach(item => {
      if (item.classList.contains('menu-item-active')) {
        const img = item.querySelector('img');
        if (img && img.alt) {
          const alt = img.alt.toLowerCase();
          inputButtons.forEach(button => {
            const method = parseInt(button.dataset.input);
            if ((method === 1 && alt.includes('mouse')) ||
                (method === 2 && alt.includes('keyboard'))) {
              button.classList.add('active');
            }
          });
        }
      }
    });
  }

  /**
   * Set audio volume
   */
  function setVolume(volume) {
    // Store volume for mute/unmute
    if (volume > 0) {
      stateObjects.previousVolume = volume;
    }

    // Find and click on audio level controls in the menu
    // Try to interact with the volume slider in the original menu if it exists
    const volumeSliders = document.querySelectorAll('input[type="range"]');
    volumeSliders.forEach(slider => {
      if (slider.id !== 'volume-slider') { // Not our settings panel slider
        slider.value = volume;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    updateVolumeIcon(volume);
  }

  /**
   * Toggle mute/unmute
   */
  function toggleMute() {
    const volumeSlider = document.getElementById('volume-slider');
    if (!volumeSlider) return;

    const currentVolume = parseFloat(volumeSlider.value);

    if (currentVolume > 0) {
      // Mute: store current volume and set to 0
      stateObjects.previousVolume = currentVolume;
      volumeSlider.value = 0;
      setVolume(0);
    } else {
      // Unmute: restore previous volume (or default to 0.5)
      const restoreVolume = stateObjects.previousVolume || 0.5;
      volumeSlider.value = restoreVolume;
      setVolume(restoreVolume);
    }
  }

  /**
   * Update volume icon based on current volume
   */
  function updateVolumeIcon(volume) {
    const volumeIcon = document.getElementById('volume-icon');
    if (!volumeIcon) return;

    if (volume === 0) {
      volumeIcon.src = './static/media/vol_off.11497865.svg';
    } else {
      volumeIcon.src = './static/media/vol_high.30de055e.svg';
    }
  }

  /**
   * Update all controls to match current game state
   */
  function updateAllControls() {
    // Early exit if settings panel doesn't exist
    if (!document.getElementById('settings-panel')) {
      return;
    }

    updateCheckboxes();
    updateSceneDisplay();
    updateWeatherDisplay();
    updateVehicleButtons();
    updateInputButtons();

    // Update volume slider and icon
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      updateVolumeIcon(parseFloat(volumeSlider.value));
    }
  }

  /**
   * Simulate a keyboard press to trigger game shortcuts
   */
  function simulateKeyPress(key) {
    const event = new KeyboardEvent('keydown', {
      key: key,
      code: 'Key' + key,
      keyCode: key.charCodeAt(0),
      which: key.charCodeAt(0),
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);

    // Also trigger keyup
    const eventUp = new KeyboardEvent('keyup', {
      key: key,
      code: 'Key' + key,
      keyCode: key.charCodeAt(0),
      which: key.charCodeAt(0),
      bubbles: true,
      cancelable: true
    });
    setTimeout(() => document.dispatchEvent(eventUp), 50);
  }

  // Initialize on page load
  init();

})();
