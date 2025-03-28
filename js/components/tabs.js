
/* ========================================================================= */
/* tabs.js - Reusable Accessible Tab Interface Logic                       */
/* Handles switching tab panels based on tab clicks and keyboard navigation. */
/* Relies on data-tab="tabId" on tab links/buttons                         */
/* and matching id="tabId" on tab content panels.                          */
/* ========================================================================= */

'use strict';

// Initialize all tab interfaces found on the page when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const tabContainers = document.querySelectorAll('.tabs'); // Find all tab navigation containers
    if (tabContainers.length > 0) {
        console.log(`Initializing ${tabContainers.length} tab interface(s)...`);
        tabContainers.forEach(initTabs);
    }
});

/**
 * Initializes a single tab interface.
 * @param {HTMLElement} tabNavContainer - The container element holding the tab buttons/links (e.g., the <nav class="tabs">).
 */
function initTabs(tabNavContainer) {
    // Find the associated content container
    // Strategy: Look for a sibling OR a child of the tab container's parent
    const parentElement = tabNavContainer.closest('.card, .settings-content, body, main'); // Look in common parents
    if (!parentElement) {
        console.warn("Could not find a suitable parent element for tab container:", tabNavContainer);
        return;
    }
    // Find panels relative to the parent
    const panels = Array.from(parentElement.querySelectorAll(':scope > [role="tabpanel"], :scope > .tab-content, :scope > * > [role="tabpanel"], :scope > * > .tab-content'));

    const tabs = Array.from(tabNavContainer.querySelectorAll('[role="tab"], .tab-link')); // Get all tab controls

    if (tabs.length === 0 || panels.length === 0) {
         console.warn("No tabs or panels found for container:", tabNavContainer);
         return;
    }

    // Map panels by their ID for quick lookup
    const panelMap = new Map();
    panels.forEach(panel => {
        if(panel.id) {
            panelMap.set(panel.id, panel);
            panel.classList.add('tab-content'); // Ensure class
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('tabindex', '0'); // Make panel focusable when active (important for screen readers)
        } else {
            console.warn("Tab panel missing required ID:", panel);
        }
    });


    // --- Set ARIA Roles and Initial States ---
    tabNavContainer.setAttribute('role', 'tablist');

    let activeTabFound = false;

    tabs.forEach((tab) => {
        const panelId = tab.dataset.tab || tab.getAttribute('aria-controls');
        if (!panelId) {
             console.warn("Tab missing data-tab or aria-controls attribute:", tab);
             return;
        }
        const panel = panelMap.get(panelId);

        if (!panel) {
            console.warn(`Panel with ID "${panelId}" not found for tab:`, tab);
            return; // Skip if no matching panel
        }

        // Ensure unique ID for the tab itself if missing
        if (!tab.id) {
            tab.setAttribute('id', `tab-${panelId}`);
        }

        // Set tab attributes
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', panelId);
        tab.setAttribute('tabindex', '-1'); // Not focusable by default Tab key

        // Set panel attributes
        panel.setAttribute('aria-labelledby', tab.id);

        // Determine initial active state
        // Prioritize aria-selected, then class, then first tab as default
        if (!activeTabFound && (tab.getAttribute('aria-selected') === 'true' || tab.classList.contains('active'))) {
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('tabindex', '0'); // Active tab is focusable
            tab.classList.add('active');
            panel.classList.add('active'); // Show active panel (CSS: .tab-content.active { display: block; })
            activeTabFound = true;
        } else {
            tab.setAttribute('aria-selected', 'false');
            panel.classList.remove('active'); // Hide inactive panel (CSS: .tab-content { display: none; })
        }

        // --- Add Event Listeners ---
        tab.addEventListener('click', (event) => {
            event.preventDefault();
            activateTab(tab, tabs, panelMap);
        });
        tab.addEventListener('keydown', (event) => {
            handleTabKeydown(event, tab, tabs, panelMap);
        });
    });

     // If no active tab was found in the markup, activate the first one
     if (!activeTabFound && tabs.length > 0) {
         console.log("No active tab found, activating first tab.");
         const firstValidTab = tabs.find(tab => panelMap.has(tab.dataset.tab || tab.getAttribute('aria-controls')));
         if (firstValidTab) {
             activateTab(firstValidTab, tabs, panelMap);
         }
     }

    console.log("Tab interface initialized for container:", tabNavContainer);
}

/**
 * Activates a specific tab and its corresponding panel, deactivating others.
 * @param {HTMLElement} targetTab - The tab element to activate.
 * @param {HTMLElement[]} allTabs - Array of all tab elements in the group.
 * @param {Map<string, HTMLElement>} panelMap - Map of panel IDs to panel elements.
 */
function activateTab(targetTab, allTabs, panelMap) {
    if (!targetTab || targetTab.getAttribute('aria-selected') === 'true') {
        return; // Do nothing if already active or invalid target
    }

    console.log(`Activating tab: ${targetTab.id}`);

    // Deactivate all other tabs and hide their panels
    allTabs.forEach((tab) => {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
        tab.classList.remove('active');

        const panelId = tab.dataset.tab || tab.getAttribute('aria-controls');
        const panel = panelMap.get(panelId);
        if (panel) {
            panel.classList.remove('active'); // Hide panel
        }
    });

    // Activate the target tab
    targetTab.setAttribute('aria-selected', 'true');
    targetTab.setAttribute('tabindex', '0');
    targetTab.classList.add('active');
    targetTab.focus(); // Move focus to the newly activated tab

    // Show the corresponding panel
    const targetPanelId = targetTab.dataset.tab || targetTab.getAttribute('aria-controls');
    const targetPanel = panelMap.get(targetPanelId);
    if (targetPanel) {
        targetPanel.classList.add('active'); // Show panel
    } else {
        console.warn(`Target panel not found for activated tab: ${targetPanelId}`);
    }
}

/**
 * Handles keyboard navigation within the tab list (Left/Right Arrows, Home, End).
 * @param {KeyboardEvent} event - The keydown event.
 * @param {HTMLElement} currentTab - The currently focused tab element.
 * @param {HTMLElement[]} allTabs - Array of all tab elements in the group.
 * @param {Map<string, HTMLElement>} panelMap - Map of panel IDs to panel elements.
 */
function handleTabKeydown(event, currentTab, allTabs, panelMap) {
    // Find only valid tabs (those with matching panels) for keyboard navigation
    const validTabs = allTabs.filter(tab => panelMap.has(tab.dataset.tab || tab.getAttribute('aria-controls')));
    const currentIndex = validTabs.indexOf(currentTab);
    if(currentIndex === -1) return; // Should not happen if called correctly

    let newIndex = currentIndex;

    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            event.preventDefault();
            newIndex = (currentIndex + 1) % validTabs.length;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            newIndex = (currentIndex - 1 + validTabs.length) % validTabs.length;
            break;
        case 'Home':
            event.preventDefault();
            newIndex = 0;
            break;
        case 'End':
            event.preventDefault();
            newIndex = validTabs.length - 1;
            break;
        case 'Enter':
        case ' ':
             event.preventDefault();
             activateTab(currentTab, allTabs, panelMap); // Activate current on Enter/Space
            return;
        default:
            return; // Ignore other keys
    }

    // Move focus to the new tab
    if (newIndex !== currentIndex && validTabs[newIndex]) {
        validTabs[newIndex].focus();
        console.log(`Focus moved via keyboard to tab: ${validTabs[newIndex].id}`);
    }
}