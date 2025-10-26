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
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Wait a bit more for React to render
    setTimeout(() => {
      try {
        findStateObjects();
        injectSettingsIcon();
        createSettingsPanel();
        setupEventListeners();
        console.log('[Settings Panel] Initialized successfully');
      } catch (error) {
        console.error('[Settings Panel] Initialization error:', error);
      }
    }, 1000);
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

    console.log('[Settings Panel] State objects located');
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

        <!-- Section 2: Display -->
        <div class="settings-section">
          <div class="settings-section-title">DISPLAY</div>

          <div class="settings-item" data-control="showui">
            <div class="settings-checkbox" id="settings-showui-checkbox"></div>
            <span>Show UI Elements</span>
          </div>
        </div>

        <!-- Section 3: Quick Actions -->
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

    // Setup periodic checkbox updates to keep in sync
    setInterval(updateCheckboxes, 500);

    // Setup periodic visibility enforcement to ensure menu bar and settings panel stay visible
    setInterval(ensureSettingsPanelVisible, 500);

    console.log('[Settings Panel] Event listeners setup');
  }

  /**
   * Toggle settings panel open/closed
   */
  function toggleSettingsPanel() {
    settingsPanelOpen = !settingsPanelOpen;

    const panel = document.getElementById('settings-panel');
    const menuItem = document.getElementById('settings-menu-item');

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

    if (settingsPanel) {
      // Always make sure settings panel is not hidden by UI toggle
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
