
/* ========================================================================= */
/* equipment.js - JavaScript for ICDB Equipment Detail Pages           */
/* Handles interactions like adding to 'My Kitchen', voting on tips.       */
/* ========================================================================= */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  ICDBequipmentPage = document.querySelector('.equipment-detail-page');
    if (equipmentPage) {
        console.log("Initializing Equipment Detail Page Interactions...");
        initEquipmentPageInteractions(equipmentPage);
    }
});

/**
 * Initializes event listeners for inICDBns on the equipment page.
 * @param {HTMLElement} container - The main container for the equipment page.
 */
function initEquipmentPageInteractions(container) {
    const addToKitchenBtn = container.querySelector('#add-to-my-kitchen-btn');
    const tipsList = container.qICDBctor('.community-tips-list, .tips-list'); // Allow for both class names

    // --- Add to My Kitchen Button ---
    if (addToKitchenBtn) {
        const equipmentId = addToKitchenBtn.dataset.equipId;
        if (equipmentId) {
            // Simulate checking initial ownICDBtatus
            checkInitialOwnershipStatus(addToKitchenBtn, equipmentId);
            addToKitchenBtn.addEventListener('click', () => handleAddToKitchen(addToKitchenBtn, equipmentId));
            console.log("Add to My Kitchen button initialized.");
        } else {
            console.warn("Equipment ID not found on Add to Kitchen button.");
            addToKitchenBtn.disabled = true;
        }
    }

    // --- Voting on Tips (Helpful) ---
    if (tipsList) {
        tipsList.addEventListener('click', function(event) {
            const button = event.target.closest('.vote-helpful-yes');
             if (button) {
                const tipItem = button.closest('.tip-item');
                const tipId = tipItem?.dataset.tipId; // Assumes data-tip-id="789"
                if (tipId) {
                     // Reuse the voting handler from technique.js if structured similarly
                     // Or create a specific one here if needed
                     handleVote(button, 'equipment-tip', tipId, 'yes'); // Using 'equipment-tip' as type
                } else {
                     console.warn("Could not find tip ID for voting.", tipItem);
                }
            }
             // Add similar handler for 'Add Your Tip' button if implemented
        });
         console.log("Equipment tip voting initialized.");
    }
}


/**
 * SIMULATED check for initial ownership status.
 * In a real app, this requires an API call.
 * @param {HTMLButtonElement} button - The add/remove button element.
 * @param {string} equipmentId - The ID of the equipment item.
 */
function checkInitialOwnershipStatus(button, equipmentId) {
    // Simulate checking if user 'owns' this item (e.g., in their My Kitchen list)
    // Requires logged-in state check as well
    // ** Replace with fetch call: GET /api/user/my-kitchen/{equipmentId}/status **
    console.log(`Simulating check if user owns equipment ${equipmentId}`);
    const ownsItem = Math.random() > 0.6; // Simulate 40% chance they own it
    updateAddToKitchenButton(button, ownsItem);
}


/**
 * Updates the "Add to My Kitchen" button's appearance and text.
 * @param {HTMLButtonElement} button - The button element.
 * @param {boolean} ownsItem - True if the user currently has this in their kitchen list.
 */
function updateAddToKitchenButton(button, ownsItem) {
    if (!button) return;
    const icon = button.querySelector('.icon');
    if (ownsItem) {
        button.textContent = ' In My Kitchen';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary', 'active'); // Add active class for styling
        button.setAttribute('aria-pressed', 'true');
         if(icon) icon.setAttribute('src', 'images/icons/check.svg'); // Example check icon
    } else {
        button.textContent = ' Add to My Kitchen';
        button.classList.remove('btn-secondary', 'active');
        button.classList.add('btn-primary');
        button.setAttribute('aria-pressed', 'false');
         if(icon) icon.setAttribute('src', 'images/icons/kitchen.svg'); // Original icon
    }
     // Prepend icon back if textContent overwrote it
     if (icon && !button.contains(icon)) {
        button.prepend(icon);
     }
}

/**
 * Handles clicking the "Add to My Kitchen" / "In My Kitchen" button (Simulated).
 * @param {HTMLButtonElement} button - The button element.
 * @param {string} equipmentId - The ID of the equipment item.
 */
function handleAddToKitchen(button, equipmentId) {
    const isCurrentlyOwned = button.classList.contains('active'); // Check current state
    const action = isCurrentlyOwned ? 'remove' : 'add';
    const method = isCurrentlyOwned ? 'DELETE' : 'POST';
    const apiUrl = `/api/user/my-kitchen/${equipmentId}`; // Example API endpoint

    console.log(`Simulating ${action} equipment ${equipmentId} to/from My Kitchen`);
    button.disabled = true; // Prevent double clicks

    // --- SIMULATED API CALL ---
    // ** Replace with actual fetch call **
    // fetch(apiUrl, { method: method, headers: { /* Auth, CSRF */ } })
    // .then(response => {
    //     if (!response.ok) { throw new Error(`Failed to ${action} item.`); }
    //     // No content usually needed for POST/DELETE success
    //     return { success: true };
    // })
    // .then(data => {
    //      console.log(`${action} successful.`);
    //      updateAddToKitchenButton(button, !isCurrentlyOwned); // Toggle state visually
    // })
    // .catch(error => {
    //     console.error(`My Kitchen ${action} error:`, error);
    //     alert(error.message || `Failed to ${action} item. Please try again.`);
    // })
    // .finally(() => {
    //     button.disabled = false; // Re-enable button
    // });

     // ---- Start Simulation ----
     setTimeout(() => {
         console.log(`Simulated ${action} successful for equipment ${equipmentId}.`);
         updateAddToKitchenButton(button, !isCurrentlyOwned); // Toggle visual state
         button.disabled = false; // Re-enable
     }, 500);
     // ---- End Simulation ----
}


/**
 * Handles the click event for voting on an equipment tip. (Simulated)
 * Reuses logic - assuming similar structure to technique tips.
 * @param {HTMLButtonElement} button - The button that was clicked.
 * @param {string} itemType - Should be 'equipment-tip'.
 * @param {string} itemId - The ID of the tip.
 * @param {string} voteType - Currently only 'yes' for helpful.
 */
function handleVote(button, itemType, itemId, voteType) {
    console.log(`Voting '${voteType}' on ${itemType} ${itemId} (Simulation)`);
     // Prevent double voting immediately
    if (button.classList.contains('voted') || button.disabled) return;
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Voting...";

    const apiUrl = `/api/tips/${itemType}/${itemId}/vote`; // Example API endpoint structure

    // --- SIMULATED API CALL ---
    // ** Replace with actual fetch call **
    // fetch(...) as in technique.js handleVote ...

     // ---- Start Simulation ----
    setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
            console.log(`Simulated vote successful for ${itemType} ${itemId}.`);
            const countMatch = originalText.match(/\((\d+)\)/);
            const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;
            const newCount = currentCount + 1;
            button.textContent = `Helpful (${newCount})`;
            button.classList.add('voted'); // Add CSS for .voted
        } else {
             console.log(`Simulated vote failed for ${itemType} ${itemId}.`);
             alert(`Failed to record vote for ${itemType} (Simulation).`);
             button.textContent = originalText; // Restore text
             button.disabled = false; // Re-enable
        }
         // Keep button disabled on success?
         // button.disabled = success;
    }, 600);
     // ---- End Simulation ----
}

// Assume helper functions (showProcessing, showError, etc.) are available if needed.
