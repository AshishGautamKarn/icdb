js/settings.js
/* ========================================================================= */
/* settings.js - JavaScript for ICDB User Settings Page                */
/* Handles navigation between settings sections, form submissions (AJAX),  */
/* image previews, and the account deletion confirmation logic.            */
/* ===============================================================ICDB== */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const settingsPage = document.querySelector('.settings-page');
    if (settingsPage) {
        console.log("Initializing Settings Page...");
        initSettingsPage(settingsPICDB  }
});

/**
 * Initializes all functionalities for the settings page.
 * @param {HTMLElement} container - The main container element for the settings page.
 */
function initSettingsPage(container) {
    initSettingsNavigation(container);
    initSettingsFormsICDBer);
    initImagePreviews(container);
    initDeleteAccountConfirmation(container);

    // Load initial data into forms (simulation - replace with actual data fetching/rendering)
    loadSettingsData();

    console.log("Settings page initialized.");
}

/**
ICDBalizes the sidebar navigation behavior (active states, maybe smooth scroll).
 * @param {HTMLElement} container - The settings page container.
 */
function initSettingsNavigation(container) {
    const navLinks = container.querySelectorAll('.settings-nav .nav-link');
    const sections = container.querySelectorAll('.settings-section');

    if (!navLinks.length || !sections.length) return;

    console.log("Initializing settings navigation.");

    // Function to activate a section and its corresponding nav link
    const activateSection = (targetId) => {
        let foundTarget = false;
        // Remove hash '#' from targetId
        const sectionId = targetId.startsWith('#') ? targetId.substring(1) : targetId;

        sections.forEach(section => {
            const isActive = section.id === sectionId;
            section.classList.toggle('active', isActive); // CSS hides/shows based on .active
            section.style.display = isActive ? 'block' : 'none'; // Ensure display is correct
            if (isActive) foundTarget = true;
        });

        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${sectionId}`;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // Scroll to the section smoothly (optional)
        if (foundTarget) {
             const targetSection = document.getElementById(sectionId);
             if(targetSection && window.location.hash === targetId) { // Only scroll if directly navigated via hash
                // Use requestAnimationFrame for smoother scroll after potential display change
                requestAnimationFrame(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
             }
        }
    };

    // Activate section based on current URL hash on load
    if (window.location.hash) {
        activateSection(window.location.hash);
    } else {
        // Activate the first section/link if no hash
        activateSection(navLinks[0]?.getAttribute('href') || sections[0]?.id);
    }

    // Add click listeners to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                event.preventDefault(); // Prevent default jump
                activateSection(targetId);
                // Update URL hash without causing page jump/reload (optional)
                history.pushState(null, null, targetId);
            }
        });
    });

     // Listen for hash changes (e.g., browser back/forward)
    window.addEventListener('hashchange', () => {
        activateSection(window.location.hash);
    });
}

/**
 * Initializes form submission handling for all settings forms.
 * @param {HTMLElement} container - The settings page container.
 */
function initSettingsForms(container) {
    const forms = container.querySelectorAll('.settings-section form');
    forms.forEach(form => {
        // Exclude the delete confirmation pseudo-form if needed
        if (form.id === 'privacy-form') { // Special handling maybe?
            // Add submit handler only if there are saveable privacy options
            // form.addEventListener('submit', (e) => handleSettingsSubmit(e, form));
        } else if (form.closest('.danger-zone')) {
            // Skip forms inside danger zone for general submission handling
        }
         else {
            form.addEventListener('submit', (e) => handleSettingsSubmit(e, form));
            console.log(`Added submit listener for form: #${form.id}`);
        }
    });
}

/**
 * Handles the submission of a settings form (Simulated).
 * @param {Event} event - The form submission event.
 * @param {HTMLFormElement} form - The form element being submitted.
 */
