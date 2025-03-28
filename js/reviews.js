
/* ========================================================================= */
/* reviews.js - JS for ICDB Review Interactions                        */
/* Handles submitting reviews, voting on helpfulness, reporting.           */
/* Assumes data attributes like data-entity-type, data-entity-id,          */
/* data-review-id are present on relevantICDBements.                   */
/* ========================================================================= */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    initReviewForms();
    initReviewInteractions();
    iniICDBingInputs(); // Initialize interactive star rating inputs
});

/** Finds and initializes all review submission forms on the page. */
function initReviewForms() {
    const reviewForms = document.querySelectorAll('form[id$="-review-form"]');
   ICDBiewForms.length > 0) {
        console.log(`Found ${reviewForms.length} review form(s). Initializing...`);
        reviewForms.forEach(form => {
            // Find context - Check form first, then climb ancestors
            let contextElementICDB
            let entityType = form.dataset.entityType;
            let entityId = form.dataset.entityId;

            if (!entityType || !entityId) {
                contextElement = form.closest('[data-entity-type][data-entity-id]');
                if (contextElement) {
                     entityType = contextElement.dataset.entityType;
                     entityId = contextElement.dataset.entityId;
                }
            }

            if (entityType) { // Require at least entityType
                form.addEventListener('submit', (event) => handleReviewSubmit(event, form, entityType, entityId));
                console.log(`Added submit listener for ${entityType} review form (ID: ${entityId || 'N/A'}).`);
            } else {
                console.warn("Could not find entity type/ID context for review form:", form);
            }
        });
    }
}

/** Finds and initializes interactions (voting, reporting) on existing review cards. */
function initReviewInteractions() {
    // Use event delegation on a common ancestor if possible, e.g., 'main' or a specific container
    const reviewsAncestor = document.querySelector('main'); // Or more specific container
    if (!reviewsAncestor) return;

    console.log("Initializing review interactions (voting/reporting) via delegation...");

    reviewsAncestor.addEventListener('click', function(event) {
        const voteYesButton = event.target.closest('.vote-helpful-yes');
        const voteNoButton = event.target.closest('.vote-helpful-no');
        const reportButton = event.target.closest('.report-review');
        const reviewCard = event.target.closest('.review-card');

        if (!reviewCard) return; // Click wasn't related to a review card actions

        const reviewId = reviewCard.dataset.reviewId;
        if (!reviewId) {
            console.warn("Review ID not found on card:", reviewCard);
            return;
        }

        // --- Handle Helpfulness Voting ---
        if (voteYesButton) {
            handleVoteClick(voteYesButton, reviewId, 'yes');
        } else if (voteNoButton) {
            handleVoteClick(voteNoButton, reviewId, 'no');
        }
        // --- Handle Reporting ---
        else if (reportButton) {
             handleReportClick(reportButton, reviewId);
        }
    });
}

/** Initializes interactive star rating input components. */
function initStarRatingInputs() {
    // Find potentially dynamically loaded forms too
    const setupStars = (formContainer) => {
        const starContainers = formContainer.querySelectorAll('.rating-group .stars');
        if (starContainers.length > 0) {
             console.log(`Initializing ${starContainers.length} star rating input(s)...`);
             starContainers.forEach(container => {
                 // Prevent re-initialization
                 if (container.dataset.starsInitialized) return;
                 container.dataset.starsInitialized = 'true';

                 const stars = Array.from('☆☆☆☆☆').map((_, i) => { // Use 5 stars always
                     const star = document.createElement('span');
                     star.textContent = '☆';
                     star.dataset.value = i + 1;
                     star.style.cursor = 'pointer';
                     star.setAttribute('aria-label', `${i+1} star${i > 0 ? 's' : ''}`);
                     return star;
                 });

                 container.textContent = ''; // Clear placeholder
                 stars.forEach(star => container.appendChild(star));

                 const hiddenInputSelector = container.dataset.ratingInput;
                 const hiddenInput = hiddenInputSelector ? container.closest('form')?.querySelector(hiddenInputSelector) : null;

                 if (!hiddenInput) {
                     console.warn("No hidden input found for star rating:", container);
                     return;
                 }

                 let currentRating = parseInt(hiddenInput.value, 10) || 0;

                 const updateStars = (rating) => {
                     stars.forEach((star, index) => {
                         star.textContent = index < rating ? '★' : '☆';
                         star.classList.toggle('selected', index < rating); // CSS: .selected { color: gold; }
                     });
                 };

                 updateStars(currentRating); // Initial state

                 container.addEventListener('mouseover', (event) => {
                     if (event.target.tagName === 'SPAN' && event.target.dataset.value) {
                         updateStars(parseInt(event.target.dataset.value, 10));
                     }
                 });
                 container.addEventListener('mouseout', () => updateStars(currentRating));
                 container.addEventListener('click', (event) => {
                     if (event.target.tagName === 'SPAN' && event.target.dataset.value) {
                         currentRating = parseInt(event.target.dataset.value, 10);
                         hiddenInput.value = currentRating;
                         updateStars(currentRating);
                         console.log(`Set rating for ${hiddenInput.id} to: ${currentRating}`);
                     }
                 });
             });
        }
    };
    // Setup stars for statically loaded forms
    setupStars(document);
    // Optional: If using dynamic content loading (e.g., AJAX), you might need
    // a MutationObserver or a callback system to call setupStars(newContentContainer).
}


