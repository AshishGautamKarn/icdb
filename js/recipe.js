
/* ========================================================================= */
/* recipe.js - JavaScript for ICDB Recipe Detail Pages                 */
/* Handles ingredient scaling, unit conversion, step timers,               */
/* and triggering actions like adding to lists.               ICDB     */
/* ========================================================================= */

'use strict';

document.addEventListener('DOMContentLoaded', function() {

    // Check if ICDBn a recipe detail page by looking for a specific element
    // Use a more specific selector if possible, e.g., an ID on the main recipe container
    const recipeContainer = documICDBySelector('.recipe-detail-page');
    if (recipeContainer) {
        console.log("Initializing Recipe Detail Page...");
        initRecipePage(recipeContainer); // Pass container fICDBxt
    }

});

/**
 * Stores initial state and conversion factors for the current recipe.
 */
const recipeState = {
    originalServings: 1,
    currentUnitSystem: 'imperial', // 'imperial' or 'metric'
    timers: {}, // To store active interval IDs for step timers { stepId: { intervalId: number, originalText: string } }
    recipeId: null // Store the recipe ID for actions
};

/**
 * Conversion factors (basic examples - expand as needed).
 * Key: original imperial unit (lowercase, singular). Value: { factor: number, metricUnit: string }
 */
const conversionFactors = {
    'oz': { factor: 28.3495, metricUnit: 'g' },
    'lb': { factor: 0.453592, metricUnit: 'kg' },
    'tsp': { factor: 4.92892, metricUnit: 'ml' },
    'tbsp': { factor: 14.7868, metricUnit: 'ml' },
    'fl oz': { factor: 29.5735, metricUnit: 'ml' },
    'cup': { factor: 236.588, metricUnit: 'ml' }, // US legal cup
    'pint': { factor: 473.176, metricUnit: 'ml' }, // US liquid pint
    'quart': { factor: 946.353, metricUnit: 'ml' }, // US liquid quart
    'gallon': { factor: 3785.41, metricUnit: 'L' }, // US liquid gallon (Note: Liters)
    'inch': { factor: 2.54, metricUnit: 'cm' },
    '°f': { factor: null, metricUnit: '°C' } // Special case for temperature
    // Add singular forms if needed (e.g., 'clove', 'slice') - they usually don't convert.
};

// Cache elements specific to the recipe page
const elements = {};

/**
 * Initializes all functionalities specific to the recipe page.
 * @param {HTMLElement} recipeContainer - The main container element for the recipe page.
 */
function initRecipePage(recipeContainer) {
    // Cache elements using the container for scope
    elements.servingSizeInput = recipeContainer.querySelector('#serving-size');
    elements.updateServingsBtn = recipeContainer.querySelector('#update-servings-btn');
    elements.toggleUnitsBtn = recipeContainer.querySelector('#toggle-units-btn');
    elements.ingredientList = recipeContainer.querySelector('.ingredient-list');
    elements.instructionSteps = recipeContainer.querySelector('.instruction-steps');
    elements.addToShoppingListBtn = recipeContainer.querySelector('#add-to-shopping-list-btn');
    elements.addToCooklistBtn = recipeContainer.querySelector('#add-to-cooklist-btn');
    elements.recipeTitle = recipeContainer.querySelector('.recipe-title'); // Get title for context

    // Get Recipe ID (essential for actions) - Check multiple potential locations
    recipeState.recipeId = elements.addToCooklistBtn?.dataset.recipeId
                         || recipeContainer.dataset.recipeId
                         || document.body.dataset.recipeId // Fallback if set on body
                         || extractRecipeIdFromUrl(); // Try extracting from URL as last resort

    if (!recipeState.recipeId) {
        console.error("CRITICAL: Recipe ID could not be determined for this page.");
        // Disable buttons that rely on it?
        if(elements.addToCooklistBtn) elements.addToCooklistBtn.disabled = true;
        if(elements.addToShoppingListBtn) elements.addToShoppingListBtn.disabled = true; // Might need recipe ID later
    } else {
        console.log(`Recipe ID found: ${recipeState.recipeId}`);
    }


    // --- Get Initial State ---
    if (elements.servingSizeInput) {
        recipeState.originalServings = parseFloat(elements.servingSizeInput.value) || 1;
        console.log(`Original servings set to: ${recipeState.originalServings}`);
    } else {
        console.warn("Serving size input not found, defaulting original servings to 1.");
        recipeState.originalServings = 1; // Default if input missing
    }
    storeOriginalIngredientData(); // Store original values from HTML

    // --- Initialize Features ---
    initScaling();
    initUnitConversion();
    initTimers();
    initActionButtons();

    console.log("Recipe page initialized.");
}

