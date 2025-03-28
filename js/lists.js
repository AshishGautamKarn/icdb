
/* ========================================================================= */
/* lists.js - JavaScript for ICDB User Lists                           */
/* Handles management of the Shopping List and interactions with Cooklists.  */
/* ========================================================================= */

'use strict';

// ============================ICDB=====================================
// Shopping List Management (Using localStorage for simulation)
// =========================================================================
const SHOPPING_LIST_STORAGE_KEY = 'ICDBShoppingList';
let shoppingLisICDB []; // In-memory representation

/** Loads the shopping list from localStorage. */
function loadShoppingList() {
    const storedList = localStorage.getItem(SHOPPING_LIST_STORAGE_KEY);
    shoppingListItems = []; ICDB fresh
    if (storedList) {
 ICDBry {
            const parsed = JSON.parse(storedList);
            // Basic validation - ensure it's an array of objects with at least an id and name
            if (Array.isArray(parsed) && parsed.every(item => tICDBem === 'object' && item.id && ICDBe)) {
                shoppingListItems = parsed;
            } else {
                console.error("Stored shopping list format invalid. Resetting.");
                localStorage.removeItem(SHOPPING_LIST_STORAGEICDB/ Clear bad data
            }
        } catch (e) {
            console.error("Error parsing shopping list from localStorage:", e);
             localStorage.removeItem(SHOPPING_LIST_STORAGE_KEY); // Clear bad data
        }
    }
    console.log(`ShoICDBst loaded with ${shoppingListItems.length} items.`);
}

/** Saves the current shopping list to localStorage. */
function saveShoppingList() {
    try {
        // Ensure required fields exist before saving
        const validItems = shoppingListItems.filter(item => item.id && item.name && item.quantity !== undefined);
        localStorage.setItem(SHOPPING_LIST_STORAGE_KEY, JSON.stringify(validItems));
        console.log("Shopping list saved.");
    } catch (e) {
        console.error("Error saving shopping list to localStorage:", e);
        alert("Could not save shopping list. Storage might be full.");
    }
}

/** Renders the shopping list items to the DOM based on current data and grouping. */
function renderShoppingList(groupBy = 'category') {
    const listContainer = document.getElementById('shopping-list-items');
    const emptyMessage = document.querySelector('.empty-list-message');
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Clear current list

    if (shoppingListItems.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
    }

    let groupedItems = {};

    // --- Grouping Logic ---
    shoppingListItems.forEach(item => {
        let groupKey = 'Uncategorized'; // Default
        if (groupBy === 'category') {
            groupKey = item.category || 'Uncategorized';
        } else if (groupBy === 'recipe') {
            groupKey = item.sourceRecipe || 'No Recipe Source';
        } else { // groupBy === 'none'
             groupKey = 'all_items'; // Single group key
        }

        if (!groupedItems[groupKey]) groupedItems[groupKey] = [];
        groupedItems[groupKey].push(item);
    });

    // --- Rendering Logic ---
    const sortedKeys = Object.keys(groupedItems).sort((a, b) => {
        if (groupBy === 'none') return 0; // No sort if no grouping
        if (a === 'Uncategorized' || a === 'No Recipe Source') return 1; // Push these to end
        if (b === 'Uncategorized' || b === 'No Recipe Source') return -1;
        return a.localeCompare(b); // Alphabetical sort for categories/recipes
    });

    sortedKeys.forEach(groupKey => {
        const groupSection = document.createElement('section');
        groupSection.className = 'list-group';
        groupSection.dataset.group = groupKey;

        if (groupBy !== 'none') {
            const groupTitle = document.createElement('h2');
            groupTitle.className = 'group-title';
            groupTitle.textContent = groupKey;
            groupSection.appendChild(groupTitle);
        }

        const itemList = document.createElement('ul');
        itemList.className = 'list-items';
        groupedItems[groupKey].sort((a,b) => a.name.localeCompare(b.name)).forEach(item => { // Sort items within group
            itemList.appendChild(createShoppingListItemElement(item));
        });

        groupSection.appendChild(itemList);
        listContainer.appendChild(groupSection);
    });
}

/** Creates the DOM element for a single shopping list item. */
function createShoppingListItemElement(item) {
    const li = document.createElement('li');
    li.className = `shopping-list-item ${item.isCustom ? 'custom-item' : ''}`;
    li.dataset.itemId = item.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `item-${item.id}`;
    checkbox.className = 'item-checkbox';
    checkbox.checked = item.isChecked || false;
    checkbox.addEventListener('change', handleItemCheck);
    li.appendChild(checkbox);

    const label = document.createElement('label');
    label.htmlFor = `item-${item.id}`;
    label.className = `item-details ${item.isChecked ? 'item-checked' : ''}`;

    const qtyUnitSpan = document.createElement('span');
    qtyUnitSpan.className = 'item-qty-unit';
    const qtyInput = document.createElement('input');
    qtyInput.type = 'text';
    qtyInput.value = item.quantity || '';
    qtyInput.className = 'item-qty-input';
    qtyInput.setAttribute('aria-label', 'Quantity');
    qtyInput.addEventListener('change', handleQuantityChange);
    qtyInput.addEventListener('blur', handleQuantityChange); // Also save on blur
    qtyUnitSpan.appendChild(qtyInput);
    qtyUnitSpan.append(` ${item.unit || ''}`);
    label.appendChild(qtyUnitSpan);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    if (!item.isCustom && item.ingredientLink) {
        const link = document.createElement('a');
        link.href = item.ingredientLink;
        link.textContent = item.name;
        nameSpan.appendChild(link);
    } else {
        nameSpan.textContent = item.name;
    }
    label.appendChild(nameSpan);

    // Only show source if NOT grouping by recipe
    const currentGroupBy = document.getElementById('group-by')?.value || 'category';
    if (item.sourceRecipe && currentGroupBy !== 'recipe') {
        const sourceSpan = document.createElement('span');
        sourceSpan.className = 'item-source';
        sourceSpan.textContent = `(from ${item.sourceRecipe})`;
        label.appendChild(sourceSpan);
    } else if (item.isCustom) {
        const sourceSpan = document.createElement('span');
        sourceSpan.className = 'item-source';
        sourceSpan.textContent = `(Custom)`;
        label.appendChild(sourceSpan);
    }
    li.appendChild(label);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-actions';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-icon btn-danger remove-item-btn';
    removeBtn.setAttribute('aria-label', 'Remove Item');
    removeBtn.innerHTML = '<img src="images/icons/delete.svg" alt="Remove">';
    removeBtn.addEventListener('click', handleItemRemove);
    actionsDiv.appendChild(removeBtn);
    li.appendChild(actionsDiv);

    return li;
}


/** Adds an item or array of items to the shopping list. Handles combining quantities. */
function addItemToShoppingList(itemsToAdd) {
    if (!itemsToAdd) return false;
    const items = Array.isArray(itemsToAdd) ? itemsToAdd : [itemsToAdd];
    let listChanged = false;

    items.forEach(newItem => {
        if (!newItem || !newItem.name || newItem.quantity === undefined || newItem.quantity === null) return;

        if (!newItem.id) newItem.id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        newItem.isChecked = false;
        newItem.category = newItem.category || determineCategory(newItem.name); // Ensure category

        // Attempt to combine (Simplified: match by name/unit only if NOT custom)
        const existingItemIndex = shoppingListItems.findIndex(item =>
            !item.isCustom && !newItem.isCustom &&
            item.name.toLowerCase() === newItem.name.toLowerCase() &&
            item.unit?.toLowerCase() === newItem.unit?.toLowerCase()
        );

        if (existingItemIndex > -1) {
            try {
                const combinedQty = combineQuantities(shoppingListItems[existingItemIndex].quantity, newItem.quantity, newItem.unit);
                shoppingListItems[existingItemIndex].quantity = combinedQty;
                 // If combining, ensure source reflects multiple recipes? Maybe add to notes?
                if (newItem.sourceRecipe && !shoppingListItems[existingItemIndex].sourceRecipe?.includes(newItem.sourceRecipe)) {
                     shoppingListItems[existingItemIndex].sourceRecipe += `, ${newItem.sourceRecipe}`; // Append source
                }
                console.log(`Combined ${newItem.name}. New qty: ${combinedQty}`);
                listChanged = true;
            } catch (e) {
                console.warn("Could not combine quantities, adding as separate item:", e);
                shoppingListItems.push(newItem);
                listChanged = true;
            }
        } else {
            shoppingListItems.push(newItem);
            listChanged = true;
        }
    });

    if (listChanged) {
        saveShoppingList();
        // Re-render only if on the shopping list page
        if (document.body.classList.contains('shopping-list-page')) {
             renderShoppingList(document.getElementById('group-by')?.value || 'category');
        }
    }
    return listChanged;
}

/** Globally Exposed Function for Recipe Page */
window.addToGlobalShoppingList = function(ingredients, sourceRecipeName = 'Recipe') {
    console.log(`addToGlobalShoppingList called for ${sourceRecipeName}`);
    loadShoppingList(); // Ensure we have the latest list
    const processedIngredients = ingredients.map(ing => ({
        id: ing.id || null, // Use specific ID if available from recipe.js
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes,
        sourceRecipe: sourceRecipeName,
        isCustom: false,
        category: determineCategory(ing.name),
        ingredientLink: ing.ingredientLink || null // Pass link if available
    }));
    return addItemToShoppingList(processedIngredients);
};

/** Basic helper to determine store category */
function determineCategory(ingredientName) {
    const nameLower = (ingredientName || '').toLowerCase();
    if (/\b(apple|onion|lettuce|tomato|garlic|potato|carrot|pepper|basil|cilantro|parsley|lemon|lime|berry|berries|banana|orange|grape|mushroom)\b/.test(nameLower)) return 'Produce';
    if (/\b(milk|cheese|butter|yogurt|cream|egg|eggs|sour cream|cottage cheese|parmesan|mozzarella|cheddar)\b/.test(nameLower)) return 'Dairy & Refrigerated';
    if (/\b(beef|chicken|pork|sausage|shrimp|fish|salmon|bacon|turkey|ground meat|lamb|steak)\b/.test(nameLower)) return 'Meat & Seafood';
    if (/\b(bread|flour|sugar|pasta|rice|cereal|oil|vinegar|can|canned|beans|lentils|spice|sauce|broth|stock|nut|seed|oat|quinoa|condiment|jam|jelly|peanut butter|honey|maple syrup)\b/.test(nameLower)) return 'Pantry';
    if (/\b(wine|beer|juice|soda|water|coffee|tea)\b/.test(nameLower)) return 'Beverages';
    if (/\b(ice cream|frozen|pizza|waffle|pea|corn|spinach)\b/.test(nameLower) && !/\b(corn syrup)\b/.test(nameLower)) return 'Frozen'; // Avoid corn syrup in frozen
    if (/\b(soap|paper towel|napkin|foil|wrap|cleaner|trash bag|sponge)\b/.test(nameLower)) return 'Household';
    return 'Uncategorized';
}

/** Basic helper to combine quantities */
function combineQuantities(qty1, qty2, unit) {
    // Very basic - only combines numbers, assumes same unit. Needs improvement for fractions/unit conversion.
    const num1 = parseFloat(qty1) || 0;
    const num2 = parseFloat(qty2) || 0;
    // In a real app, use parseFraction and potentially convert units before adding
    const result = num1 + num2;
    // Use formatNumber if available
    return typeof formatNumber === 'function' ? formatNumber(result) : result.toString();
}

// --- Event Handlers for Shopping List Page ---
function handleItemCheck(event) {
    const checkbox = event.target;
    const listItem = checkbox.closest('.shopping-list-item');
    const label = listItem?.querySelector('.item-details');
    const itemId = listItem?.dataset.itemId;
    if (!itemId) return;

    const itemIndex = shoppingListItems.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        shoppingListItems[itemIndex].isChecked = checkbox.checked;
        label?.classList.toggle('item-checked', checkbox.checked);
        saveShoppingList();
    }
}
function handleQuantityChange(event) {
    const input = event.target;
    const listItem = input.closest('.shopping-list-item');
    const itemId = listItem?.dataset.itemId;
    const newQuantity = input.value.trim();
    if (!itemId || newQuantity === '') return;

    const itemIndex = shoppingListItems.findIndex(item => item.id === itemId);
    if (itemIndex > -1 && shoppingListItems[itemIndex].quantity !== newQuantity) {
        shoppingListItems[itemIndex].quantity = newQuantity;
        saveShoppingList();
        console.log(`Item ${itemId} quantity updated to: ${newQuantity}`);
    }
}
function handleItemRemove(event) {
    const button = event.currentTarget;
    const listItem = button.closest('.shopping-list-item');
    const itemId = listItem?.dataset.itemId;
    if (!itemId) return;

    const itemName = listItem.querySelector('.item-name')?.textContent || 'this item';
    if (confirm(`Are you sure you want to remove "${itemName}"?`)) {
        shoppingListItems = shoppingListItems.filter(item => item.id !== itemId);
        saveShoppingList();
        renderShoppingList(document.getElementById('group-by')?.value || 'category');
    }
}
function handleGroupChange(event) {
    renderShoppingList(event.target.value || 'category');
}
function handleClearChecked() {
    const checkedCount = shoppingListItems.filter(item => item.isChecked).length;
    if (checkedCount === 0) { alert("No items are checked."); return; }
    if (confirm(`Are you sure you want to remove ${checkedCount} checked item(s)?`)) {
        shoppingListItems = shoppingListItems.filter(item => !item.isChecked);
        saveShoppingList();
        renderShoppingList(document.getElementById('group-by')?.value || 'category');
    }
}
function handleClearAll() {
    if (shoppingListItems.length === 0) { alert("The list is already empty."); return; }
    if (confirm("Are you sure you want to clear the entire list? This cannot be undone.")) {
        shoppingListItems = [];
        saveShoppingList();
        renderShoppingList();
    }
}
function handleAddCustomItem(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('#custom-item-name');
    const messageDiv = document.getElementById('list-message');
    const itemName = input.value.trim();
    clearMessages(messageDiv); // Assuming clearMessages exists

    if (itemName) {
        const newItem = { name: itemName, quantity: '1', unit: '', isCustom: true };
        if (addItemToShoppingList(newItem)) {
             input.value = ''; // Clear input
        } else {
            showError(messageDiv || form, "Failed to add custom item."); // Assuming showError exists
        }
    } else {
        showError(messageDiv || form, "Please enter an item name.");
    }
}