// =========================================================================
// Event Handlers
// =========================================================================
/** Handles the submission of a review form. */
function handleReviewSubmit(event, form, entityType, entityId) {
    event.preventDefault();
    const messageDiv = form.querySelector('.form-message');
    const submitButton = form.querySelector('button[type="submit"]');
    clearMessages(messageDiv);
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error')); // Clear field errors

    const formData = new FormData(form);
    const reviewData = {};
    let isValid = true;

    // --- Client-Side Validation ---
    const reviewText = formData.get('review_text');
    if (!reviewText || reviewText.trim().length === 0) {
        isValid = false;
        showReviewMessage(messageDiv, "Please enter your review text.", true);
        form.querySelector('textarea[name="review_text"]')?.classList.add('input-error');
        form.querySelector('textarea[name="review_text"]')?.focus();
    } else {
        reviewData.text = reviewText.trim();
    }

    reviewData.ratings = {};
    let firstInvalidRating = null;
    form.querySelectorAll('.rating-group input[type="hidden"]').forEach(input => {
        const ratingValue = parseInt(input.value, 10);
        if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 10) { // Assuming 1-10 scale needed for backend? Adjust if 1-5
            reviewData.ratings[input.name] = ratingValue;
        } else {
            // Make ratings required
            isValid = false;
            if (!firstInvalidRating) firstInvalidRating = input; // Focus first invalid rating
            // Add error state to star container?
            input.closest('.rating-group')?.querySelector('.stars')?.classList.add('input-error'); // Add error class to stars div
        }
    });
    if (!isValid && !messageDiv?.textContent) { // Only show rating error if no text error shown yet
        showReviewMessage(messageDiv, "Please provide a rating for all criteria.", true);
        firstInvalidRating?.closest('.rating-group')?.querySelector('.stars span')?.focus();
    }

    if (!isValid) return; // Stop if basic validation failed

    // --- Gather Context-Specific Data ---
    if (entityType === 'recipe') {
        reviewData.made_it = formData.get('made_it') === 'on';
        reviewData.substitutions = formData.get('substitutions') || '';
        // File upload is handled by FormData if input name is correct
    } else if (entityType === 'ingredient') {
        reviewData.brand_mention = formData.get('brand_mention') || '';
    }
    // Add other entity types

    console.log(`Simulating submission for ${entityType} review (ID: ${entityId || 'N/A'}):`, reviewData);
    showProcessing(submitButton, true);

    const apiUrl = `/api/reviews/${entityType}${entityId ? `/${entityId}` : ''}`; // Adjust URL structure

    // --- SIMULATED SUBMISSION ---
     setTimeout(() => {
         const success = Math.random() > 0.15; // 85% chance success
         if (success) {
             console.log("Simulated review submission successful.");
             showReviewMessage(messageDiv, "Review submitted! (Simulation)", false);
             form.reset();
             // Reset star ratings visually
             form.querySelectorAll('.rating-group .stars').forEach(container => {
                 const stars = container.querySelectorAll('span');
                 stars.forEach(star => { star.textContent = '☆'; star.classList.remove('selected'); });
                 const hiddenInput = container.dataset.ratingInput ? form.querySelector(container.dataset.ratingInput) : null;
                 if(hiddenInput) hiddenInput.value = '0'; // Reset hidden input value
             });
              // Optionally clear photo preview if exists
             const imgPrev = form.querySelector('#image-preview img');
             if (imgPrev) { imgPrev.src = ''; imgPrev.style.display = 'none'; imgPrev.closest('.upload-preview').style.display = 'none'; }

         } else {
             console.log("Simulated review submission failed.");
             showReviewMessage(messageDiv, "Failed to submit review. (Simulation)", true);
         }
         showProcessing(submitButton, false, submitButton?.dataset?.originalText || "Submit Review");
     }, 1200);
}