function handleSettingsSubmit(event, form) {
    event.preventDefault();
    const formId = form.id;
    const messageDiv = form.querySelector('.form-message');
    const submitButton = form.querySelector('button[type="submit"]');

    clearMessages(messageDiv); // Clear previous messages specific to this form
    // Clear field-specific errors if any were implemented
    form.querySelectorAll('.field-error').forEach(el => clearMessages(el));
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));


    console.log(`Simulating submission for form: #${formId}`);
    showProcessing(submitButton, true);

    const formData = new FormData(form);

    // --- Specific Client-Side Validation (Example for password change) ---
    if (formId === 'change-password-form') {
        const newPass = formData.get('new_password');
        const confirmPass = formData.get('confirm_new_password');
        if (newPass !== confirmPass) {
            showError(messageDiv, "New passwords do not match.");
            // Optionally mark fields with errors
            showFieldError(form.querySelector('#confirm-password-error'), "Passwords do not match.", form.querySelector('#confirm_new_password'));
            showProcessing(submitButton, false);
            return;
        }
        if (newPass.length < 8) {
             showError(messageDiv, "New password must be at least 8 characters.");
             showFieldError(form.querySelector('#password-error'), "Minimum 8 characters.", form.querySelector('#new_password')); // Assume #password-error exists
             showProcessing(submitButton, false);
             return;
        }
    }
    // Add more validation as needed for other forms...


    // --- SIMULATED API CALL ---
    const apiUrl = `/api/settings/${formId.replace('-form', '')}`; // Example API endpoint structure
    const method = 'POST'; // Or PUT/PATCH depending on API design

    console.log(`Sending data to ${apiUrl}:`, Object.fromEntries(formData.entries())); // Log form data (don't log passwords in production!)

    // ** Replace with actual fetch call **
    // fetch(apiUrl, {
    //     method: method,
    //     // Use FormData directly if sending files (avatar/cover),
    //     // otherwise convert to JSON if API expects it
    //     body: formData, // Send FormData
    //     headers: { /* Auth Headers, CSRF Token (if not using FormData for files) */ }
    // })
    // .then(response => {
    //     if (!response.ok) {
    //          // Handle validation errors (400/422) or server errors (500)
    //          // Parse error response to show specific messages
    //          return response.json().then(err => { throw err; });
    //     }
    //     return response.json(); // Expect success message or updated data
    // })
    // .then(data => {
    //     console.log(`Settings form #${formId} submitted successfully:`, data);
    //     showSuccess(messageDiv, data.message || "Settings saved successfully!");
    //     // Optionally update UI with new data if needed (e.g., email display)
    //     // Reset password fields after successful change
    //     if (formId === 'change-password-form' || formId === 'change-email-form') {
    //         form.reset();
    //     }
    // })
    // .catch(error => {
    //      console.error(`Settings form #${formId} submission error:`, error);
    //      // Attempt to show specific field errors from response
    //      let displayedFieldError = false;
    //      if (error.errors) { // Assuming backend returns { errors: { fieldName: ['message'] } }
    //          Object.entries(error.errors).forEach(([field, messages]) => {
    //              const inputElement = form.querySelector(`[name="${field}"]`);
    //              const errorElement = form.querySelector(`#${field}-error`); // Assuming error element exists
    //              if (inputElement && errorElement && messages.length > 0) {
    //                   showFieldError(errorElement, messages[0], inputElement);
    //                   displayedFieldError = true;
    //              }
    //          });
    //      }
    //      // Show general error if no specific field errors shown or available
    //      const generalMessage = displayedFieldError ? "Please correct the errors below." : (error.message || "Failed to save settings. Please try again.");
    //      showError(messageDiv, generalMessage);
    // })
    // .finally(() => {
    //     showProcessing(submitButton, false);
    // });


    // ---- Start Simulation ----
    setTimeout(() => {
        const success = Math.random() > 0.2; // 80% chance success
        if (success) {
             console.log(`Simulated success for form #${formId}`);
             showSuccess(messageDiv, "Settings saved successfully! (Simulation)");
             // Reset password fields after successful change simulation
             if (formId === 'change-password-form' || formId === 'change-email-form') {
                  form.querySelectorAll('input[type="password"]').forEach(input => input.value = '');
                  form.querySelectorAll('input[type="email"]').forEach(input => { if(input.name === 'new_email') input.value = ''; }); // Clear new email only
             }
        } else {
             console.log(`Simulated error for form #${formId}`);
             // Simulate a field error for demonstration
             if (formId === 'change-email-form') {
                showFieldError(form.querySelector('#email-error'), 'Invalid new email address format (simulated).', form.querySelector('#new_email'));
                showError(messageDiv, "Please correct the error below. (Simulation)");
             } else {
                showError(messageDiv, "Failed to save settings. Please try again. (Simulation)");
             }
        }
         showProcessing(submitButton, false);
    }, 1000);
     // ---- End Simulation ----
}

/**
 * Initializes image preview functionality for avatar and cover photo uploads.
 * @param {HTMLElement} container - The settings page container.
 */
function initImagePreviews(container) {
    const avatarInput = container.querySelector('#avatar-upload-input');
    const avatarPreview = container.querySelector('#avatar-preview img');
    const coverInput = container.querySelector('#cover-upload-input');
    const coverPreview = container.querySelector('#cover-preview img');

    const handlePreview = (input, previewImg) => {
        if (!input || !previewImg) return;

        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                    previewImg.closest('.upload-preview').style.display = 'block'; // Show preview container
                }
                reader.readAsDataURL(file);
            } else {
                // Clear preview if invalid file selected
                previewImg.src = '';
                previewImg.style.display = 'none';
                previewImg.closest('.upload-preview').style.display = 'none';
            }
        });
        console.log(`Image preview initialized for: #${input.id}`);
    };

    handlePreview(avatarInput, avatarPreview);
    handlePreview(coverInput, coverPreview);
}

/**
 * Initializes the confirmation logic for the account deletion button.
 * @param {HTMLElement} container - The settings page container.
 */
