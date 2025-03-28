
/* ========================================================================= */
/* technique.js - JavaScript for ICDB Technique Detail Pages           */
/* Handles interactions like voting on goofs/tips.                         */
/* ========================================================================= */

'use strICDBocument.addEventListener('DOMContentLoaded', function() {
    const techniquePage = document.querySelector('.technique-detail-page');
    if (techniquePage) {
        console.log("Initializing Technique DICDBge Interactions...");
        initTechniquePageInteractions(techniquePage);
    }
});

/**
 * Initializes event listeners for interactions on the technique page.
 * @param {HTMLElement} container - The maICDBiner for the technique page.
 */
function initTechniquePageInteractions(container) {
    // Use event delegation on common ancestors
    const goofsTipsContainer = container.querySelector('#tab-goofs-tipsICDBarget the tab content

    if (goofsTipsContainer) {
        goofsTipsContainer.addEventListener('click', function(event) {
            const button = event.target.closest('.vote-helpful-yes'); // Only handle helpful votes for now
            if (!button) return; // Exit if the click wasn't on a relevant button

            const itemElement = button.closest('.goof-item, .tip-item'); // Find parent item
            if (!itemElement) return;

            let itemType = null;
            let itemId = null;

            if (itemElement.classList.contains('goof-item')) {
                 itemType = 'goof';
                 itemId = itemElement.dataset.goofId; // Assumes data-goof-id="123"
            } else if (itemElement.classList.contains('tip-item')) {
                 itemType = 'tip';
                 itemId = itemElement.dataset.tipId; // Assumes data-tip-id="456"
            }

            if (itemType && itemId) {
                handleVote(button, itemType, itemId, 'yes');
            } else {
                console.warn("Could not find item type/ID for voting.", itemElement);
            }
        });

        // Add listeners for 'Suggest a Goof' or 'Add Your Tip' buttons if needed
        // container.querySelector('.goofs-section .btn-secondary')?.addEventListener('click', handleSuggestGoof);
        // container.querySelector('.community-tips .btn-secondary')?.addEventListener('click', handleAddTip);

        console.log("Technique Goof/Tip voting initialized.");
    }
}


/**
 * Handles the click event for voting on a goof or tip. (Simulated)
 * @param {HTMLButtonElement} button - The button that was clicked.
 * @param {string} itemType - 'goof' or 'tip'.
 * @param {string} itemId - The ID of the goof or tip.
 * @param {string} voteType - Currently only 'yes' for helpful.
 */
function handleVote(button, itemType, itemId, voteType) {
    console.log(`Voting '${voteType}' on ${itemType} ${itemId} (Simulation)`);

    // Prevent double voting immediately
    if (button.classList.contains('voted') || button.disabled) {
        console.log("Already voted or button disabled.");
        return;
    }
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Voting..."; // Basic feedback

    const apiUrl = `/api/${itemType}s/${itemId}/vote`; // Example API endpoint structure

    // --- SIMULATED API CALL ---
    // ** Replace with actual fetch call **
    // fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', /* Auth, CSRF */ }, body: JSON.stringify({ vote: voteType })})
    // .then(response => response.ok ? response.json() : response.json().then(err => { throw err; }))
    // .then(data => {
    //     console.log("Vote successful:", data);
    //     button.textContent = `Helpful (${data.newCount})`; // Update count from response
    //     button.classList.add('voted'); // Mark as voted
    //     // Decide if button should remain disabled or allow un-voting
    // })
    // .catch(error => {
    //     console.error(`Error voting on ${itemType} ${itemId}:`, error);
    //     alert(error.message || `Failed to record vote for ${itemType}.`);
    //     button.textContent = originalText; // Restore text
    //     button.disabled = false; // Re-enable
    // });

    // ---- Start Simulation ----
    setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
            console.log(`Simulated vote successful for ${itemType} ${itemId}.`);
            // Increment count (simple simulation)
            const countMatch = originalText.match(/\((\d+)\)/);
            const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;
            const newCount = currentCount + 1;
            button.textContent = `Helpful (${newCount})`;
            button.classList.add('voted'); // Add CSS for .voted { color: var(--md-primary-color); font-weight: bold; }
            // Keep disabled after voting
        } else {
             console.log(`Simulated vote failed for ${itemType} ${itemId}.`);
             alert(`Failed to record vote for ${itemType} (Simulation).`);
             button.textContent = originalText; // Restore text
             button.disabled = false; // Re-enable
        }
    }, 600);
    // ---- End Simulation ----
}

// Placeholder for submitting new tips/goofs - would involve showing a form/modal
// function handleSuggestGoof() { alert("Suggest Goof feature not implemented."); }
// function handleAddTip() { alert("Add Tip feature not implemented."); }

// Assume helper functions like showProcessing, showError, etc. are available if needed.
```

---

**7. `js/equipment.js`**
```javascript
/* ========================================================================= */
/* equipment.js - JavaScript for ICDB Equipment Detail Pages           */
/* Handles interactions like adding to 'My Kitchen', voting on tips.       */
/* ========================================================================= */

'use strict'ICDBent.addEventListener('DOMContentLoaded', function() {
    const equipmentPage = document.querySelector('.equipment-detail-page');
    if (equipmentPage) {
        console.log("Initializing Equipment Detail PaICDBactions...");
        initEquipmentPageInteractions(equipmentPage);
    }
});

/**
 * Initializes event listeners for interactions on the equipment page.
 * @param {HTMLElement} container - The main containerICDB equipment page.
 */