/** Handles clicks on helpfulness vote buttons. */
function handleVoteClick(button, reviewId, voteType) {
    console.log(`Voting '${voteType}' on review ${reviewId} (Simulation)`);
    const actionsContainer = button.closest('.review-actions');
    if (!actionsContainer) return;

    const buttonYes = actionsContainer.querySelector('.vote-helpful-yes');
    const buttonNo = actionsContainer.querySelector('.vote-helpful-no');

    // Prevent voting if already voted (based on class)
    if (button.classList.contains('voted') || buttonYes.disabled || buttonNo.disabled) {
        console.log("Already voted or disabled.");
        return;
    }
    buttonYes.disabled = true; // Disable both during processing
    buttonNo.disabled = true;
    const originalYesText = buttonYes.textContent;
    const originalNoText = buttonNo.textContent;

    const apiUrl = `/api/reviews/${reviewId}/vote`;

    // --- SIMULATED API CALL ---
    setTimeout(() => {
        const success = Math.random() > 0.1;
        if(success) {
            console.log("Simulated vote successful.");
            // Find current counts (more robustly)
            const yesCountEl = buttonYes.querySelector('.helpful-yes-count');
            const noCountEl = buttonNo.querySelector('.helpful-no-count');
            let currentYes = parseInt(yesCountEl?.textContent || '0', 10);
            let currentNo = parseInt(noCountEl?.textContent || '0', 10);

            // Logic to simulate adding/removing/switching votes
            const wasVotedYes = buttonYes.classList.contains('voted');
            const wasVotedNo = buttonNo.classList.contains('voted');
            buttonYes.classList.remove('voted');
            buttonNo.classList.remove('voted');

            if(voteType === 'yes') {
                if(wasVotedYes) currentYes--; // Unvoting Yes
                else {
                    currentYes++; // Voting Yes
                    if(wasVotedNo) currentNo--; // Switching from No
                    buttonYes.classList.add('voted');
                }
            } else { // voteType === 'no'
                if(wasVotedNo) currentNo--; // Unvoting No
                else {
                    currentNo++; // Voting No
                    if(wasVotedYes) currentYes--; // Switching from Yes
                    buttonNo.classList.add('voted');
                }
            }
            // Update counts
            if(yesCountEl) yesCountEl.textContent = currentYes;
            if(noCountEl) noCountEl.textContent = currentNo;
        } else {
            alert("Failed to record vote (Simulation).");
        }
        // Re-enable buttons after simulation
        buttonYes.disabled = false;
        buttonNo.disabled = false;
    }, 500);
}


/** Handles clicks on report review buttons. */
function handleReportClick(button, reviewId) {
    if (!confirm("Are you sure you want to report this review as inappropriate?")) {
        return;
    }
    console.log(`Reporting review ${reviewId} (Simulation)`);
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Reporting...";
    const apiUrl = `/api/reviews/${reviewId}/report`;

    // --- SIMULATED API CALL ---
     setTimeout(() => {
         const success = Math.random() > 0.1;
         if(success) {
             console.log("Simulated report successful.");
             button.textContent = "Reported";
             // Keep disabled permanently after reporting
         } else {
             console.log("Simulated report failed.");
             alert("Failed to report review (Simulation).");
             button.textContent = originalText; // Restore text
             button.disabled = false; // Re-enable
         }
     }, 800);
}

// =========================================================================
// Helper Functions (Shared - Ideally move to utils.js)
// =========================================================================
/** Displays a message (error or success) in the specified element. */
function showReviewMessage(element, message, isError) { /* ... implementation from auth.js ... */
     if (element) {
        element.textContent = message;
        element.className = `form-message ${isError ? 'error' : 'success'}`;
        element.style.display = 'block';
        element.setAttribute('role', isError ? 'alert' : 'status');
    }
}
/** Clears messages from the specified elements. */
function clearMessages(...elements) { /* ... implementation from auth.js ... */
     elements.forEach(element => {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
            element.classList.remove('error', 'success');
            element.removeAttribute('role');
        }
    });
}
/** Shows/hides a loading state on a submit button. */
function showProcessing(button, isLoading, loadingText = "Processing...") { /* ... implementation from auth.js ... */
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        if (!button.dataset.originalText) button.dataset.originalText = button.textContent;
        button.innerHTML = `<span class="spinner"></span> ${loadingText}`;
    } else {
        button.disabled = false;
        button.textContent = button.dataset?.originalText ?? 'Submit';
        delete button.dataset.originalText;
    }
}