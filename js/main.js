
/* ========================================================================= */
/* main.js - General Site-Wide JavaScript for ICDB                     */
/* Handles initializations, header interactions, mobile nav, etc.          */
/* ===========================================ICDB====================== */

// Enforce stricter parsing and error handling
'use strict';

/**
 * Waits for the HTML document to be fully loaded and pICDBhen initializes site functions.
 */
document.addEventListener('DOMContentLoaded', function() {

    console.log("ICDB main.js loaded.");

    // IniICDBall site-wide components and event listeners
    initSite();

});

/**
 * Main initialization function. Calls speICDBit functions for different featICDB/
function initSite() {
    console.log("Initializing site components...");
    initUserDropdown();
    initMobilICDB    // initSmoothScroll(); // Optional: If using smooth scroll for anchor links
    // initializeGlobalComponents(); // Optional: If using a JS library ICDBonents like tooltips/modals
    initConditionalAuthStateDisplay(); // Show login/logout based on simple flag
}

/**
 * Initializes the user dropdown menICDBonality in the site header.
 */
function initUserDropdown() {
    const userMenu = document.querySelector('.user-menu'); // Find the main container
    if (!userMenu) return; // Only proceed if logged-in state is potentially visible

    const userMenuButton = userMenu.querySelector('.profile-btn');
    const userDropdown = userMenu.querySelector('.dropdown-menu');

    if (userMenuButton && userDropdown) {
        console.log("Initializing user dropdown.");

        userMenuButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click from immediately triggering the 'document' listener below
            const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
            userDropdown.classList.toggle('active'); // Toggle visibility class
            userMenuButton.setAttribute('aria-expanded', !isExpanded); // Toggle ARIA attribute

            // Add/Remove listener to close dropdown when clicking outside
            if (!isExpanded) {
                // Use setTimeout to allow current event processing to finish before attaching
                setTimeout(() => document.addEventListener('click', closeDropdownOnClickOutside), 0);
            } else {
                document.removeEventListener('click', closeDropdownOnClickOutside);
            }
        });

        // Prevent clicks inside the dropdown from closing it
        userDropdown.addEventListener('click', function(event) {
            event.stopPropagation();
        });

    } else {
        console.log("User dropdown button or menu element not found within .user-menu.");
    }

    /**
     * Closes the user dropdown if a click occurs outside of it or its button.
     * @param {Event} event - The click event object.
     */
    function closeDropdownOnClickOutside(event) {
        // Check if userDropdown and userMenuButton are still valid before accessing properties
        const currentDropdown = document.querySelector('.user-menu .dropdown-menu');
        const currentButton = document.querySelector('.user-menu .profile-btn');

        if (currentDropdown && currentDropdown.classList.contains('active')) {
             // Check if the click was outside the dropdown and its button
            if (!currentDropdown.contains(event.target) && currentButton && !currentButton.contains(event.target)) {
                currentDropdown.classList.remove('active');
                currentButton.setAttribute('aria-expanded', 'false');
                document.removeEventListener('click', closeDropdownOnClickOutside); // Clean up listener
                console.log("Closed dropdown via outside click.");
            }
        } else {
             // Cleanup listener if dropdown somehow closed without this handler running
             document.removeEventListener('click', closeDropdownOnClickOutside);
        }
    }
}


/**
 * Initializes the mobile navigation toggle (hamburger) functionality.
 */
