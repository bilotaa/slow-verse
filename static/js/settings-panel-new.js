/**
 * Redesigned Settings Panel with Cyberpunk/Synthwave Theme
 * Speed Verse Game UI Overhaul
 */

(function() {
  'use strict';

  let settingsModalOpen = false;
  let stateObjects = {};
  let trajectoryPathData = [];
  let currentMusicTrack = {
    title: 'Midnight Drive',
    artist: 'Synthwave Mix',
    genre: 'Synthwave'
  };

  /**
   * Initialize on page load
   */
  function init() {
    let initAttempts = 0;
    const maxAttempts = 60;
    let checkInterval = null;

    function tryInitialize() {
      initAttempts++;

      // Check if game elements exist
      const menuBarLeft = document.getElementById('menu-bar-left');
      const mainStats = document.getElementById('main-stats');

      if (menuBarLeft && mainStats) {
        clearInterval(checkInterval);
        try {
          findStateObjects();
          injectAllUIElements();
          setupAllEventListeners();
          startAutodriveMonitoring();
          console.log('[UI Overhaul] Initialization complete');
        } catch (error) {
          console.error('[UI Overhaul] Initialization error:', error);
        }
      } else if (initAttempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('[UI Overhaul] Timeout after 30s');
      }
    }

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
   */
  function findStateObjects() {
    stateObjects.autodriveButton = document.getElementById('autodrive');

    // Store menu items before they're hidden
    stateObjects.sceneMenuItems = [];
    stateObjects.weatherMenuItems = [];
    stateObjects.vehicleMenuItems = [];
    stateObjects.inputMenuItems = [];

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      const img = item.querySelector('img');
      if (img && img.alt) {
        const alt = img.alt;
        if (alt === 'Earth' || alt === 'Mars' || alt === 'Moon' || alt === 'Venus') {
          stateObjects.sceneMenuItems.push({ name: alt, element: item });
        } else if (alt === 'Sunrise' || alt === 'Clear' || alt === 'Rain' || alt === 'Sunset' || alt === 'Night') {
          stateObjects.weatherMenuItems.push({ name: alt, element: item });
        } else if (alt === 'Car' || alt === 'Bus' || alt === 'Bike') {
          stateObjects.vehicleMenuItems.push({ name: alt, element: item });
        } else if (alt === 'Mouse' || alt === 'Keyboard') {
          stateObjects.inputMenuItems.push({ name: alt, element: item });
        }
      }
    });

    console.log('[UI Overhaul] State objects located:', {
      scenes: stateObjects.sceneMenuItems.length,
      weather: stateObjects.weatherMenuItems.length,
      vehicles: stateObjects.vehicleMenuItems.length,
      inputs: stateObjects.inputMenuItems.length
    });
  }

  /**
   * Inject all new UI elements
   */
  function injectAllUIElements() {
    injectTopRightControls();
    injectDriveModeIndicator();
    injectMusicPlayerWidget();
    injectTrajectoryMap();
    injectModalOverlay();
    injectSettingsModal();
    console.log('[UI Overhaul] All UI elements injected');
  }

  /**
   * Inject top-right controls (menu button + autodrive status)
   */
  function injectTopRightControls() {
    const container = document.createElement('div');
    container.id = 'top-right-controls';
    container.innerHTML = `
      <button id="menu-toggle-button">
        <span class="menu-icon">☰</span>
        <span>Menu</span>
      </button>
      <div id="autodrive-status">
        <div>AUTO DRIVE</div>
        <div class="autodrive-state">OFF</div>
      </div>
    `;
    document.body.appendChild(container);
  }

  /**
   * Inject drive mode indicator (AWD/FWD/RWD)
   */
  function injectDriveModeIndicator() {
    const mainStats = document.getElementById('main-stats');
    if (mainStats) {
      const driveModeDiv = document.createElement('div');
      driveModeDiv.id = 'drive-mode-indicator';
      driveModeDiv.textContent = 'AWD';
      mainStats.appendChild(driveModeDiv);
    }
  }

  /**
   * Inject music player widget
   */
  function injectMusicPlayerWidget() {
    const widget = document.createElement('div');
    widget.id = 'music-player-widget';
    widget.innerHTML = `
      <div class="music-player-icon">♪</div>
      <div class="music-player-info">
        <div class="music-player-title" id="widget-music-title">${currentMusicTrack.title}</div>
        <div class="music-player-subtitle" id="widget-music-subtitle">${currentMusicTrack.artist}</div>
      </div>
    `;
    document.body.appendChild(widget);
  }

  /**
   * Inject trajectory map
   */
  function injectTrajectoryMap() {
    const trajectoryDiv = document.createElement('div');
    trajectoryDiv.id = 'trajectory-map';
    trajectoryDiv.innerHTML = `
      <div class="trajectory-label">MAP</div>
      <canvas id="trajectory-canvas" width="200" height="150"></canvas>
    `;
    document.body.appendChild(trajectoryDiv);

    // Start trajectory rendering
    startTrajectoryRendering();
  }

  /**
   * Inject modal overlay
   */
  function injectModalOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  /**
   * Inject settings modal
   */
  function injectSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.id = 'settings-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="settings-modal-header">
        <div class="settings-modal-title">
          <span class="settings-icon">⚙</span>
          <span>Game Settings</span>
        </div>
        <button class="settings-close-btn" id="settings-close-button">×</button>
      </div>

      <div class="settings-tabs">
        <button class="settings-tab active" data-tab="stats">
          <span class="tab-icon">📊</span>
          <span>Stats</span>
        </button>
        <button class="settings-tab" data-tab="music">
          <span class="tab-icon">♪</span>
          <span>Music</span>
        </button>
        <button class="settings-tab" data-tab="world">
          <span class="tab-icon">🌍</span>
          <span>World</span>
        </button>
        <button class="settings-tab" data-tab="settings">
          <span class="tab-icon">⚙</span>
          <span>Settings</span>
        </button>
      </div>

      <div class="settings-content">
        ${getStatsTabHTML()}
        ${getMusicTabHTML()}
        ${getWorldTabHTML()}
        ${getSettingsTabHTML()}
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Get HTML for Stats tab
   */
  function getStatsTabHTML() {
    return `
      <div class="tab-panel active" id="tab-stats">
        <div class="stats-section">
          <h3 class="stats-heading">Current Session</h3>
          <div class="stat-row">
            <span class="stat-label">Distance Traveled</span>
            <span class="stat-value" id="stat-distance">0.0 km</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Top Speed</span>
            <span class="stat-value" id="stat-top-speed">0 MPH</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Average Speed</span>
            <span class="stat-value" id="stat-avg-speed">0 MPH</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Play Time</span>
            <span class="stat-value" id="stat-play-time">0 min</span>
          </div>
        </div>

        <div class="stats-section">
          <h3 class="stats-heading">Vehicle Info</h3>
          <div class="stat-row">
            <span class="stat-label">Current Vehicle</span>
            <span class="stat-value" id="stat-vehicle">Car</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Drive Type</span>
            <span class="stat-value">AWD</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get HTML for Music tab
   */
  function getMusicTabHTML() {
    return `
      <div class="tab-panel" id="tab-music">
        <div class="now-playing-section">
          <div class="section-label">NOW PLAYING</div>
          <div class="now-playing-card">
            <div class="now-playing-title" id="current-song-title">${currentMusicTrack.title}</div>
            <div class="now-playing-artist" id="current-song-artist">${currentMusicTrack.artist}</div>
            <div class="now-playing-genre" id="current-song-genre">${currentMusicTrack.genre}</div>

            <div class="player-controls">
              <button class="player-btn" id="play-pause-btn">⏸</button>
              <button class="player-btn" id="next-btn">⏭</button>
              <button class="player-btn" id="volume-btn">🔊</button>
            </div>

            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill" style="width: 0%;"></div>
            </div>
          </div>
        </div>

        <div class="search-section">
          <input type="text" class="search-input" id="song-search" placeholder="Search by title, artist, or genre...">
        </div>

        <div class="playlist-section" id="playlist-section">
          <div class="playlist-item active" data-track-id="0">
            <div class="playlist-title">Midnight Drive</div>
            <div class="playlist-artist">Synthwave Mix</div>
          </div>
          <div class="playlist-item" data-track-id="1">
            <div class="playlist-title">Neon Nights</div>
            <div class="playlist-artist">Electric Dreams</div>
          </div>
          <div class="playlist-item" data-track-id="2">
            <div class="playlist-title">Cyber Highway</div>
            <div class="playlist-artist">Retro Vision</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get HTML for World tab
   */
  function getWorldTabHTML() {
    return `
      <div class="tab-panel" id="tab-world">
        <div class="setting-group">
          <label class="setting-label">Scene Type</label>
          <select class="setting-select" id="scene-type-select">
            <option value="earth">Earth</option>
            <option value="mars">Mars</option>
            <option value="venus">Venus</option>
            <option value="moon">Moon</option>
          </select>
        </div>

        <div class="setting-group">
          <label class="setting-label">Weather / Time</label>
          <div class="button-group" id="weather-button-group">
            <button class="option-btn" data-weather="sunrise">Sunrise</button>
            <button class="option-btn active" data-weather="clear">Clear</button>
            <button class="option-btn" data-weather="rain">Rain</button>
            <button class="option-btn" data-weather="sunset">Sunset</button>
            <button class="option-btn" data-weather="night">Night</button>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">Vehicle</label>
          <div class="button-group">
            <button class="option-btn active" data-vehicle="car">Car</button>
            <button class="option-btn" data-vehicle="bus">Bus</button>
            <button class="option-btn" data-vehicle="bike">Bike</button>
          </div>
        </div>

        <button class="apply-changes-btn" id="apply-world-changes">
          ✓ Apply Changes
        </button>
      </div>
    `;
  }

  /**
   * Get HTML for Settings tab
   */
  function getSettingsTabHTML() {
    return `
      <div class="tab-panel" id="tab-settings">
        <div class="setting-group">
          <label class="setting-label">Driving Controls</label>
          <div class="toggle-item" id="autodrive-toggle">
            <span>Autodrive</span>
            <div class="toggle-switch">
              <input type="checkbox" id="autodrive-checkbox">
              <span class="slider"></span>
            </div>
          </div>
          <div class="toggle-item" id="headlights-toggle">
            <span>Headlights (H)</span>
            <div class="toggle-switch">
              <input type="checkbox" id="headlights-checkbox">
              <span class="slider"></span>
            </div>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">Display</label>
          <div class="toggle-item" id="show-ui-toggle">
            <span>Show UI Elements (U)</span>
            <div class="toggle-switch">
              <input type="checkbox" id="show-ui-checkbox" checked>
              <span class="slider"></span>
            </div>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">Input Method</label>
          <div class="button-group">
            <button class="option-btn active" data-input="keyboard">Keyboard</button>
            <button class="option-btn" data-input="mouse">Mouse</button>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">Quick Actions</label>
          <button class="action-btn" id="reset-vehicle-btn">Reset Vehicle (R)</button>
          <button class="action-btn" id="change-camera-btn">Change Camera (C)</button>
        </div>
      </div>
    `;
  }

  /**
   * Setup all event listeners
   */
  function setupAllEventListeners() {
    // Menu toggle button
    const menuToggleBtn = document.getElementById('menu-toggle-button');
    if (menuToggleBtn) {
      menuToggleBtn.addEventListener('click', toggleSettingsModal);
    }

    // Music player widget (click to open Music tab)
    const musicWidget = document.getElementById('music-player-widget');
    if (musicWidget) {
      musicWidget.addEventListener('click', () => {
        openSettingsModal('music');
      });
    }

    // Modal close button
    const closeBtn = document.getElementById('settings-close-button');
    if (closeBtn) {
      closeBtn.addEventListener('click', toggleSettingsModal);
    }

    // Modal overlay click
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', toggleSettingsModal);
    }

    // Tab switching
    setupTabSwitching();

    // Stats tab
    setupStatsTab();

    // Music tab
    setupMusicTab();

    // World tab
    setupWorldTab();

    // Settings tab
    setupSettingsTab();

    console.log('[UI Overhaul] Event listeners setup complete');
  }

  /**
   * Setup tab switching
   */
  function setupTabSwitching() {
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        switchToTab(tabName);
      });
    });
  }

  /**
   * Switch to specific tab
   */
  function switchToTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.settings-tab[data-tab="${tabName}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }

    // Show corresponding panel
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
      panel.style.display = 'none';
    });
    const activePanel = document.getElementById(`tab-${tabName}`);
    if (activePanel) {
      activePanel.classList.add('active');
      activePanel.style.display = 'block';
    }

    // Update stats if opening stats tab
    if (tabName === 'stats') {
      updateStatsDisplay();
    }
  }

  /**
   * Setup Stats tab
   */
  function setupStatsTab() {
    // Stats will be updated when modal opens
    updateStatsDisplay();
  }

  /**
   * Update stats display
   */
  function updateStatsDisplay() {
    // Try to get stats from game state
    try {
      // Distance from #ui-dist if available
      const distElem = document.querySelector('#ui-dist .ui-stat-val');
      if (distElem) {
        document.getElementById('stat-distance').textContent = distElem.textContent + ' km';
      }

      // Speed from #ui-speed
      const speedElem = document.querySelector('#ui-speed .ui-stat-val');
      if (speedElem) {
        document.getElementById('stat-top-speed').textContent = speedElem.textContent + ' MPH';
        document.getElementById('stat-avg-speed').textContent = speedElem.textContent + ' MPH';
      }

      // Vehicle from active menu item
      const activeVehicle = stateObjects.vehicleMenuItems.find(v =>
        v.element.classList.contains('menu-item-active')
      );
      if (activeVehicle) {
        document.getElementById('stat-vehicle').textContent = activeVehicle.name;
      }
    } catch (error) {
      console.warn('[UI Overhaul] Error updating stats:', error);
    }
  }

  /**
   * Setup Music tab
   */
  function setupMusicTab() {
    // Play/pause button
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        // Toggle play/pause icon
        playPauseBtn.textContent = playPauseBtn.textContent === '⏸' ? '▶' : '⏸';
      });
    }

    // Next button
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        // Play next track
        const items = document.querySelectorAll('.playlist-item');
        const activeItem = document.querySelector('.playlist-item.active');
        if (activeItem && activeItem.nextElementSibling) {
          activeItem.classList.remove('active');
          activeItem.nextElementSibling.classList.add('active');
          updateNowPlaying(activeItem.nextElementSibling);
        }
      });
    }

    // Playlist items
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        updateNowPlaying(item);
      });
    });

    // Search input
    const searchInput = document.getElementById('song-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.playlist-item');
        items.forEach(item => {
          const title = item.querySelector('.playlist-title').textContent.toLowerCase();
          const artist = item.querySelector('.playlist-artist').textContent.toLowerCase();
          if (title.includes(query) || artist.includes(query)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }
  }

  /**
   * Update now playing display
   */
  function updateNowPlaying(playlistItem) {
    const title = playlistItem.querySelector('.playlist-title').textContent;
    const artist = playlistItem.querySelector('.playlist-artist').textContent;

    // Update in modal
    document.getElementById('current-song-title').textContent = title;
    document.getElementById('current-song-artist').textContent = artist;

    // Update widget
    document.getElementById('widget-music-title').textContent = title;
    document.getElementById('widget-music-subtitle').textContent = artist;

    // Update global state
    currentMusicTrack.title = title;
    currentMusicTrack.artist = artist;
  }

  /**
   * Setup World tab
   */
  function setupWorldTab() {
    // Scene selector
    const sceneSelect = document.getElementById('scene-type-select');
    if (sceneSelect) {
      // Set current scene
      const activeScene = stateObjects.sceneMenuItems.find(s =>
        s.element.classList.contains('menu-item-active')
      );
      if (activeScene) {
        sceneSelect.value = activeScene.name.toLowerCase();
      }

      sceneSelect.addEventListener('change', (e) => {
        const sceneName = e.target.value;
        changeScene(sceneName);
      });
    }

    // Weather buttons
    const weatherButtons = document.querySelectorAll('[data-weather]');
    weatherButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        weatherButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        changeWeather(btn.dataset.weather);
      });
    });

    // Vehicle buttons
    const vehicleButtons = document.querySelectorAll('[data-vehicle]');
    vehicleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        vehicleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        changeVehicle(btn.dataset.vehicle);
      });
    });

    // Apply changes button
    const applyBtn = document.getElementById('apply-world-changes');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        // Close modal after applying
        setTimeout(() => toggleSettingsModal(), 300);
      });
    }
  }

  /**
   * Change scene
   */
  function changeScene(sceneName) {
    const scene = stateObjects.sceneMenuItems.find(s =>
      s.name.toLowerCase() === sceneName.toLowerCase()
    );
    if (scene) {
      scene.element.click();
    }
  }

  /**
   * Change weather
   */
  function changeWeather(weatherName) {
    const weather = stateObjects.weatherMenuItems.find(w =>
      w.name.toLowerCase() === weatherName.toLowerCase()
    );
    if (weather) {
      weather.element.click();
    }
  }

  /**
   * Change vehicle
   */
  function changeVehicle(vehicleName) {
    const vehicle = stateObjects.vehicleMenuItems.find(v =>
      v.name.toLowerCase() === vehicleName.toLowerCase()
    );
    if (vehicle) {
      vehicle.element.click();
      setTimeout(updateStatsDisplay, 200);
    }
  }

  /**
   * Setup Settings tab
   */
  function setupSettingsTab() {
    // Autodrive toggle
    const autodriveCheckbox = document.getElementById('autodrive-checkbox');
    if (autodriveCheckbox) {
      autodriveCheckbox.addEventListener('change', (e) => {
        const autodriveBtn = stateObjects.autodriveButton;
        if (autodriveBtn) {
          autodriveBtn.click();
        }
      });
    }

    // Headlights toggle
    const headlightsCheckbox = document.getElementById('headlights-checkbox');
    if (headlightsCheckbox) {
      headlightsCheckbox.addEventListener('change', () => {
        simulateKeyPress('H');
      });
    }

    // Show UI toggle
    const showUICheckbox = document.getElementById('show-ui-checkbox');
    if (showUICheckbox) {
      showUICheckbox.addEventListener('change', () => {
        simulateKeyPress('U');
      });
    }

    // Input method buttons
    const inputButtons = document.querySelectorAll('[data-input]');
    inputButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        inputButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        changeInputMethod(btn.dataset.input);
      });
    });

    // Reset vehicle button
    const resetBtn = document.getElementById('reset-vehicle-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        simulateKeyPress('R');
      });
    }

    // Change camera button
    const cameraBtn = document.getElementById('change-camera-btn');
    if (cameraBtn) {
      cameraBtn.addEventListener('click', () => {
        simulateKeyPress('C');
      });
    }
  }

  /**
   * Change input method
   */
  function changeInputMethod(method) {
    const inputItem = stateObjects.inputMenuItems.find(i =>
      i.name.toLowerCase() === method.toLowerCase()
    );
    if (inputItem) {
      inputItem.element.click();
    }
  }

  /**
   * Simulate key press
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

    setTimeout(() => {
      const eventUp = new KeyboardEvent('keyup', {
        key: key,
        code: 'Key' + key,
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(eventUp);
    }, 50);
  }

  /**
   * Toggle settings modal
   */
  function toggleSettingsModal() {
    settingsModalOpen = !settingsModalOpen;

    const modal = document.getElementById('settings-modal');
    const overlay = document.getElementById('modal-overlay');
    const pauseOverlay = document.getElementById('game-paused');

    if (modal) {
      modal.style.display = settingsModalOpen ? 'flex' : 'none';
    }

    if (overlay) {
      overlay.classList.toggle('active', settingsModalOpen);
    }

    if (pauseOverlay) {
      pauseOverlay.style.display = settingsModalOpen ? 'block' : 'none';
    }

    if (settingsModalOpen) {
      updateStatsDisplay();
    }
  }

  /**
   * Open settings modal to specific tab
   */
  function openSettingsModal(tabName) {
    if (!settingsModalOpen) {
      toggleSettingsModal();
    }
    switchToTab(tabName);
  }

  /**
   * Start autodrive monitoring
   */
  function startAutodriveMonitoring() {
    setInterval(() => {
      const autodriveBtn = stateObjects.autodriveButton;
      const statusDiv = document.querySelector('#autodrive-status .autodrive-state');
      const checkbox = document.getElementById('autodrive-checkbox');

      if (autodriveBtn && statusDiv) {
        const isActive = autodriveBtn.classList.contains('autodrive-active');
        statusDiv.textContent = isActive ? 'ON' : 'OFF';
        statusDiv.classList.toggle('active', isActive);

        if (checkbox) {
          checkbox.checked = isActive;
        }
      }
    }, 500);
  }

  /**
   * Start trajectory rendering
   */
  function startTrajectoryRendering() {
    const canvas = document.getElementById('trajectory-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function render() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Try to get position from game state
      try {
        if (window.p && window.p.car && window.p.car.position) {
          const pos = window.p.car.position;
          trajectoryPathData.push({ x: pos.x, z: pos.z });

          // Keep only last 50 points
          if (trajectoryPathData.length > 50) {
            trajectoryPathData.shift();
          }
        }
      } catch (error) {
        // Game state not available
      }

      // Draw trajectory path
      if (trajectoryPathData.length > 1) {
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Scale and center points
        const scaleX = canvas.width / 1000;
        const scaleZ = canvas.height / 1000;
        const centerX = canvas.width / 2;
        const centerZ = canvas.height / 2;

        trajectoryPathData.forEach((point, i) => {
          const x = centerX + point.x * scaleX;
          const z = centerZ + point.z * scaleZ;

          if (i === 0) {
            ctx.moveTo(x, z);
          } else {
            ctx.lineTo(x, z);
          }
        });

        ctx.stroke();

        // Draw arrowhead at current position
        if (trajectoryPathData.length > 0) {
          const lastPoint = trajectoryPathData[trajectoryPathData.length - 1];
          const x = centerX + lastPoint.x * scaleX;
          const z = centerZ + lastPoint.z * scaleZ;

          ctx.fillStyle = '#00d9ff';
          ctx.beginPath();
          ctx.arc(x, z, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(render);
    }

    render();
  }

  // Initialize
  init();

})();
