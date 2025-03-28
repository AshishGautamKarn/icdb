
/* ========================================================================= */
/* submit-recipe.js - JS for the Recipe Submission Page                    */
/* Handles dynamic adding/removing of ingredients & steps, image preview,  */
/* client-side validation, and simulated form submission.                  */
/* ========================================================================= */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('submit-recipe-form');
    if (submitForm) {
        console.log("Initializing Recipe Submission Form...");
        initRecipeSubmissionForm(submitForm);
    }
});

/**
 * Initializes the recipe submission form interactions.
 * @param {HTMLFormElement} form - The recipe submission form element.
 */
function initRecipeSubmissionForm(form) {
    const ingredientsEditor = form.querySelector('#ingredient-list-editor');
    const addIngredientBtn = form.querySelector('#add-ingredient-btn');
    const ingredientTemplate = form.querySelector('#ingredient-template');

    const instructionsEditor = form.querySelector('#instruction-list-editor');
    const addInstructionBtn = form.querySelector('#add-instruction-btn');
    const instructionTemplate = form.querySelector('#instruction-template');

    const imageInput = form.querySelector('#recipe-image-upload');
    const imagePreviewContainer = form.querySelector('#image-preview');
    const imagePreviewImg = imagePreviewContainer?.querySelector('img');

    if (!ingredientsEditor || !addIngredientBtn || !ingredientTemplate ||
        !instructionsEditor || !addInstructionBtn || !instructionTemplate ||
        !imageInput || !imagePreviewContainer || !imagePreviewImg) {
        console.error("One or more required elements for recipe submission form not found. Aborting init.");
        return;
    }

    // --- Ingredient Handling ---
    addIngredientBtn.addEventListener('click', () => {
        addDynamicItem(ingredientsEditor, ingredientTemplate);
    });
    // Use event delegation for removing ingredients
    ingredientsEditor.addEventListener('click', (event) => {
        if (event.target.closest('.remove-ingredient-btn')) {
            removeDynamicItem(event.target.closest('.ingredient-item'));
        }
    });
    // Add initial ingredient row if desired
     addDynamicItem(ingredientsEditor, ingredientTemplate);

    // --- Instruction Handling ---
    addInstructionBtn.addEventListener('click', () => {
        addDynamicItem(instructionsEditor, instructionTemplate, updateInstructionStepNumbers);
    });
    // Use event delegation for removing instructions
    instructionsEditor.addEventListener('click', (event) => {
        if (event.target.closest('.remove-instruction-btn')) {
            removeDynamicItem(event.target.closest('.instruction-item'), updateInstructionStepNumbers);
        }
    });
     // Add initial instruction step if desired
     addDynamicItem(instructionsEditor, instructionTemplate, updateInstructionStepNumbers);


    // --- Image Preview ---
    imageInput.addEventListener('change', (event) => {
        handleImagePreview(event, imagePreviewContainer, imagePreviewImg);
    });

    // --- Form Submission ---
    form.addEventListener('submit', handleRecipeSubmit);

    console.log("Recipe submission form initialized.");
}

/**
 * Adds a new item (ingredient or instruction) based on a template.
 * @param {HTMLElement} editorContainer - The container to add the item to.
 * @param {HTMLTemplateElement} templateElement - The template element to clone.
 * @param {Function} [callback] - Optional callback function to run after adding (e.g., update step numbers).
 */
function addDynamicItem(editorContainer, templateElement, callback) {
    if (!editorContainer || !templateElement) return;

    const newItem = templateElement.content.firstElementChild.cloneNode(true);
    editorContainer.appendChild(newItem);

    // Focus the first input of the new item (optional UX improvement)
    const firstInput = newItem.querySelector('input, textarea');
    firstInput?.focus();

    if (typeof callback === 'function') {
        callback(editorContainer); // Call the callback (e.g., update step numbers)
    }
}

/**
 * Removes a dynamic item (ingredient or instruction).
 * @param {HTMLElement} itemToRemove - The item element (e.g., .ingredient-item) to remove.
 * @param {Function} [callback] - Optional callback function to run after removal (e.g., update step numbers).
 */