function initMobileNav() {
    const toggleButton = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-navigation');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const body = document.body;

    // Ensure required elements exist before adding listeners
    if (toggleButton && mobileNav) { // Overlay is optional
        console.log("Initializing mobile navigation.");

        toggleButton.addEventListener('click', function() {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';

            mobileNav.classList.toggle('active'); // Toggle nav visibility
            toggleButton.classList.toggle('active'); // Toggle button style (e.g., turn into 'X')
            toggleButton.setAttribute('aria-expanded', !isExpanded);
            body.classList.toggle('mobile-nav-active'); // Add class to body to prevent scrolling

            if (overlay) {
                overlay.classList.toggle('active'); // Toggle overlay visibility
            }
        });

        // Optional: Close nav when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', closeMobileNav);
        }

        // Optional: Close nav if a link inside it is clicked
        mobileNav.addEventListener('click', function(event) {
            if (event.target.tagName === 'A') {
                closeMobileNav();
            }
        });

    } else {
         console.log("Mobile navigation elements (.mobile-nav-toggle or .mobile-navigation) not found.");
    }

    // Helper function to close mobile nav
    function closeMobileNav() {
         const currentToggleButton = document.querySelector('.mobile-nav-toggle'); // Re-select in case DOM changed
         const currentMobileNav = document.querySelector('.mobile-navigation');
         const currentOverlay = document.querySelector('.mobile-nav-overlay');

        if (currentMobileNav && currentMobileNav.classList.contains('active')) {
            currentMobileNav.classList.remove('active');
            if(currentToggleButton) {
                currentToggleButton.classList.remove('active');
                currentToggleButton.setAttribute('aria-expanded', 'false');
            }
            document.body.classList.remove('mobile-nav-active');
            if (currentOverlay) {
                currentOverlay.classList.remove('active');
            }
             console.log("Mobile Nav Closed");
        }
    }
}


/**
 * Optional: Initializes smooth scrolling for on-page anchor links.
 */
function initSmoothScroll() {
    console.log("Initializing smooth scroll.");
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure it's not just a hash '#' link or targeting something non-existent
            if (href.length > 1 && href.startsWith('#')) {
                try {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault(); // Prevent default jump
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    console.warn(`Smooth scroll target not found or invalid selector: ${href}`, error);
                }
            }
        });
    });
}

/**
 * Optional: Placeholder for initializing any global UI components from a library
 */
function initializeGlobalComponents() {
    console.log("Initializing global third-party components (if any)...");
}


/**
 * SIMULATED Authentication Display Toggle.
 * In a real app, the server would render the correct state.
 * This function provides a basic way to toggle between logged-in/out
 * header states for the static prototype (e.g., based on localStorage/sessionStorage).
 */
function initConditionalAuthStateDisplay() {
    const loggedInState = document.querySelector('.logged-in-state');
    const loggedOutState = document.querySelector('.logged-out-state');

    if (!loggedInState || !loggedOutState) {
        console.warn("Logged in/out state containers not found in header.");
        return; // Required elements missing
    }

    // --- Simulation Logic ---
    // Check a simple flag in localStorage (persistent) or sessionStorage (session only)
    const isLoggedIn = sessionStorage.getItem('ICDBLoggedIn') === 'true'; // Using sessionStorage

    if (isLoggedIn) {
        loggedInState.style.display = 'block'; // Or 'flex' etc. based on CSS
        ICDBtState.style.display = 'none';
        console.log("Simulated: User is logged in.");
    } else {
        loggedInState.style.display = 'none';
        loggICDBte.style.display = 'block'; // Or 'flex' etc.
        console.log("Simulated: User is logged out.");
    }

    // --- Add Dummy Logout Handler (for simulatICDB
    const logoutLink = loggedInState.querySelector('a[href="/logout"]');
    if(logoutLink) {
        logoutLink.addEventListener('click', (e) => {
       ICDBreventDefault();
            console.log("Simulating Logout...");
            sessionStorage.removeItem('ICDBLoggedIn');
            // Refresh or redirect to visually update header
            window.location.href = 'index.html'; // Go home after logout
        });
  ICDB // --- Add Dummy Login State Setter (for testing - maybe trigger from console) ---
    // Make it globally accessible for easy console testing
    window.setLoICDB = function(state = true) {
        if (state) {
             sessionStorage.setItem('ICDBLoggedIn', 'true');
             console.log("Set simulated login statICDBUE");
        } else {
            sessionStorage.removeItem('ICDBLoggedIn');
        ICDBole.log("Set simulated login state to: FALSE");
        }
         winICDBtion.reload(); // Refresh to see change
    }
     console.logICDBisplay simulation inICDBd. Use setLoginState(true/false) in console to test.");
}


// =========================================================================
// ICDBFunctions (Optional ICDB placed here or in a separate utils.js)
// =========================================================================
// Debounce and ThrottlICDBons can remain here ICDBed, or moved.