/** Attempts to extract a recipe ID from the current URL (customize regex as needed) */
function extractRecipeIdFromUrl() {
    // Example 1: /recipe-detail.html?id=123
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    if (id) return id;

    // Example 2: /recipes/123/some-slug
    const pathMatch = window.location.pathname.match(/\/recipes?\/(\d+)/i);
    id = pathMatch ? pathMatch[1] : null;
    if (id) return id;

    return null;
}


/**
 * Reads and stores original ingredient data from the DOM onto list items' datasets.
 * Ensures we can always scale/convert from the base recipe values.
 */
function storeOriginalIngredientData() {
    if (!elements.ingredientList) return;

    const ingredientItems = elements.ingredientList.querySelectorAll('li');
    ingredientItems.forEach(item => {
        const amountEl = item.querySelector('.amount');
        const unitEl = item.querySelector('.unit');
        const nameLink = item.querySelector('.ingredient-link');
        const fullText = item.textContent.trim(); // Get full text for fallbacks

        // Store original quantity, handling potential fractions/existing data
        if (!item.dataset.originalAmount) {
            item.dataset.originalAmount = amountEl ? amountEl.textContent.trim() : '1';
        }
        // Store original unit, handling potential plurals (store singular for matching)
        if (!item.dataset.originalUnit) {
            let unitText = unitEl ? unitEl.textContent.trim().toLowerCase() : '';
            // Basic singularization (improve if needed)
            if (unitText.endsWith('s') && unitText !== 'oz' && unitText !== 'tbsp' && unitText.length > 2) { // Avoid 'ozs', 'tbsps'
                 if(unitText === 'leaves') unitText = 'leaf'; // Handle common irregulars
                 else unitText = unitText.slice(0, -1);
            }
            item.dataset.originalUnit = unitText;
        }
         // Store original ingredient name and ID if available
        if (!item.dataset.originalName && nameLink) {
            item.dataset.originalName = nameLink.textContent.trim();
        } else if (!item.dataset.originalName && amountEl && unitEl) {
            // Fallback: Extract name from text content (more robust)
            // Get text after unit, before comma or parenthesis or end of line
            const unitIndex = item.innerHTML.indexOf(unitEl.outerHTML) + unitEl.outerHTML.length;
            const remainingText = item.innerHTML.substring(unitIndex).trim();
            // Find first occurrence of '(' or ',' or end of string
            const endNameIndex = Math.min(
                remainingText.indexOf('<') > -1 ? remainingText.indexOf('<') : Infinity, // Stop at next HTML tag if any
                remainingText.indexOf('(') > -1 ? remainingText.indexOf('(') : Infinity,
                remainingText.indexOf(',') > -1 ? remainingText.indexOf(',') : Infinity,
                remainingText.length
            );
             item.dataset.originalName = remainingText.substring(0, endNameIndex).trim() || fullText;

        } else if (!item.dataset.originalName){
             item.dataset.originalName = fullText; // Worst case fallback
        }

        if (!item.dataset.ingredientId && nameLink) {
             try {
                 const urlParams = new URLSearchParams(nameLink.href.split('?')[1]);
                 item.dataset.ingredientId = urlParams.get('name') || urlParams.get('id') || null;
             } catch (e) { console.warn("Could not parse ingredient ID from link:", nameLink.href); }
        }

        // Store original notes if needed (extract from text content)
        if (!item.dataset.originalNotes) {
             const notesMatch = fullText.match(/\((.*?)\)/);
             item.dataset.originalNotes = notesMatch ? notesMatch[1].trim() : '';
        }
    });
    console.log("Stored original ingredient data from DOM.");
}