function removeDynamicItem(itemToRemove, callback) {
    if (itemToRemove) {
        const container = itemToRemove.parentElement;
        itemToRemove.remove();
        if (typeof callback === 'function' && container) {
            callback(container); // Call the callback after removing
        }
    }
}

/**
 * Updates the step numbers for instruction items.
 * @param {HTMLElement} instructionsContainer - The container holding instruction items.
 */
function updateInstructionStepNumbers(instructionsContainer) {
    const items = instructionsContainer.querySelectorAll('.instruction-item');
    items.forEach((item, index) => {
        const label = item.querySelector('.step-label .step-number'); // Find the number span
        if (label) {
            label.textContent = index + 1; // Update step number (1-based index)
        }
         // Update the label's 'for' attribute if inputs have dynamic IDs (less common)
    });
}

/**
 * Handles the image file input change to show a preview.
 * @param {Event} event - The file input change event.
 * @param {HTMLElement} previewContainer - The container div for the preview.
 * @param {HTMLImageElement} previewImg - The img element to show the preview in.
 */
function handleImagePreview(event, previewContainer, previewImg) {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            previewContainer.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        // Clear preview if no file or invalid file selected
        previewImg.src = '';
        previewImg.style.display = 'none';
        previewContainer.style.display = 'none';
    }
}

/**
 * Handles the submission of the recipe form (Simulated).
 * @param {Event} event - The form submission event.
 */
function handleRecipeSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const messageDiv = form.querySelector('#submit-message');
    const submitButton = form.querySelector('#submit-recipe-btn');

    clearMessages(messageDiv); // Assuming clearMessages exists globally or locally

    // --- Basic Client-Side Validation ---
    let isValid = true;
    // Title
    if (!form.querySelector('#recipe-title').value.trim()) {
         isValid = false;
         showError(messageDiv, "Recipe Title is required."); // Using showError helper
         form.querySelector('#recipe-title').focus();
         return;
    }
    // Description
    if (!form.querySelector('#recipe-description').value.trim()) {
         isValid = false;
         showError(messageDiv, "Recipe Description is required.");
         form.querySelector('#recipe-description').focus();
         return;
    }
     // Servings
     if (!form.querySelector('#servings').value || parseInt(form.querySelector('#servings').value) <=0) {
         isValid = false;
         showError(messageDiv, "Valid Servings number is required.");
         form.querySelector('#servings').focus();
         return;
     }
      // Difficulty
     if (!form.querySelector('#difficulty').value) {
         isValid = false;
         showError(messageDiv, "Please select a Difficulty Level.");
         form.querySelector('#difficulty').focus();
         return;
     }
    // Ingredients (at least one?)
    if (form.querySelectorAll('.ingredient-item').length === 0 || !form.querySelector('.ingredient-item .input-name')?.value.trim()) {
         isValid = false;
         showError(messageDiv, "Please add at least one valid ingredient.");
         form.querySelector('#add-ingredient-btn').focus();
         return;
    }
     // Instructions (at least one?)
    if (form.querySelectorAll('.instruction-item').length === 0 || !form.querySelector('.instruction-item .input-step')?.value.trim()) {
         isValid = false;
         showError(messageDiv, "Please add at least one instruction step.");
          form.querySelector('#add-instruction-btn').focus();
         return;
    }
     // Image
    if (!form.querySelector('#recipe-image-upload').files[0]) {
         isValid = false;
         showError(messageDiv, "Please upload a recipe photo.");
         form.querySelector('#recipe-image-upload').focus();
         return;
    }
      // Terms
     if (!form.querySelector('#terms-agree').checked) {
         isValid = false;
         showError(messageDiv, "You must agree to the terms.");
          form.querySelector('#terms-agree').focus();
         return;
    }


    if (!isValid) return; // Should have returned earlier, but double check

    // --- SIMULATED SUBMISSION ---
    console.log("Simulating recipe submission...");
    showProcessing(submitButton, true); // Assuming showProcessing exists globally or locally

    const formData = new FormData(form);

    // Log FormData (useful for debugging, don't log sensitive data in production)
    console.log("Form Data to be submitted (Simulation):");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    const apiUrl = form.action; // Get URL from form's action attribute
    const method = form.method;

    // ** Replace with actual fetch call **
    // fetch(apiUrl, {
    //     method: method.toUpperCase(),
    //     body: formData, // Send FormData directly for multipart/form-data (handles file)
    //     headers: {
    //         // Content-Type is set automatically by browser for FormData
    //         // Add Auth Header (JWT?), CSRF Token header if needed
    //         // 'Authorization': 'Bearer YOUR_TOKEN',
    //         // 'X-CSRFToken': getCookie('csrftoken') // Example CSRF
    //     }
    // })
    // .then(response => {
    //     if (!response.ok) {
    //         // Handle validation errors (400/422) or server errors (500)
    //          return response.json().then(err => { throw err; });
    //     }
    //     return response.json(); // Expecting { success: true, recipeId: '...', message: '...' }
    // })
    // .then(data => {
    //     console.log("Recipe submission successful:", data);
    //     showSuccess(messageDiv, data.message || "Recipe submitted successfully! It will be reviewed shortly.");
    //     form.reset(); // Clear the form
    //      // Clear dynamic lists and image preview
    //      document.getElementById('ingredient-list-editor').innerHTML = '';
    //      document.getElementById('instruction-list-editor').innerHTML = '';
    //      const previewImg = document.querySelector('#image-preview img');
    //      if(previewImg) {
    //          previewImg.src = '';
    //          previewImg.style.display = 'none';
    //          previewImg.closest('.upload-preview').style.display = 'none';
    //      }
    //      addDynamicItem(document.getElementById('ingredient-list-editor'), document.getElementById('ingredient-template')); // Add back initial row
    //      addDynamicItem(document.getElementById('instruction-list-editor'), document.getElementById('instruction-template'), updateInstructionStepNumbers); // Add back initial row
    //      // Maybe redirect to the new recipe page or user's profile?
    //      // window.location.href = `/recipe-detail.html?id=${data.recipeId}`;
    // })
    // .catch(error => {
    //      console.error("Recipe submission error:", error);
    //      // Handle specific field errors if backend provides them
    //      let errorMessage = error.message || "Failed to submit recipe. Please check your input and try again.";
    //      if (error.errors) {
    //          errorMessage = "Please correct the errors in the form.";
    //          // Optionally highlight specific fields based on error.errors
    //      }
    //      showError(messageDiv, errorMessage);
    // })
    // .finally(() => {
    //     showProcessing(submitButton, false);
    // });

    // ---- Start Simulation ----
    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% chance success
        if (success) {
            console.log("Simulated recipe submission successful.");
            showSuccess(messageDiv, "Recipe submitted for review! (Simulation)"); // Assuming showSuccess exists
            form.reset();
            // Clear dynamic lists and image preview
            document.getElementById('ingredient-list-editor').innerHTML = '';
            document.getElementById('instruction-list-editor').innerHTML = '';
            const previewImg = document.querySelector('#image-preview img');
            if(previewImg) {
                previewImg.src = '';
                previewImg.style.display = 'none';
                previewImg.closest('.upload-preview').style.display = 'none';
            }
            // Add back initial rows after reset
            addDynamicItem(document.getElementById('ingredient-list-editor'), document.getElementById('ingredient-template'));
            addDynamicItem(document.getElementById('instruction-list-editor'), document.getElementById('instruction-template'), updateInstructionStepNumbers);
            alert("Recipe submitted successfully! (Simulation)");
            // Maybe redirect? window.location.href = 'index.html';

        } else {
            console.log("Simulated recipe submission failed.");
            showError(messageDiv, "Failed to submit recipe. Please try again. (Simulation)"); // Assuming showError exists
        }
        showProcessing(submitButton, false);
    }, 1500);
    // ---- End Simulation ----
}

// =========================================================================
// Assume helper functions like showProcessing, showError, showSuccess,
// clearMessages are available (potentially from main.js or auth.js or a utils file)
// =========================================================================
// Define them here if they aren't available globally

function showProcessing(button, isLoading) { /* ... implementation ... */ }
function showError(element, message) { /* ... implementation ... */ }
function showSuccess(element, message) { /* ... implementation ... */ }
function clearMessages(...elements) { /* ... implementation ... */ }
// Add implementations from previous examples if these aren't in main.js