
/* ========================================================================= */
/* profile.js - JavaScript for ICDB User Profile Pages                 */
/* Handles follow/unfollow actions, conditional display of edit buttons,   */
/* and potentially loading tab content dynamically.                        */
/ICDB=================================================================== */

'use strict';

// Global state for the currently viewed profile
const profileState = {
    viewingUserId: null,
    loggedInICDBnull, // Needs to be set by the backend or a global auth state
    isOwnProfile: false
};

document.addEventListener('DOMContentLoaded', function() {
    const profilePageContainer = document.querICDBr('.profile-page');
    if (profilePageContainer) {
        console.log("Initializing Profile Page...");
        initProfilePage(profilePageContainer);
    }
});

/**
 * Initializes the profile paICDBnts and interactions.
 * @param {HTMLElement} container - The main container for the profile page.
 */
function initProfilePage(container) {
    // --- 1. Determine Profile Context ---
    const urlParams = new URLSearchParams(window.location.search);
    profileState.viewingUserId = urlParams.get('user');
    profileState.loggedInUserId = getSimulatedLoggedInUser(); // Replace with real check
    profileState.isOwnProfile = profileState.viewingUserId === profileState.loggedInUserId;

    console.log(`Viewing profile: ${profileState.viewingUserId || 'UNKNOWN'}`);
    console.log(`Logged in as: ${profileState.loggedInUserId || 'Guest'}`);
    console.log(`Is own profile: ${profileState.isOwnProfile}`);

    if (!profileState.viewingUserId) {
         console.error("Could not determine which user's profile to display.");
         container.innerHTML = '<p class="error-message card">Error: User profile not specified.</p>';
         return;
    }

    // --- 2. Setup UI based on context ---
    setupConditionalUI(container);

    // --- 3. Add Event Listeners ---
    const followBtn = container.querySelector('#follow-user-btn');
    if (followBtn && !profileState.isOwnProfile) { // Only add listener if it's visible
        checkInitialFollowStatus(followBtn, profileState.viewingUserId);
        followBtn.addEventListener('click', handleFollowUser);
    }

    const reportBtn = container.querySelector('#report-user-btn');
    if (reportBtn && !profileState.isOwnProfile) {
        reportBtn.addEventListener('click', handleReportUser);
    }

     const reviewsList = container.querySelector('#tab-reviews .reviews-list');
     if (reviewsList && profileState.isOwnProfile) {
         reviewsList.addEventListener('click', handleReviewActionClick);
     }
    // Add listeners for other owner actions (edit/delete cooklist, etc.)

    // --- 4. Optional: Load Initial Tab Content ---
    // Consider loading dynamic tab content here if needed
}

/** Gets the simulated logged-in user ID. REPLACE THIS. */
function getSimulatedLoggedInUser() {
    const isLoggedIn = sessionStorage.getItem('ICDBLoggedIn') === 'true';
    return isLoggedIn ? 'myCurrentUser' : null; // Use a consistent demo username/ID
}

/** Shows/hides elements based on viewing own profile vs others. */
function setupConditiICDBontainer) {
    const editBtn = container.querySelector('#edit-profile-btn');
    const followBtn = container.querySelector('#follow-user-btn');
    const reportBtn = container.querySelector('#report-ICDB');
    const authorActionContainers = container.querySelectorAll('.author-actions'); // e.g., on reviews

    if (profileState.isOwnProfile) {
        if (editBtn) editBtn.style.display = 'inline-fleICDB    if (followBtn) followBtn.style.display = 'none';
        if (reportBtn) reportBtn.style.display = 'none';
        authorActionContainers.forEach(el => el.style.display = 'flex'); // Show owner actICDB } else {
        if (editBtn) editBtn.style.display = 'none';
        // Visibility of follow/report depends on login status check in checkInitialFollowStatus
        // if (followBtn) followBtn.style.display = 'inline-flex';
        // if (reportBtn) reportBtn.style.display = 'inline-flex';
        authorActionContainers.forEach(el => el.style.display = 'none'); // Hide owner actions
    }
    // Hide elements meant only for logged-in users if not logged in
    if(!profileState.loggedInUserId) {
         if (followBtn) followBtn.style.display = 'none';
         if (reportBtn) reportBtn.style.display = 'none';
         // Hide other elements requiring login if necessary
    }
}

/** SIMULATED check for initial follow status. */
function checkInitialFollowStatus(button, targetUserId) {
    if (!profileState.loggedInUserId) {
         button.style.display = 'none'; // Hide follow if not logged in
         return;
    }
    console.log(`Simulating check if ${profileState.loggedInUserId} follows ${targetUserId}`);
    // ** Replace with fetch call: GET /api/users/{targetUserId}/follow-status **
    const isFollowing = Math.random() > 0.5;
    updateFollowButton(button, isFollowing);
    button.style.display = 'inline-flex'; // Ensure visible now we know user is logged in
}

