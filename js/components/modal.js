
/* ========================================================================= */
/* modal.js - Reusable Accessible Modal Dialog Logic                       */
/* Handles opening, closing, focus trapping, and ESC key dismissal.        */
/* Relies on data-modal-target="#modalId" on triggers                      */
/* and data-modal-close on close buttons/overlays.                         */
/* ========================================================================= */

'use strict';

// Module pattern to encapsulate variables and functions
const ModalController = (function() {

    let currentlyOpenModal = null; // Track the currently open modal
    let lastFocusedElement = null; // Track element that triggered the modal

    // Selectors for focusable elements
    const FOCUSABLE_SELECTORS = [
        'a[href]:not([tabindex^="-"])', // Exclude negative tabindex
        'button:not([disabled]):not([tabindex^="-"])',
        'input:not([disabled]):not([tabindex^="-"]):not([type="hidden"])', // Exclude hidden inputs
        'select:not([disabled]):not([tabindex^="-"])',
        'textarea:not([disabled]):not([tabindex^="-"])',
        '[tabindex]:not([tabindex^="-"])', // Any element with explicit positive tabindex
        'details summary:not([tabindex^="-"])', // Details summary is focusable
        'iframe', // Iframes can be focusable
        '[contenteditable="true"]:not([tabindex^="-"])'
    ].join(', ');

    /**
     * Initializes all modal triggers and close elements found on the page.
     */
    function init() {
        console.log("Initializing Modals...");

        // --- Open Triggers (using event delegation on document) ---
        document.body.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-modal-target]');
            if (trigger) {
                 event.preventDefault();
                 const modalId = trigger.dataset.modalTarget;
                 const modalElement = document.querySelector(modalId);
                 if (modalElement) {
                     openModal(modalElement, trigger);
                 } else {
                     console.warn(`Modal target "${modalId}" not found for trigger:`, trigger);
                 }
            }
        });


        // --- Close Mechanisms (Delegated) ---
        // Close button / overlay click
        document.addEventListener('click', (event) => {
            // Close if clicking an element with data-modal-close attribute
            // Ensure the click target *is* the element or is *inside* the element with the attribute
             if (event.target.closest('[data-modal-close]')) {
                // Find the modal this close button belongs to
                const modalToClose = event.target.closest('.modal');
                if (modalToClose === currentlyOpenModal) { // Only close the currently active modal
                    event.preventDefault();
                    closeModal(modalToClose);
                 } else if (currentlyOpenModal && event.target.hasAttribute('data-modal-close') && !event.target.closest('.modal-content')){
                    // Special case: overlay click (target has attribute but is not inside modal-content)
                    event.preventDefault();
                    closeModal(currentlyOpenModal);
                 }
            }
        });

        // --- Keyboard Navigation ---
        document.addEventListener('keydown', handleGlobalKeydown);

        console.log("Modal initialization complete.");
    }

    /** Opens a specific modal dialog. */
    function openModal(modalElement, triggerElement) {
        if (!modalElement || modalElement.classList.contains('active')) return; // Already open or invalid
        if (currentlyOpenModal) closeModal(currentlyOpenModal); // Close previous if any

        console.log(`Opening modal: #${modalElement.id}`);
        currentlyOpenModal = modalElement;
        lastFocusedElement = triggerElement || document.activeElement;

        modalElement.classList.add('active');
        modalElement.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        setInitialFocus(modalElement);
        // Global keydown handles ESC, specific trap handled by focus event listeners might be better
    }

    /** Closes a specific modal dialog. */
    function closeModal(modalElement) {
        if (!modalElement || modalElement !== currentlyOpenModal) return;

        console.log(`Closing modal: #${modalElement.id}`);
        modalElement.classList.remove('active');
        modalElement.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            console.log("Returning focus to:", lastFocusedElement);
            // Delay focus return slightly to prevent issues if the trigger was removed etc.
            requestAnimationFrame(() => {
                try {
                    lastFocusedElement.focus();
                } catch(e) { console.warn("Could not return focus:", e)}
            });
        }

        currentlyOpenModal = null;
        lastFocusedElement = null;
    }

    /** Sets initial focus inside the modal. */
    function setInitialFocus(modalElement) {
        requestAnimationFrame(() => {
            const focusableElements = findFocusableElements(modalElement);
            let elementToFocus = null;

            // Prioritize elements with [autofocus], then first focusable, then modal content
            const autofocusElement = modalElement.querySelector('[autofocus]');
            if (autofocusElement && focusableElements.includes(autofocusElement)) {
                elementToFocus = autofocusElement;
            } else if (focusableElements.length > 0) {
                 elementToFocus = focusableElements[0];
            } else {
                 // Fallback to the content container itself, make it focusable
                 const content = modalElement.querySelector('.modal-content');
                 if(content) {
                     content.setAttribute('tabindex', '-1'); // Make focusable programmatically
                     elementToFocus = content;
                 } else {
                     modalElement.setAttribute('tabindex', '-1'); // Fallback to modal element
                     elementToFocus = modalElement;
                 }
            }

            if (elementToFocus && typeof elementToFocus.focus === 'function') {
                elementToFocus.focus();
                console.log("Initial focus set to:", elementToFocus);
            } else {
                 console.warn("Could not find element to set initial focus in modal:", modalElement);
            }
        });
    }

    /** Traps focus within the currently open modal. */
    function handleFocusTrap(event) {
        if (event.key !== 'Tab' || !currentlyOpenModal) return;

        const focusableElements = findFocusableElements(currentlyOpenModal);
        if (focusableElements.length === 0) {
             event.preventDefault();
             return;
        }

        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        // document.activeElement can be null or body in some cases, fall back safely
        const currentFocusedElement = document.activeElement;

        // Check if focus is somehow outside the modal content (shouldn't normally happen with body lock, but safety)
        if (!currentlyOpenModal.contains(currentFocusedElement)) {
             event.preventDefault();
             firstFocusableElement.focus();
             return;
        }

        if (event.shiftKey) { // Shift + Tab
            if (currentFocusedElement === firstFocusableElement) {
                event.preventDefault();
                lastFocusableElement.focus();
            }
        } else { // Tab
            if (currentFocusedElement === lastFocusableElement) {
                event.preventDefault();
                firstFocusableElement.focus();
            }
        }
    }

    /** Handles global keydown for ESC and Tab focus trapping. */
    function handleGlobalKeydown(event) {
        if (event.key === 'Escape' && currentlyOpenModal) {
            console.log("Escape key pressed, closing modal.");
            closeModal(currentlyOpenModal);
        }
        // Handle focus trap globally IF a modal is open
        if (event.key === 'Tab' && currentlyOpenModal) {
             handleFocusTrap(event);
        }
    }

    /** Finds visible focusable elements within a container. */
    function findFocusableElements(container) {
        if (!container) return [];
        return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
        });
    }

    // Expose public methods if needed for programmatic control
    return {
        init: init,
        open: (modalSelector, triggerElement) => {
            const modalElement = document.querySelector(modalSelector);
            openModal(modalElement, triggerElement);
        },
        close: () => {
            if (currentlyOpenModal) closeModal(currentlyOpenModal);
        },
        getCurrentModal: () => currentlyOpenModal
    };

})();

// Initialize automatically if loaded traditionally
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ModalController.init);
} else {
    // DOM is already ready, just run init
    ModalController.init();
}