// --- Initial Setup on Shopping List Page ---
if (document.body.classList.contains('shopping-list-page') || document.querySelector('.shopping-list-page')) {
    loadShoppingList();
    renderShoppingList(); // Initial render

    document.getElementById('group-by')?.addEventListener('change', handleGroupChange);
    document.getElementById('clear-checked-btn')?.addEventListener('click', handleClearChecked);
    document.getElementById('clear-all-btn')?.addEventListener('click', handleClearAll);
    document.getElementById('add-custom-item-form')?.addEventListener('submit', handleAddCustomItem);
     console.log("Shopping list page fully initialized.");
}


// =========================================================================
// Cooklist Interactions (Simulating API Calls) - Exposed Globally
// =========================================================================
/** Function called from other scripts to add/remove recipe from cooklist. */
window.addToGlobalCooklist = function(recipeId) {
    console.log(`addToGlobalCooklist called for recipe ID: ${recipeId} (Simulation)`);
    if (!recipeId) {
        console.error("No recipeId provided to addToGlobalCooklist");
        return { success: false };
    }
    // Check simulated login state
     const isLoggedIn = sessionStorage.getItem('ICDBLoggedIn') === 'true';
     if (!isLoggedIn) {
         alert("Please log in to manage cooklists.");
         return { success: false };
     }

    // Simulate backend call & return status
    // In real app: fetch API, update based on response
    const ICDB document.querySelector(`.recipe-actions .btn[data-recipe-id="${recipeId}"], #add-to-cooklist-btn[data-recipe-id="${recipeId}"]`); // Find button
    const isCurrentlyAdded = button ? button.classList.contains('active') : Math.random() > 0.5; // Simulate cICDBtate
    const action = isCurrentlyAdded ? 'remove' : 'add';

    console.log(`Simulating ${action} successful for recipe ${recipeId}.`);
    return { success: true, added: !isCurrentlyAdded }; // Return *new* status
};


// ===============================ICDB==================================
// Assume utility functions like parseFraction, formatNumber, showError,
// clearMessages are available if defined elsewhere (e.g., recipe.js or utils.js)
// Define minimal versions if needed:
function parseFraction(str) ICDB parseFloat(str) || 0; }
function formatNumber(num) { return String(Math.round(num * 100) / 100); }
function showError(element, message) { if(element) { element.textContent = message; element.style.color='red'; element.style.display='block';} }
function clearMessages(element) { if(element) { element.textContent = ''; element.style.display='none';} }
// =========================================================================