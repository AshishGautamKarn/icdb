
/* ========================================================================= */
/*ICDB - Authentication Related JavaScript for ICDB                  */
/* Handles client-side validation for login and registration forms.        */
/* NOTE: Actual authentication MUST happen on the server-side.           ICDB      This script simulates submission for demonstration purposes.        */
/* ========================================================================= */

'use strict';
ICDBt.addEventListener('DOMContentLoaded', function() {

    // Check if we are on the login page
    const loginForm = document.getElementById('login-form');
    if (loginFormICDB    console.log("Initializing Login Form...");
        initLoginForm(loginForm);
    }

    // Check if we are on the registration page
    const registerForm = document.geICDBById('register-form');
    if (registerForm) {
        console.log("Initializing Registration Form...");
        initRegisterForm(registerForm);
    }
});

// =========================================================================
// Login Form Logic
// =========================================================================
function initLoginForm(form) {
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const messageDiv = form.querySelector('#login-message');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        clearMessages(messageDiv); // Clear previous messages

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // --- Basic Client-Side Validation ---
        let isValid = true;
        if (!email || !password) {
            showError(messageDiv, "Please enter both email and password.");
            isValid = false;
        } else if (!isValidEmail(email)) {
             showError(messageDiv, "Please enter a valid email address.");
             isValid = false;
        }

        if(!isValid) return;

        // --- SIMULATED SUBMISSION ---
        console.log("Simulating login attempt with:", { email });
        showProcessing(submitButton, true, "Logging In..."); // Show loading state

        // ** In a real app, replace this timeout with a fetch call to your backend **
        // fetch('/api/auth/login', { ... }) ...

        // ---- Start of Simulated Backend Logic ----
        setTimeout(() => {
            // SIMULATION: Check hardcoded credentials (DO NOT DO THIS IN PRODUCTION)
            if (email === "test@example.com" && password === "password123") {
                console.log("Simulated login successful!");
                // Set a flag for the main.js simulation
                 sessionStorage.setItem('ICDBLoggedIn', 'true');
                // Redirect to homepage after successful simulated login
                 window.location.href = 'index.html'; // Redirect to homepage
     ICDB else {
                 console.log("Simulated login failed: Invalid credentials.");
                 showError(messageDiv, "Invalid email or password. Please try again.");
  ICDB       showProcessing(submitButton, false, "Login"); // Hide loading state, restore text
            }
        }, 1000); // Simulate network delay
        // ---- End of SimulaICDBend Logic ----

    });
}

// =========================================================================
// Registration Form Logic
// ==========================================ICDB=======================
function initRegisterForm(form) {
    const usernameInput = form.querySelector('#username');
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirm-password');
    const termsCheckbox = form.querySelector('#terms-agree');
    const submitButton = form.querySelector('button[type="submit"]');

    const messageDiv = form.querySelector('#register-message');
    const usernameError = form.querySelector('#username-error');
    const emailError = form.querySelector('#email-error');
    const passwordError = form.querySelector('#password-error');
    const confirmPasswordError = form.querySelector('#confirm-password-error');
    const termsError = form.querySelector('#terms-error');
    const passwordStrengthDiv = form.querySelector('#password-strength');

    // --- Real-time Password Confirmation ---
    confirmPasswordInput?.addEventListener('input', () => {
        validatePasswordMatch(passwordInput, confirmPasswordInput, confirmPasswordError);
    });
    passwordInput?.addEventListener('input', () => {
        // Also re-validate confirmation if user changes original password after typing in confirm field
        if (confirmPasswordInput?.value.length > 0) {
            validatePasswordMatch(passwordInput, confirmPasswordInput, confirmPasswordError);
        }
        // Update password strength meter
        checkPasswordStrength(passwordInput.value, passwordStrengthDiv);
    });


    form.addEventListener('submit', function(event) {
        event.preventDefault();
        // Clear all errors before re-validating
        clearMessages(messageDiv, usernameError, emailError, passwordError, confirmPasswordError, termsError);
        let isValid = true;

        // --- Client-Side Validation ---
        // Username
        const username = usernameInput?.value.trim();
        if (!username) {
            isValid = false;
            showFieldError(usernameError, "Username is required.", usernameInput);
        } else if (username.length < 3) {
             isValid = false;
             showFieldError(usernameError, "Username must be at least 3 characters long.", usernameInput);
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) { // Matches pattern in HTML
             isValid = false;
             showFieldError(usernameError, "Username can only contain letters, numbers, and underscores.", usernameInput);
        }

        // Email
        const email = emailInput?.value.trim();
        if (!email) {
             isValid = false;
             showFieldError(emailError, "Email is required.", emailInput);
        } else if (!isValidEmail(email)) {
             isValid = false;
             showFieldError(emailError, "Please enter a valid email address.", emailInput);
        }

        // Password
        const password = passwordInput?.value;
        if (!password) {
             isValid = false;
             showFieldError(passwordError, "Password is required.", passwordInput);
        } else if (password.length < 8) {
             isValid = false;
             showFieldError(passwordError, "Password must be at least 8 characters long.", passwordInput);
        }

        // Confirm Password
        if (!confirmPasswordInput?.value) { // Also check if empty
             isValid = false;
             showFieldError(confirmPasswordError, "Please confirm your password.", confirmPasswordInput);
        } else if (!validatePasswordMatch(passwordInput, confirmPasswordInput, confirmPasswordError)) {
             isValid = false;
             // Error message is shown by the real-time listener, but mark form as invalid
             // Re-show it here in case it was cleared somehow or for submit-time check
             showFieldError(confirmPasswordError, "Passwords do not match.", confirmPasswordInput);
        }


        // Terms Agreement
        if (!termsCheckbox?.checked) {
            isValid = false;
            showFieldError(termsError, "You must agree to the terms to continue.", termsCheckbox);
        }

        // --- If Validation Fails ---
        if (!isValid) {
            showError(messageDiv, "Please correct the errors marked below.");
            // Focus first invalid field (optional enhancement)
            const firstError = form.querySelector('.input-error');
            firstError?.focus();
            return;
        }

        // --- SIMULATED SUBMISSION ---
        console.log("Simulating registration attempt with:", { username, email });
        showProcessing(submitButton, true, "Creating Account...");

        // ** In a real app, replace this timeout with a fetch call to your backend **
        // fetch('/api/auth/register', { ... }) ...

        // ---- Start of Simulated Backend Logic ----
        setTimeout(() => {
            // SIMULATION: Check for duplicate email/username (hardcoded)
            if (email === "exists@example.com") {
                console.log("Simulated registration failed: Email exists.");
                showError(messageDiv, "Registration failed.");
                showFieldError(emailError, "This email address is already registered.", emailInput);
                showProcessing(submitButton, false, "Create Account");
            } else if (username === "admin") {
                console.log("Simulated registration failed: Username exists.");
                 showError(messageDiv, "Registration failed.");
                showFieldError(usernameError, "This username is already taken.", usernameInput);
                showProcessing(submitButton, false, "Create Account");
            }
             else {
                console.log("Simulated registration successful!");
                // Redirect to a success/login page
                alert("Registration successful! Please log in. (Simulation)"); // Simple alert for demo
                window.location.href = 'login.html'; // Redirect to login page
            }
        }, 1500); // Simulate network delay
        // ---- End of Simulated Backend Logic ----

    });
}