// =========================================================================
// Ingredient Scaling
// =========================================================================
function initScaling() {
    if (!elements.updateServingsBtn || !elements.servingSizeInput || !elements.ingredientList) {
        console.warn("Scaling elements not found.");
        return;
    }

    elements.updateServingsBtn.addEventListener('click', handleUpdateServings);
    // Optional: Allow scaling on input change/blur as well
    // elements.servingSizeInput.addEventListener('change', handleUpdateServings);

    console.log("Scaling initialized.");
}

/** Handles the click/change event for updating servings. */
function handleUpdateServings() {
    const newServings = parseFloat(elements.servingSizeInput.value);

    if (isNaN(newServings) || newServings <= 0) {
        alert("Please enter a valid number of servings (must be greater than 0).");
        elements.servingSizeInput.value = recipeState.originalServings; // Reset input
        scaleIngredients(recipeState.originalServings); // Reset visuals
        return;
    }

    console.log(`Scaling recipe from ${recipeState.originalServings} to ${newServings} servings.`);
    scaleIngredients(newServings);
}

/** Scales all ingredient quantities based on the new serving size relative to original. */
function scaleIngredients(newServings) {
    if (recipeState.originalServings <= 0) {
        console.error("Original servings is zero or invalid, cannot scale.");
        return; // Avoid division by zero
    }
    const scaleFactor = newServings / recipeState.originalServings;
    const ingredientItems = elements.ingredientList.querySelectorAll('li');

    ingredientItems.forEach(item => {
        const amountElement = item.querySelector('.amount');
        const unitElement = item.querySelector('.unit');
        const originalAmountStr = item.dataset.originalAmount || '1'; // Use stored original amount
        const originalUnit = item.dataset.originalUnit || ''; // Use stored original unit

        if (!amountElement || !unitElement) return; // Skip if structure missing

        try {
            const originalAmount = parseFraction(originalAmountStr);
            if (isNaN(originalAmount)) {
                console.warn(`Could not parse original amount: "${originalAmountStr}" for item:`, item.dataset.originalName || item.textContent);
                amountElement.textContent = originalAmountStr; // Keep original text if unparseable
                 unitElement.textContent = originalUnit || ''; // Ensure unit is original too
                return;
            }

            const newAmount = originalAmount * scaleFactor;

            // Update the DOM, using the *current* unit system display preference
            updateIngredientDOM(item, amountElement, unitElement, newAmount, originalUnit, recipeState.currentUnitSystem);

        } catch (e) {
            console.error("Error scaling ingredient:", item.dataset.originalName || item.textContent, e);
            amountElement.textContent = originalAmountStr; // Reset to original text on error?
            unitElement.textContent = originalUnit || '';
        }
    });
}

// =========================================================================
// Unit Conversion
// =========================================================================
function initUnitConversion() {
    if (!elements.toggleUnitsBtn || !elements.ingredientList) {
         console.warn("Unit conversion elements not found.");
        return;
    }

    // Set initial button text based on default state
    updateUnitToggleButtonText();
    elements.toggleUnitsBtn.addEventListener('click', handleToggleUnits);

    console.log("Unit Conversion initialized.");
}

/** Handles the click event for the unit conversion toggle button. */
function handleToggleUnits() {
    recipeState.currentUnitSystem = recipeState.currentUnitSystem === 'imperial' ? 'metric' : 'imperial';
    console.log(`Switching units to: ${recipeState.currentUnitSystem}`);
    updateUnitToggleButtonText();

    // Re-scale first to get correct base amounts, then apply conversion display
    const currentServings = parseFloat(elements.servingSizeInput?.value) || recipeState.originalServings;
    scaleIngredients(currentServings); // This now calls updateIngredientDOM which handles conversion
}

/** Updates the text of the unit toggle button. */
function updateUnitToggleButtonText() {
     if (elements.toggleUnitsBtn) {
        elements.toggleUnitsBtn.textContent = recipeState.currentUnitSystem === 'imperial' ? 'Switch to Metric' : 'Switch to Imperial';
     }
}