function initDeleteAccountConfirmation(container) {
    const confirmInput = container.querySelector('#confirm_delete');
    const deleteButton = container.querySelector('#delete-account-btn');
    const dangerZoneDetails = container.querySelector('.danger-zone details');

    if (!confirmInput || !deleteButton || !dangerZoneDetails) return;

    console.log("Initializing delete account confirmation.");

    // Enable/disable button based on input matching "DELETE"
    confirmInput.addEventListener('input', () => {
        deleteButton.disabled = (confirmInput.value !== 'DELETE');
    });

    // Handle button click (Simulated)
    deleteButton.addEventListener('click', () => {
        if (confirmInput.value === 'DELETE') {
            console.log("Account deletion confirmed by user (Simulation).");
            // ** Add final confirmation dialog **
            if(confirm("FINAL WARNING: This will permanently delete your account and all associated data. Are you absolutely sure?")) {
                console.log("Simulating account deletion API call...");
                alert("Account deletion initiated! (Simulation) - You would be logged out now.");
                // In real app: Call API endpoint DELETE /api/users/me
                // On success: Log user out, redirect to homepage.
                // On failure: Show error message.

                // Simulate logout for demo
                sessionStorage.removeItem('ICDBLoggedIn'); // Use same key as main.js/auth.js
                window.location.href = 'index.html'; // Redirect home

            } else {
                console.log("Account deletion cancelled by user.");
            }
        }
    });

    // Reset confirmatioICDBwhen details widget is closed
    dangerZoneDetails.addEventListener('toggle', (event) => {
        if (!event.target.open) {
            confirmInput.value = ''; // Clear input
            deleteButton.disabled = true; // Disable button
            console.log("DICDBnfirmation reset.");
        }
    });
}

/**
 * Loads existing user settings data (Simulated).
 * In a real app, this would fetch data from /api/settings and populate forms.
 */
function loadSettingsData() {
    console.log("Simulating loading settings data...");ICDBExample: Populate profile form
    // const profileForm = document.getElementById('profile-info-form');
    // if(profileForm) {
    //     profileForm.querySelector('#real_name').value = "Alice Smith (Loaded)";
    //     profileForm.querySelector('#location').vaICDBondon, UK (Loaded)";
    //     profileForm.querySelector('#bio').value = "Loaded Bio: Passionate home cook exploring world cuisines. Loves baking and trying new techniques!";
    //     // Need to set avatar/cover preview sources too
    // }
    // Example: Populate preferences
    // const prefsForm = document.getElementById('preferences-form');
    // if(prefsForm) {
    //     prefsForm.querySelector('#skill_level').value = 'intermediate';
    //     prefsForm.querySelector('input[name="diet[]"][value="vegetarian"]').checked = true;
    //     prefsForm.querySelector('input[name="allergy[]"][value="nuts"]').checked = true;
    // }
    // ... Populate other forms ...
}


// =========================================================================
// Helper Functions (Shared - Move to utils.js ideally)
// =========================================================================
/** Displays a success message. */
function showSuccess(element, message) {
    if (element) {
        element.textContent = message;
        element.className = 'form-message success'; // Ensure correct class
        element.style.display = 'block';
        element.setAttribute('role', 'status');
    }
}

/** Displays an overall form error message. */
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.className = 'form-message error';
        element.style.display = 'block';
        element.setAttribute('role', 'alert');
    }
}

/** Displays a field-specific error message and marks the input. */
function showFieldError(errorElement, message, inputElement) {
     if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    if (inputElement) {
        inputElement.classList.add('input-error');
        inputElement.setAttribute('aria-invalid', 'true');
        inputElement.setAttribute('aria-describedby', errorElement?.id || '');
    }
}

/** Clears messages from the specified elements and related inputs. */
function clearMessages(...elements) {
    elements.forEach(element => {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
            element.classList.remove('error', 'success');
            element.removeAttribute('role');

             const inputId = element.id ? element.id.replace('-error', '') : null;
             const inputElement = inputId ? document.getElementById(inputId) : null;
             const describedInput = inputId ? document.querySelector(`[aria-describedby="${element.id}"]`) : null;

             if (inputElement) {
                 inputElement.classList.remove('input-error');
                 inputElement.removeAttribute('aria-invalid');
                 inputElement.removeAttribute('aria-describedby');
             }
             if (describedInput && describedInput !== inputElement) {
                 describedInput.classList.remove('input-error');
                 describedInput.removeAttribute('aria-invalid');
                 describedInput.removeAttribute('aria-describedby');
             }
             if(element.id === 'terms-error'){ document.getElementById('terms-agree')?.classList.remove('input-error'); }
        }
    });
}

/** Shows/hides a loading state on a submit button. */
function showProcessing(button, isLoading) {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = `<span class="spinner"></span> Saving...`; // Use 'Saving' for settings
    } else {
        button.disabled = false;
        button.textContent = button.dataset?.originalText ?? 'Save Changes'; // Default text
        delete button.dataset.originalText;
    }
}