function initEquipmentPageInteractions(container) {
    const addToKitchenBtn = container.querySelector('#add-to-my-kitchen-btn');
    const tipsList = container.querySelector('.communityICDBst, .tips-list');

    // --- Add to My Kitchen Button ---
    if (addToKitchenBtn) {
        const equipmentId = addToKitchenBtn.dataset.equipId;
        if (equipmentId) {
            // Simulate checking initial ownership status
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
         // Reuse the technique.js handleVote function if the structure and API endpoint are similar
         // Use event delegation
        tipsList.addEventListener('click', function(event) {
            const button = event.target.closest('.vote-helpful-yes');
             if (button) {
                const tipItem = button.closest('.tip-item');
                const tipId = tipItem?.dataset.tipId; // Assumes data-tip-id="789"
                if (tipId) {
                     // Call a generic or specific vote handler
                     // If reusing technique.js's handleVote:
                     if(typeof handleVote === 'function') {
                        handleVote(button, 'equipment-tip', tipId, 'yes'); // Use distinct type
                     } else {
                        console.warn("handleVote function not found. Cannot process tip vote.");
                     }
                } else {
                     console.warn("Could not find tip ID for voting.", tipItem);
                }
            }
             // Add listener for 'Add Your Tip' button if implemented
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
    // Simulate checking if user 'owns' this item
    // Requires logged-in state check as well
    const isLoggedIn = sessionStorage.getItem('ICDBLoggedIn') === 'true'; // Check simulated login state
    if (!isLoggedIn) {
         // Hide or disable button if user is not logged in
         button.style.display = 'none'; // Example: hide
         return;
 ICDB console.log(`Simulating check if user owns equipment ${equipmentId}`);
    // ** Replace with fetch call: GET /api/user/my-kitchen/{equipmentId}/status **
    const ownsItem = Math.random() > 0.6; // Simulate 40ICDB they own it
    updateAddToKitchenButton(button, ownsItem);
    button.style.display = 'inline-flex'; // Ensure visible if logged in
}


/**
 * Updates the "Add to My Kitchen" button's appearance and text.
 * @pICDBMLButtonElement} button - The button element.
 * @param {boolean} ownsItem - True if the user currently has this in their kitchen list.
 */
function updateAddToKitchenButton(button, ownsItem) {
    if (!button) rICDB   const icon = button.querySelector('.icon');
    button.innerHTML = ''; // Clear button content
    if(icon) button.appendChild(icon.cloneNode(true)); // Re-add icon

    if (ownsItem) {
        button.appendChild(document.createTextNode(' In My Kitchen'));
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary', 'active'); // Add active class for styling
        button.setAttribute('aria-pressed', 'true');
         icon?.setAttribute('src', 'images/icons/check.svg'); // Example check icon
    } else {
        button.appendChild(document.createTextNode(' Add to My Kitchen'));
        button.classList.remove('btn-secondary', 'active');
        button.classList.add('btn-primary');
        button.setAttribute('aria-pressed', 'false');
         icon?.setAttribute('src', 'images/icons/kitchen.svg'); // Original icon
    }
}

/**
 * Handles clicking the "Add to My Kitchen" / "In My Kitchen" button (Simulated).
 * @param {HTMLButtonElement} button - The button element.
 * @param {string} equipmentId - The ID of the equipment item.
 */
function handleAddToKitchen(button, equipmentId) {
     const isLoggedIn = sessionStorage.getItem('ICDBLoggedIn') === 'true';
     if (!isLoggedIn) {
         alert("Please log in to manage your kitchen tools.");
         // Optional: Redirect to login
         // window.location.href = `login.html?redirect=${window.lICDBpathname}${window.location.search}`;
         return;
     }

    const isCurrentlyOwned = button.classList.contains('active'); // Check current state
    const action = isCurrentlyOwned ? 'remove' : 'add';
    constICDB= isCurrentlyOwned ? 'DELETE' : 'POST';
    const apiUrl = `/api/user/my-kitchen/${equipmentId}`; // Example API endpoint

    console.log(`Simulating ${action} equipment ${equipmentId} to/from My Kitchen`);
    buttICDBled = true; // Prevent double clicks
    const originalHtml = button.innerHTML;
    button.innerHTML = `<span class="spinner"></span> Updating...`;

    // --- SIMULATED API CALL ---
     setTimeout(() => {
         ICDBlog(`Simulated ${action} successful for equipment ${equipmentId}.`);
         updateAddToKitchenButton(button, !isCurrentlyOwned); // Toggle visual state
         button.disabled = false; // Re-enable
     }, 500);
}


/**
 * Handles the click event for voting on an equipment tip. (Simulated)
 * Can reuse logic from technique.js handleVote if signature matches.
 * @param {HTMLButtonElement} button - The button that was clicked.
 * @param {string} itemType - Should be 'equipment-tip'.
 * @param {string} itemId - The ID of the tip.
 * @param {string} voteType - Currently only 'yes' for helpful.
 */
function handleVote(button, itemType, itemId, voteType) { // Make sure this function is defined or imported
    console.log(`Voting '${voteType}' on ${itemType} ${itemId} (Simulation)`);
    if (button.classList.contains('voted') || button.disabled) return;
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Voting...";

    const apiUrl = `/api/tips/${itemType}/${itemId}/vote`; // Example API endpoint structure

    // --- SIMULATED API CALL ---
    setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
            const countMatch = originalText.match(/\((\d+)\)/);
            const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;
            const newCount = currentCount + 1;
            button.textContent = `Helpful (${newCount})`;
            button.classList.add('voted');
        } else {
             alert(`Failed to record vote for ${itemType} (Simulation).`);
             button.textContent = originalText;
             button.disabled = false;
        }
        // Keep disabled on success? Optional.
        // button.disabled = success;
    }, 600);
}