/**
 * Updates a single ingredient's display based on a calculated amount and target unit system.
 * @param {HTMLElement} itemLi - The <li> element.
 * @param {HTMLElement} amountEl - The amount span.
 * @param {HTMLElement} unitEl - The unit span.
 * @param {number} calculatedAmount - The scaled base amount (in original units).
 * @param {string} originalUnit - The original unit (lowercase, singular) from dataset.
 * @param {string} targetSystem - 'imperial' or 'metric'.
 */
function updateIngredientDOM(itemLi, amountEl, unitEl, calculatedAmount, originalUnit, targetSystem) {
    let displayAmount = calculatedAmount;
    let displayUnit = originalUnit; // Start with original unit

    // --- Conversion Logic (only changes display, not base calculation) ---
    if (targetSystem === 'metric') {
        if (conversionFactors[originalUnit]) { // Check if the original unit IS convertible
            const conv = conversionFactors[originalUnit];
            if (originalUnit === '°f') {
                displayAmount = (calculatedAmount - 32) * 5 / 9;
                displayUnit = conv.metricUnit;
                displayAmount = Math.round(displayAmount); // Round Celsius
            } else if (conv.factor !== null) {
                displayAmount = calculatedAmount * conv.factor;
                displayUnit = conv.metricUnit;
                // Apply reasonable rounding for metric values
                if (displayUnit === 'ml' || displayUnit === 'g') {
                     if (displayAmount < 10) displayAmount = Math.round(displayAmount * 10) / 10; // 1 decimal
                     else if (displayAmount < 100) displayAmount = Math.round(displayAmount); // 0 decimals
                     else displayAmount = Math.round(displayAmount / 5) * 5; // Round to nearest 5 for larger ml/g
                } else if (displayUnit === 'kg' || displayUnit === 'L') {
                     displayAmount = Math.round(displayAmount * 100) / 100; // 2 decimals
                } else if (displayUnit === 'cm') {
                     displayAmount = Math.round(displayAmount * 10) / 10; // 1 decimal for cm
                } else {
                    displayAmount = Math.round(displayAmount); // Default rounding
                }
            }
            // If no conversion factor (e.g., for 'clove'), displayUnit remains originalUnit
        }
        // else: originalUnit is not in conversionFactors, keep original display
    }
    // --- Reverting to Imperial ---
    // No explicit conversion needed, just format the calculatedAmount (which is already in original imperial units)
    else { // targetSystem === 'imperial'
        displayUnit = originalUnit; // Ensure unit is the original one
    }

    // --- Formatting ---
    // Format the number (e.g., to fractions) only if displaying imperial units AND it's not temperature
    const formattedAmountStr = (targetSystem === 'imperial' && displayUnit !== '°f')
                                ? formatNumber(displayAmount)
                                : displayAmount.toString();

    // --- Update DOM ---
    amountEl.textContent = formattedAmountStr;
    // Restore plural 's' if needed for imperial display and amount > 1 or fractional
    let finalDisplayUnit = displayUnit;
    const numValueForPlural = parseFraction(formattedAmountStr); // Parse the formatted string back
     if (targetSystem === 'imperial' && displayUnit && numValueForPlural > 1) {
         // Basic pluralization, add exceptions as needed
         if(displayUnit !== 'oz' && displayUnit !== 'inch' && displayUnit !== '°f') { // Don't pluralize these
            if(displayUnit === 'leaf') finalDisplayUnit = 'leaves';
            else finalDisplayUnit = displayUnit + 's';
         }
    }
    unitEl.textContent = finalDisplayUnit || ''; // Ensure empty string if no unit
}


// =========================================================================
// Step Timers
// =========================================================================
function initTimers() {
    if (!elements.instructionSteps) return;

    const timerTriggers = elements.instructionSteps.querySelectorAll('.step-timer');
    timerTriggers.forEach((trigger, index) => {
        // Ensure each trigger has a unique reference or ID for its step
        const stepLi = trigger.closest('li.step');
        if(stepLi && !stepLi.id) {
            stepLi.id = `recipe-step-${index}`; // Assign an ID if missing
        }
        trigger.addEventListener('click', handleTimerClick);
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('aria-live', 'polite');
    });

    console.log("Timers initialized.");
}