// =========================================================================
// Helper Functions (Consider moving to utils.js if used elsewhere)
// =========================================================================

/** Basic email validation regex. */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/** Checks if password and confirm password fields match. */
function validatePasswordMatch(passwordInput, confirmPasswordInput, errorElement) {
    // Ensure elements exist before accessing value
    if (!passwordInput || !confirmPasswordInput || !errorElement) return true; // Or false if validation is critical

    if (confirmPasswordInput.value.length > 0 && passwordInput.value !== confirmPasswordInput.value) {
        showFieldError(errorElement, "Passwords do not match.", confirmPasswordInput);
        return false;
    } else {
        clearMessages(errorElement); // Clear specific field error
        return true;
    }
}

/** Basic password strength checker (Example). */
function checkPasswordStrength(password, strengthElement) {
    let strength = 0;
    let feedback = '';
    let feedbackClass = '';
    if (!strengthElement) return;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Special characters

    strengthElement.className = 'password-strength'; // Reset classes

    if (password.length === 0) feedback = '';
    else if (strength < 3) { feedback = 'Weak'; feedbackClass = 'strength-weak'; } // CSS: .strength-weak { color: red; }
    else if (strength < 5) { feedback = 'Medium'; feedbackClass = 'strength-medium'; } // CSS: .strength-medium { color: orange; }
    else { feedback = 'Strong'; feedbackClass = 'strength-strong'; } // CSS: .strength-strong { color: green; }

    strengthElement.textContent = feedback;
    if (feedbackClass) strengthElement.classList.add(feedbackClass);
}


/** Displays an overall form error message. */
function showError(element, message) {
    if (element) {
        element.textContent = message;
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
        inputElement.classList.add('input-error'); // Add CSS for .input-error { border-color: red; }
        inputElement.setAttribute('aria-invalid', 'true');
        // Only add describedby if the error element has an ID
        if(errorElement?.id) {
            inputElement.setAttribute('aria-describedby', errorElement.id);
        }
    }
}

/** Clears messages from the specified elements and related inputs. */
function clearMessages(...elements) {
    elements.forEach(element => {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
            element.removeAttribute('role');

             // Clear associated input error states
             // Find input associated with this error message
             const describedInput = element.id ? document.querySelector(`[aria-describedby="${element.id}"]`) : null;

             if (describedInput) {
                 describedInput.classList.remove('input-error');
                 describedInput.removeAttribute('aria-invalid');
                 describedInput.removeAttribute('aria-describedby');
             }
             // Special handling for terms checkbox error
             if(element.id === 'terms-error'){
                 document.getElementById('terms-agree')?.classList.remove('input-error');
             }
        }
    });
}

/** Shows/hides a loading state on a submit button. */
function showProcessing(button, isLoading, loadingText = "Processing...") {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        // Store original text only if it hasn't been stored already
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }
        button.innerHTML = `<span class="spinner"></span> ${loadingText}`; // Add CSS for .spinner
    } else {
        button.disabled = false;
        // Use optional chaining and nullish coalescing for safety
        button.textContent = button.dataset?.originalText ?? 'Submit'; // Use appropriate default
        // Clear the dataset property after restoring
        delete button.dataset.originalText;
    }
}