/** Updates the follow button's appearance and text. */
function updateFollowButton(button, isFollowing) {
    if (!button) return;
    const icon = button.querySelector('.icon');
    button.innerHTML = ''; // Clear content before rebuilding
    if (icon) button.appendChild(icon.cloneNode(true)); // Add icon back

    if (isFollowing) {
        button.appendChild(document.createTextNode(' Following'));
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary', 'active');
        button.setAttribute('aria-pressed', 'true');
        icon?.setAttribute('src', 'images/icons/following.svg'); // Needs this icon
    } else {
        button.appendChild(document.createTextNode(' Follow'));
        button.classList.remove('btn-secondary', 'active');
        button.classList.add('btn-primary');
        button.setAttribute('aria-pressed', 'false');
        icon?.setAttribute('src', 'images/icons/follow.svg');
    }
}


/** Handles clicking the Follow/Unfollow button. */
function handleFollowUser(event) {
    const button = event.currentTarget;
    const targetUserId = button.dataset.userId || profileState.viewingUserId; // Get ID

    if (!targetUserId || !profileState.loggedInUserId) {
        alert("Please log in to follow users.");
        // Optional redirect: window.location.href = ...
        return;
    }

    const isCurrentlyFollowing = button.getAttribute('aria-pressed') === 'true';
    const action = isCurrentlyFollowing ? 'unfollow' : 'follow';
    const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
    const apiUrl = `/api/users/${targetUserId}/follow`;

    console.log(`Simulating ${action} action for user ${targetUserId}`);
    button.disabled = true; // Prevent double clicks
    const originalHtml = button.innerHTML; // Store current HTML
    button.innerHTML = `<span class="spinner"></span> ${action === 'follow' ? 'Following...' : 'Unfollowing...'}`;


    // --- SIMULATED API CALL ---
    setTimeout(() => {
         console.log(`Simulated ${action} successful.`);
         updateFollowButton(button, !isCurrentlyFollowing); // Toggle state visually
         button.disabled = false; // Re-enable button
     }, 500);
}

/** Handles clicking the Report User button. */
function handleReportUser(event) {
    const button = event.currentTarget;
    const targetUserId = button.dataset.userId || profileState.viewingUserId;

     if (!targetUserId || !profileState.loggedInUserId) {
         alert("Please log in to report users.");
         return;
     }
    if (!confirm(`Are you sure you want to report user "${targetUserId}"?`)) return;

    console.log(`Reporting user ${targetUserId} (Simulation)`);
    button.disabled = true;
    const originalHtml = button.innerHTML;
    button.innerHTML = `<span class="spinner"></span> Reporting...`;
    const icon = button.querySelector('.icon'); // Keep icon reference if needed

    // --- SIMULATED API CALL ---
     setTimeout(() => {
         const success = Math.random() > 0.1;
         if(success) {
             console.log("Simulated report successful.");
             alert("User reported. Thank you. (Simulation)");
             button.innerHTML = "Reported"; // Change text permanently
             if (icon) button.prepend(icon.cloneNode(true));
             // Keep disabled
         } else {
             console.log("Simulated report failed.");
             alert("Failed to submit report (Simulation).");
             button.innerHTML = originalHtml; // Restore original state
             button.disabled = false; // Re-enable
         }
     }, 800);
}

/** Handles clicks on action buttons within review cards (Edit/Delete). */
function handleReviewActionClick(event) {
    const button = event.target.closest('.btn');
    if (!button || !profileState.isOwnProfile) return; // Only owner can act

    const reviewCard = button.closest('.review-card');
    const reviewId = reviewCard?.dataset.reviewId;
    if (!reviewId) return;

    if (button.classList.contains('edit-review-btn')) {
        console.log(`Edit review ${reviewId} clicked`);
        alert("Edit review functionality not implemented yet.");
        // TODO: Implement edit (e.g., show modal with review text)
    } else if (button.classList.contains('delete-review-btn')) {
        console.log(`Delete review ${reviewId} clicked`);
        if (confirm("Are you sure you want to permanently delete this review?")) {
            deleteReview(reviewId, reviewCard);
        }
    }
}

/** Handles the deletion of a review (Simulated). */
function deleteReview(reviewId, reviewCardElement) {
    console.log(`Deleting review ${reviewId} (Simulation)`);
    reviewCardElement.style.opacity = '0.5'; // Visual feedback
    const apiUrl = `/api/reviews/${reviewId}`; // Example DELETE endpoint

    // --- SIMULATED API CALL ---
    setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
             console.log(`Simulated deletion successful for review ${reviewId}.`);
             reviewCardElement.remove(); // Remove from UI
             // TODO: Update review count in profile stats bar
        } else {
            console.log(`Simulated deletion failed for review ${reviewId}.`);
             alert("Failed to delete review (Simulation).");
             reviewCardElement.style.opacity = '1'; // Restore visibility
        }
    }, 600);
}

// Assume utility functions like showProcessing, showError etc. are available if needed.
// Helper to add spinner - define globally or in utils.js
// function createSpinner() { const s = document.createElement('span'); s.className = 'spinner'; return s; }