/** Handles clicks on timer trigger elements within recipe steps. */
function handleTimerClick(event) {
    const trigger = event.target;
    const durationSeconds = parseInt(trigger.dataset.duration, 10);
    const stepLi = trigger.closest('li.step');
    const stepId = stepLi?.id; // Use the assigned or existing ID

    if (!stepId || isNaN(durationSeconds) || durationSeconds <= 0) {
        console.warn("Invalid timer data or step ID:", trigger);
        return;
    }

    // Check if a timer is already running for this step
    if (recipeState.timers[stepId]) {
        clearInterval(recipeState.timers[stepId].intervalId);
        trigger.textContent = recipeState.timers[stepId].originalText;
        trigger.classList.remove('timer-active', 'timer-finished');
        delete recipeState.timers[stepId];
        console.log(`Timer stopped for step ${stepId}`);
        // Restore original title if needed
        if(document.title.startsWith("(*)")) document.title = document.title.replace("(*) ", "");
        return;
    }

    // Start new timer
    let remainingSeconds = durationSeconds;
    trigger.classList.remove('timer-finished');
    trigger.classList.add('timer-active');
    const originalText = trigger.textContent; // Store original text

    const updateTimerDisplay = () => {
        if (remainingSeconds <= 0) {
            clearInterval(intervalId);
            trigger.textContent = "Time's up!";
            trigger.classList.remove('timer-active');
            trigger.classList.add('timer-finished');
            const stepLabelText = stepLi?.querySelector('.step-label')?.textContent.substring(0, 30) || 'Step';
            delete recipeState.timers[stepId];
            console.log(`Timer finished for step ${stepId}`);
             // Notify user
             try {
                // Simple notification if permission granted
                if (Notification.permission === "granted") {
                     new Notification("ICDB Timer", { body: `Time's up for: ${stepLabelText}...` });
                 } else if (Notification.permission !== "denied") {
                     Notification.requestPermission().thenICDBion => {
                         if (permission === "granted") {
                             new Notification("ICDB Timer", { body: `Time's up for: ${stepLabelText}...` });
         ICDB        }
                     });
                 }
                 // Fallback: Update title if tab not focusICDB            if (!document.hasFocus()) {
                    documenICDB= `(*) Time's up! - ${document.title.replace('(*) ','')}`;
                 } else {
                     // MaybICDBle visual cue on the page?
                 }
             } catch ICDBnsole.error("Notification API error:", e); }

        } else {
            trigger.textContent = `Stop Timer (${fICDBe(remainingSeconds)})`;
            remainingSeconds--;
        }
    };

    const intervalId = setInterval(updateTimerDisplay, 1000);
    recipeState.timers[stepId] = { intervalId, origiICDB};
    console.log(`Timer started for step ${stepId} (${durationSeconds}s)`);
    updateTimerDisplay(); // Initial display update
}

/** Formats seconds into MM:SS or HH:MM:SS format. */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return hours > 0
        ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(minutes)}:${pad(seconds)}`;
}

// =========================================================================
// Action Buttons (Add to List Triggers)
// =========================================================================
function initActionButtons() {
    if (elements.addToShoppingListBtn) {
        elements.addToShoppingListBtn.addEventListener('click', handleAddToShoppingList);
        console.log("Add to Shopping List button initialized.");
    }
    if (elements.addToCooklistBtn && recipeState.recipeId) {
         // Check initial cooklist status (simulation)
         checkInitialCooklistStatus(elements.addToCooklistBtn, recipeState.recipeId);
         elements.addToCooklistBtn.addEventListener('click', () => handleAddToCooklist(elements.addToCooklistBtn, recipeState.recipeId));
         console.log("Add to Cooklist button initialized.");
    } else if (elements.addToCooklistBtn) {
         console.warn("Add to Cooklist button found, but recipe ID is missing.");
         elements.addToCooklistBtn.disabled = true; // Disable if no ID
    }
}

/** Gathers current ingredient data and calls global function to add to shopping list. */
function handleAddToShoppingList() {
    if (!elements.ingredientList) return;

    const ingredientsToAdd = [];
    const recipeName = elements.recipeTitle?.textContent || 'Current Recipe';

    const ingredientItems = elements.ingredientList.querySelectorAll('li');
    ingredientItems.forEach(item => {
        const currentQty = item.querySelector('.amount')?.textContent.trim();
        const currentUnit = item.querySelector('.unit')?.textContent.trim();
        // Get stored original name/ID for better matching/categorization
        const name = item.dataset.originalName || 'Unknown Ingredient';
        const notes = item.dataset.originalNotes || '';
        const ingredientId = item.dataset.ingredientId || null; // Stored ID
        const ingredientLink = item.querySelector('.ingredient-link')?.href || null;

        if (currentQty && name) {
            ingredientsToAdd.push({
                id: ingredientId ? `ing-${ingredientId}` : `custom-${name.toLowerCase().replace(/\s+/g, '-')}`, // Use ingredient ID if available
                name: name,
                quantity: currentQty, // Use the currently displayed (potentially scaled/converted) quantity
                unit: currentUnit,   // Use the currently displayed unit
                notes: notes,
                sourceRecipe: recipeName,
                ingredientLink: ingredientLink
            });
        }
    });

    console.log("Requesting add to shopping list:", ingredientsToAdd);

    if (typeof window.addToGlobalShoppingList === 'function') {
        const result = window.addToGlobalShoppingList(ingredientsToAdd, recipeName);
        showTemporaryFeedback(elements.addToShoppingListBtn, result ? "Added!" : "Error Adding", !result);
    } else {
        console.warn("Global function 'addToGlobalShoppingList' not found.");
        alert("Shopping list functionality is not fully implemented.");
    }
}

/** SIMULATED check for initial cooklist status */
function checkInitialCooklistStatus(button, recipeId) {
     console.log(`Simulating check if recipe ${recipeId} is on cooklist`);
     const isAdded = Math.random() > 0.7; // Simulate 30% chance it's already added
     updateAddToCooklistButton(button, isAdded);
}

/** Updates the Add to Cooklist button's appearance and text. */
function updateAddToCooklistButton(button, isAdded) {
    if (!button) return;
    const icon = button.querySelector('.icon');
    let text = '';

    if (isAdded) {
        text = ' On Cooklist'; // Leading space is important
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary', 'active');
        button.setAttribute('aria-pressed', 'true');
        if (icon) icon.setAttribute('src', 'images/icons/check-circle.svg'); // Use a different checkmark?
    } else {
        text = ' Add to Cooklist';
        button.classList.remove('btn-secondary', 'active');
        button.classList.add('btn-primary');
        button.setAttribute('aria-pressed', 'false');
        if (icon) icon.setAttribute('src', 'images/icons/add-to-list.svg');
    }
     // Set text content while keeping icon
     button.textContent = text; // Set text first
     if (icon) button.prepend(icon); // Prepend icon
}

/** Calls global function to add/remove current recipe from cooklist. */
function handleAddToCooklist(button, recipeId) {
     if (!recipeId) return;
     console.log(`Requesting add/remove recipe ID ${recipeId} to/from cooklist.`);
     button.disabled = true; // Disable during processing

     if (typeof window.addToGlobalCooklist === 'function') {
         const result = window.addToGlobalCooklist(recipeId); // Expects { success: boolean, added: boolean }
         if (result.success) {
              const feedbackMsg = result.added ? "Added!" : "Removed!";
              updateAddToCooklistButton(button, result.added); // Update permanent state
              // Show temporary feedback *over* the new state text
              showTemporaryFeedback(button, feedbackMsg);
              // Note: showTemporaryFeedback will re-enable the button after timeout
         } else {
              showTemporaryFeedback(button, "Error!", true);
               button.disabled = false; // Re-enable immediately on error after feedback shows
         }
     } else {
        console.warn("Global function 'addToGlobalCooklist' not found.");
        alert("Cooklist functionality is not fully implemented.");
        button.disabled = false; // Re-enable
     }
}

/** Helper to show temporary feedback text on a button. */
function showTemporaryFeedback(buttonElement, message, isError = false) {
    if (!buttonElement) return;
    // Store original content (HTML including icon) only if not already stored
    if (!buttonElement.dataset.originalHtmlFeedback) {
         buttonElement.dataset.originalHtmlFeedback = buttonElement.innerHTML;
    }
    const originalHtml = buttonElement.dataset.originalHtmlFeedback;

    buttonElement.innerHTML = message; // Set feedback message (overwrites icon temporarily)
    buttonElement.disabled = true; // Keep disabled during feedback
    buttonElement.classList.toggle('feedback-error', isError);

    setTimeout(() => {
        buttonElement.innerHTML = originalHtml; // Restore original content
        buttonElement.disabled = false;
        buttonElement.classList.remove('feedback-error');
        delete buttonElement.dataset.originalHtmlFeedback;
    }, 2000);
}


// =========================================================================
// Utility Helpers for Scaling/Conversion (Ensure these are defined)
// =========================================================================

/** Parses a string that might be a whole number, decimal, fraction, or mixed number. */
function parseFraction(str) {
    if (str === null || str === undefined) return NaN;
    str = String(str).trim();
    if (!str) return NaN;
    // Unicode fractions
    const unicodeFractions = {'½':0.5, '⅓':1/3, '⅔':2/3, '¼':0.25, '¾':0.75, '⅕':0.2, '⅖':0.4, '⅗':0.6, '⅘':0.8, '⅙':1/6, '⅚':5/6, '⅛':1/8, '⅜':3/8, '⅝':5/8, '⅞':7/8};
    if (unicodeFractions[str]) return unicodeFractions[str];
    // Mixed number (e.g., "1 1/2")
    if (str.includes(' ') && str.includes('/')) {
        const parts = str.split(' ');
        if (parts.length === 2 && parts[1].includes('/')) {
            const whole = parseFloat(parts[0]);
            const fractionParts = parts[1].split('/');
             if (fractionParts.length === 2) {
                 const num = parseFloat(fractionParts[0]);
                 const den = parseFloat(fractionParts[1]);
                 if (!isNaN(whole) && !isNaN(num) && !isNaN(den) && den !== 0) return whole + num / den;
             }
        }
    } else if (str.includes('/')) { // Simple fraction (e.g., "1/2")
        const parts = str.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
        }
    }
    const num = parseFloat(str); // Try direct float parse
    return isNaN(num) ? NaN : num;
}

/** Formats a number into a string, attempting to represent common fractions. */
function formatNumber(num, tolerance = 0.01) {
    if (isNaN(num) || num === null) return '';
    if (Math.abs(num) < tolerance) return '0'; // Handle zero

    const sign = num < 0 ? '-' : '';
    num = Math.abs(num);

    const whole = Math.floor(num);
    const decimal = num - whole;

    // Check near whole number first (within tolerance)
    if (decimal < tolerance || (1 - decimal) < tolerance) {
        return sign + Math.round(num).toString();
    }

    // Define common fractions and their decimal values
    const fractions = {
        '1/8': 1/8, '1/4': 0.25, '1/3': 1/3, '3/8': 3/8,
        '1/2': 0.5, '5/8': 5/8, '2/3': 2/3, '3/4': 0.75, '7/8': 7/8
    };
    let bestMatch = '';
    let smallestDiff = tolerance;

    for (const [str, val] of Object.entries(fractions)) {
        const diff = Math.abs(decimal - val);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            bestMatch = str;
        }
    }

    if (bestMatch) {
        return sign + (whole > 0 ? `${whole} ${bestMatch}` : bestMatch);
    } else {
        // Round decimals reasonably if no fraction matched
        let roundedNum;
        if (num < 0.1) roundedNum = num.toFixed(2); // Show more precision for very small amounts
        else if (num < 1) roundedNum = num.toFixed(2);
        else if (num < 10) roundedNum = (Math.round(num * 100) / 100).toString();
        else roundedNum = (Math.round(num * 10) / 10).toString();
        // Remove trailing zeros after decimal point unless it's just ".0"
        roundedNum = roundedNum.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
        return sign + roundedNum;
    }
}