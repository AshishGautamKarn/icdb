
/* ========================================================================= */
/* search.js - JavaScript for ICDB Search Results Page                 */
/* Handles filtering, sorting, pagination, and dynamic loading of results. */
/* =======================================================================ICDBuse strict';

// State variables to hold current search parameters
const searchState = {
    query: '',
    type: 'recipe', // Default search type
    filters: {}, // e.g., { cuisine: ['italiaICDBican'], difficulty: 'easy' }
    sort: 'relevance',
    page: 1,
    totalPages: 1, // Will be updated by API response
    totalResults: 0 // Will be updated by API response
};

// Cache elemeICDBvoid repeated querying
const elements = {};

document.addEventListener('DOMContentLoaded', function() {
    const searchPageContainer = document.querySelector('.search-results-page');
    if (ICDBgeContainer) {
        console.log("Initializing Search Results Page...");
        // Cache elements once
        elements.title = searchPageContainer.querySelector('.search-query-title');
        elements.typeTabsContainer = searchPageContainer.querySelector('.result-type-tabs');
        elements.filterForm = searchPageContainer.querySelector('#filter-form');
        elements.sortSelect = searchPageContainer.querySelector('#sort-by');
        elements.resultsContainer = searchPageContainer.querySelector('#results-items-container');
        elements.resultsSummary = searchPageContainer.querySelector('.results-summary');
        elements.paginationContainer = searchPageContainer.querySelector('.pagination');
        elements.noResultsMessage = searchPageContainer.querySelector('.no-results');
        elements.loadingMessage = null; // Will create dynamically

        initSearchPage();
    }
});

/**
 * Initializes the search page: reads URL params, sets up listeners.
 */
function initSearchPage() {
    if (!elements.resultsContainer || !elements.filterForm || !elements.typeTabsContainer || !elements.paginationContainer) {
        console.error("Essential search page elements not found. Aborting initialization.");
        return;
    }

    // --- 1. Parse Initial State from URL ---
    parseUrlAndUpdateState();
    updateUiFromState(); // Set initial UI states (active tab, filter values)

    // --- 2. Add Event Listeners ---
    // Type Tabs (using delegation)
    elements.typeTabsContainer.addEventListener('click', handleTypeTabClick);

    // Filter Form Submission
    elements.filterForm.addEventListener('submit', handleFilterSubmit);
    elements.filterForm.querySelector('button[type="reset"]')?.addEventListener('click', handleFilterReset);

    // Sorting Dropdown
    elements.sortSelect?.addEventListener('change', handleSortChange);

    // Pagination Links (using delegation)
    elements.paginationContainer.addEventListener('click', handlePaginationClick);

    // Handle Back/Forward button navigation
    window.addEventListener('popstate', handlePopState);

    // --- 3. Fetch Initial Results ---
    fetchAndRenderResults();

    console.log("Search page initialized with state:", searchState);
}

/** Parses the current URL's query parameters and updates the global searchState object. */
function parseUrlAndUpdateState() {
    const urlParams = new URLSearchParams(window.location.search);
    searchState.query = urlParams.get('q') || '';
    searchState.type = urlParams.get('type') || 'recipe';
    searchState.sort = urlParams.get('sort') || 'relevance';
    searchState.page = parseInt(urlParams.get('page'), 10) || 1;
    searchState.filters = {};
    urlParams.forEach((value, key) => {
        if (!['q', 'type', 'sort', 'page'].includes(key)) {
            if (!searchState.filters[key]) searchState.filters[key] = [];
            searchState.filters[key].push(value);
        }
    });
}

/** Updates the UI elements to reflect the current searchState. */
function updateUiFromState() {
    if (elements.title) elements.title.textContent = `Search Results for "${searchState.query || 'Everything'}"`;
    const headerSearchInput = document.querySelector('.header-search input[name="q"]');
    if(headerSearchInput) headerSearchInput.value = searchState.query;

    elements.typeTabsContainer.querySelectorAll('.tab-link').forEach(tab => {
        const tabUrl = new URL(tab.href, window.location.origin); // Ensure base URL for correct parsing
        const tabType = tabUrl.searchParams.get('type') || 'recipe';
        const isActive = (tabType === searchState.type);
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    updateFilterVisibility();

    if (elements.filterForm) {
        // Set Sort dropdown
        if (elements.sortSelect) elements.sortSelect.value = searchState.sort;
        // Reset all filter inputs before setting current ones
        elements.filterForm.querySelectorAll('input, select').forEach(input => {
             if(input.type === 'checkbox' || input.type === 'radio') input.checked = false;
             else if (input.tagName === 'SELECT') input.selectedIndex = 0; // Reset select to first option
             // else input.value = ''; // Don't clear text inputs which might not be filters
        });
        // Set filter inputs based on state
        Object.entries(searchState.filters).forEach(([key, values]) => {
            const filterValues = Array.isArray(values) ? values : [values];
            elements.filterForm.querySelectorAll(`[name="${key}"]`).forEach(input => {
                 if (input.type === 'checkbox' || input.type === 'radio') {
                     input.checked = filterValues.includes(input.value);
                 } else if (input.tagName === 'SELECT') {
                     if (input.multiple) Array.from(input.options).forEach(opt => opt.selected = filterValues.includes(opt.value));
                     else input.value = filterValues[0] || '';
                 } else input.value = filterValues[0] || '';
            });
        });
    }
}

/** Updates the visibility of filter groups based on the current search type. */
function updateFilterVisibility() {
    if (!elements.filterForm) return;
    elements.filterForm.querySelectorAll('.filter-group[id$="-filters"]').forEach(group => group.style.display = 'none');
    const activeFilterGroup = document.getElementById(`${searchState.type}-filters`);
    if (activeFilterGroup) activeFilterGroup.style.display = 'block';
}

/** Displays a loading indicator in the results area. */
function showLoadingIndicator() {
    elements.resultsContainer.innerHTML = '<p class="loading-message">Loading results...</p>';
    elements.paginationContainer.innerHTML = ''; // Clear pagination
    elements.noResultsMessage.style.display = 'none';
}

/** Fetches search results from the (simulated) backend and renders everything. */
async function fetchAndRenderResults() {
    showLoadingIndicator();
    const apiUrl = buildApiUrl('/api/search'); // In simulation, this URL isn't actually used by fetch

    try {
        // ** Replace with actual fetch call **
        // const response = await fetch(apiUrl);
        // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // const data = await response.json();
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay
        const data = generateSimulatedResults(searchState); // Simulate API response

        searchState.totalResults = data.totalResults || 0;
        searchState.totalPages = data.totalPages || 1;
        searchState.page = data.currentPage || 1; // Sync page state

        renderResults(data.results || []);
        updateResultsSummary();
        renderPagination();

    } catch (error) {
        console.error("Error fetching search results:", error);
        elements.resultsContainer.innerHTML = '<p class="error-message">Could not load results. Please try again later.</p>';
        elements.noResultsMessage.style.display = 'none';
    }
}

/** Builds the API URL string with current search state parameters. */
function buildApiUrl(baseUrl) {
    const params = new URLSearchParams({
        q: searchState.query,
        type: searchState.type,
        sort: searchState.sort,
        page: searchState.page
    });
    Object.entries(searchState.filters).forEach(([key, values]) => {
        const filterValues = Array.isArray(values) ? values : [values];
        filterValues.forEach(value => params.append(key, value));
    });
    return `${baseUrl}?${params.toString()}`;
}

/** Renders result items into the container based on type. */
function renderResults(results) {
    elements.resultsContainer.innerHTML = ''; // Clear loading/previous

    if (results.length === 0) {
        elements.noResultsMessage.style.display = 'block';
        elements.resultsContainer.className = 'results-items'; // Reset grid class
        return;
    }
    elements.noResultsMessage.style.display = 'none';

    let renderer;
    let cardGridClass = 'list-card-grid'; // Default to list-style cards
    switch (searchState.type) {
        case 'recipe':      renderer = renderRecipeCard; cardGridClass = 'recipe-card-grid'; break;
        case 'chef':        renderer = renderChefCard; break;
        case 'ingredient':  renderer = renderIngredientCard; break;
        case 'cookbook':    renderer = renderCookbookCard; break;
        // Add cases for 'cuisine', 'technique', 'show', 'equipment'
        default: renderer = (item) => `<div class="card"><p>Unsupported type: ${searchState.type}</p><pre>${escapeHtml(JSON.stringify(item, null, 2))}</pre></div>`;
    }
    elements.resultsContainer.className = `results-items ${cardGridClass}`;
    results.forEach(item => elements.resultsContainer.insertAdjacentHTML('beforeend', renderer(item)));
}

/** Updates the results summary text. */
function updateResultsSummary() {
    if (!elements.resultsSummary) return;
    const resultsPerPage = 12; // Define this somewhere accessible
    const startResult = Math.min((searchState.page - 1) * resultsPerPage + 1, searchState.totalResults);
    const endResult = Math.min(startResult + resultsPerPage - 1, searchState.totalResults);
    const typeLabel = searchState.type.charAt(0).toUpperCase() + searchState.type.slice(1);

    if (searchState.totalResults > 0) {
         elements.resultsSummary.innerHTML = `Showing <span class="results-range">${startResult}-${endResult}</span> of <span class="results-total">${searchState.totalResults}</span> ${typeLabel} results for "<strong>${escapeHtml(searchState.query) || 'Everything'}</strong>".`;
    } else {
        elements.resultsSummary.innerHTML = ''; // Handled by noResultsMessage
    }
}

/** Renders pagination controls. */
function renderPagination() {
    if (!elements.paginationContainer) return;
    elements.paginationContainer.innerHTML = '';
    if (searchState.totalPages <= 1) return;

    const createLink = (page, text, classes = []) => {
        const link = document.createElement('a');
        link.href = buildPageUrl(page);
        link.textContent = text;
        link.dataset.page = page;
        link.classList.add(...classes);
        return link;
    };
    const createSpan = (text, classes = []) => {
        const span = document.createElement('span');
        span.textContent = text;
        span.classList.add(...classes);
        return span;
    };

    // Prev Button
    const prevLink = createLink(searchState.page - 1, '« Previous', ['prev']);
    if (searchState.page === 1) {
        prevLink.classList.add('disabled');
        prevLink.removeAttribute('href');
        prevLink.setAttribute('aria-disabled', 'true');
    }
    elements.paginationContainer.appendChild(prevLink);

    // Page Numbers
    const pageLinksSpan = createSpan('', ['page-links']);
    const maxPagesToShow = 5; // Max number of direct page links
    let startPage = Math.max(1, searchState.page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(searchState.totalPages, startPage + maxPagesToShow - 1);
    // Adjust startPage if endPage hits the limit first
    startPage = Math.max(1, endPage - maxPagesToShow + 1);

    if (startPage > 1) {
        pageLinksSpan.appendChild(createLink(1, '1'));
        if (startPage > 2) pageLinksSpan.appendChild(createSpan('...', ['ellipsis']));
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === searchState.page) {
            pageLinksSpan.appendChild(createSpan(i, ['current-page']));
        } else {
            pageLinksSpan.appendChild(createLink(i, i));
        }
    }

    if (endPage < searchState.totalPages) {
        if (endPage < searchState.totalPages - 1) pageLinksSpan.appendChild(createSpan('...', ['ellipsis']));
        pageLinksSpan.appendChild(createLink(searchState.totalPages, searchState.totalPages));
    }
    elements.paginationContainer.appendChild(pageLinksSpan);

    // Next Button
    const nextLink = createLink(searchState.page + 1, 'Next »', ['next']);
    if (searchState.page === searchState.totalPages) {
        nextLink.classList.add('disabled');
        nextLink.removeAttribute('href');
        nextLink.setAttribute('aria-disabled', 'true');
    }
    elements.paginationContainer.appendChild(nextLink);
}

// =========================================================================
// Event Handlers
// =========================================================================
/** Handles clicks on the result type tabs (using delegation). */
function handleTypeTabClick(event) {
    const clickedTab = event.target.closest('.tab-link');
    if (!clickedTab || clickedTab.classList.contains('active')) {
        event.preventDefault();
        return;
    }
    event.preventDefault(); // Handle via JS
    const newType = new URL(clickedTab.href, window.location.origin).searchParams.get('type') || 'recipe';
    if (newType !== searchState.type) {
        searchState.type = newType;
        searchState.page = 1;
        searchState.filters = {}; // Reset filters
        searchState.sort = 'relevance'; // Reset sort
        updateHistory(); // Update URL without page reload
        updateUiFromState(); // Update UI elements
        fetchAndRenderResults(); // Fetch new results
    }
}

/** Handles submission of the filter form. */
function handleFilterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const newFilters = {};
    formData.forEach((value, key) => {
        if (key !== 'sort' && value.trim()) { // Exclude sort, ignore empty
            if (!newFilters[key]) newFilters[key] = [];
            newFilters[key].push(value.trim());
        }
    });
    // Remove empty filter arrays
    Object.keys(newFilters).forEach(key => { if (newFilters[key].length === 0) delete newFilters[key]; });

    if (JSON.stringify(searchState.filters) !== JSON.stringify(newFilters)) {
        searchState.filters = newFilters;
        searchState.page = 1;
        updateHistory();
        fetchAndRenderResults();
    }
}

/** Handles resetting the filter form. */
function handleFilterReset() {
    console.log("Filters reset.");
    searchState.filters = {};
    searchState.page = 1;
    searchState.sort = 'relevance';
    if (elements.sortSelect) elements.sortSelect.value = 'relevance';
    // No need to manually reset inputs if form.reset() is allowed, but update state & fetch
    updateHistory();
    // Update UI to show cleared state *before* fetch if desired
    updateUiFromState();
    fetchAndRenderResults();
}

/** Handles changing the sort order. */
function handleSortChange(event) {
    const newSort = event.target.value;
    if (newSort !== searchState.sort) {
        searchState.sort = newSort;
        searchState.page = 1;
        updateHistory();
        fetchAndRenderResults();
    }
}

/** Handles clicks on pagination links using event delegation. */
function handlePaginationClick(event) {
    const link = event.target.closest('a[data-page]');
    if (link && !link.classList.contains('disabled')) {
        event.preventDefault();
        const newPage = parseInt(link.dataset.page, 10);
        if (newPage !== searchState.page && !isNaN(newPage)) {
            searchState.page = newPage;
            updateHistory();
            fetchAndRenderResults();
            // Scroll to top of results
            elements.resultsList?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

/** Handles browser back/forward navigation. */
function handlePopState(event) {
    console.log("Popstate event:", event.state);
    // Check if the state object is one we pushed
    // Or simply re-parse the URL as the source of truth
    parseUrlAndUpdateState();
    updateUiFromState();
    fetchAndRenderResults();
}

// =========================================================================
// URL / History Management
// =========================================================================
/** Updates the browser URL bar and history state. */
function updateHistory() {
    const url = buildPageUrl(searchState.page);
    // Use replaceState initially, or pushState if step-by-step history is desired
    history.pushState(searchState, '', url); // Use pushState for back button steps
    // history.replaceState(searchState, '', url); // Use replaceState to avoid history clutter
    console.log("History updated to:", url);
}

/** Builds the page URL string for history/linking. */
function buildPageUrl(pageNumber) {
     const params = new URLSearchParams();
     if (searchState.query) params.set('q', searchState.query);
     if (searchState.type !== 'recipe') params.set('type', searchState.type); // Only add if not default
     if (searchState.sort !== 'relevance') params.set('sort', searchState.sort);
     if (pageNumber > 1) params.set('page', pageNumber);
     Object.entries(searchState.filters).forEach(([key, values]) => {
         const filterValues = Array.isArray(values) ? values : [values];
         filterValues.forEach(value => params.append(key, value));
     });
    return `${window.location.pathname}?${params.toString()}`;
}


// =========================================================================
// Result Rendering Functions (Templates - Placeholders)
// Need implementations like renderRecipeCard, renderChefCard etc. from previous examples
// =========================================================================
const escapeHtml = (unsafe) => (unsafe ?? '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const renderStarHtml = (rating) => { /* ... star generation logic ... */
    const score = parseFloat(rating) || 0;
    const full = Math.floor(score / 2);
    const half = (score % 2) >= 1;
    const empty = 5 - full - (half ? 1 : 0);
    let html = '';
    for(let i=0; i<full; i++) html += '<img src="images/icons/star-filled.svg" alt="" aria-hidden="true" class="star-icon filled">';
    if(half) html += '<img src="images/icons/star-half.svg" alt="" aria-hidden="true" class="star-icon half">';
    for(let i=0; i<empty; i++) html += '<img src="images/icons/star-empty.svg" alt="" aria-hidden="true" class="star-icon empty">';
    return `<div class="rating-stars-display" aria-label="Rating: ${score.toFixed(1)} out of 10 stars">${html}</div>`;
};

function renderRecipeCard(r) { return `<article class="recipe-card card card-interactive"><a href="${escapeHtml(r.url)}" class="card-image-link"><img src="${escapeHtml(r.thumbnail)}" alt="Image of ${escapeHtml(r.title)}"></a><div class="card-content"><h3 class="card-title"><a href="${escapeHtml(r.url)}">${escapeHtml(r.title)}</a></h3><div class="card-rating">${renderStarHtml(r.rating)}<span class="rating-text">(${escapeHtml(parseFloat(r.rating).toFixed(1))}/10)</span></div><p class="card-description">${escapeHtml(r.description)}</p><div class="card-meta">${r.authorName ? `<span class="meta-author">By <a href="${escapeHtml(r.authorUrl)}">${escapeHtml(r.authorName)}</a></span>`: ''}${r.authorName && r.cuisineName ? '<span class="meta-separator">|</span>':''}${r.cuisineName ? `<span class="meta-cuisine"><a href="${escapeHtml(r.cuisineUrl)}">${escapeHtml(r.cuisineName)}</a></span>`:''}</div></div></article>`; }
function renderChefCard(c) { return `<article class="chef-card list-item-card card card-interactive"><a href="${escapeHtml(c.url)}" class="item-link"><img src="${escapeHtml(c.thumbnail)}" alt="${escapeHtml(c.name)} Avatar" class="item-thumb avatar"><div class="item-content"><h3 class="item-title">${escapeHtml(c.name)}</h3><div class="item-rating">${renderStarHtml(c.rating)}<span class="rating-text">(${escapeHtml(parseFloat(c.rating).toFixed(1))}/10)</span></div><p class="item-description">${escapeHtml(c.description)}</p></div></a></article>`; }
function renderIngredientCard(i) { return `<article class="ingredient-card list-item-card card card-interactive"><a href="${escapeHtml(i.url)}" class="item-link"><img src="${escapeHtml(i.thumbnail)}" alt="${escapeHtml(i.name)}" class="item-thumb"><div class="item-content"><h3 class="item-title">${escapeHtml(i.name)}</h3><div class="item-rating">${renderStarHtml(i.rating)}<span class="rating-text">(${escapeHtml(parseFloat(i.rating).toFixed(1))}/10)</span></div><p class="item-description">${escapeHtml(i.description)}</p></div></a></article>`; }
function renderCookbookCard(b) { return `<article class="cookbook-card list-item-card card card-interactive"><a href="${escapeHtml(b.url)}" class="item-link"><img src="${escapeHtml(b.thumbnail)}" alt="Cover of ${escapeHtml(b.title)}" class="item-thumb book-cover"><div class="item-content"><h3 class="item-title">${escapeHtml(b.title)}</h3><p class="item-author">By ${escapeHtml(b.authorName)}</p><div class="item-rating">${renderStarHtml(b.rating)}<span class="rating-text">(${escapeHtml(parseFloat(b.rating).toFixed(1))}/10)</span></div><p class="item-description">${escapeHtml(b.description)}</p></div></a></article>`; }
// Add renderers for technique, cuisine, show, equipment


// =========================================================================
// Simulation Function (Replace with actual API)
// =========================================================================
/** Generates fake search results based on current state for simulation. */
function generateSimulatedResults(state) { /* ... implementation from previous example ... */
     console.log("Generating simulated results for:", state);
    const resultsPerPage = 12;
    const allPossibleResults = [];
    const queryLower = state.query.toLowerCase();

    // Create Dummy Data (Adjust counts as needed)
    if(state.type === 'recipe' || !state.type) for (let i = 1; i <= 58; i++) allPossibleResults.push({ type: 'recipe', id: i, title: `Simulated ${state.query||'Chicken'} Recipe ${i}`, url: `recipe-detail.html?id=${i}`, thumbnail: `images/placeholder/recipe-thumb-${(i%4)+1}.jpg`, rating: (Math.random()*4+6).toFixed(1), description: `Delicious recipe involving ${state.query||'chicken'}. Item ${i}.`, authorName: `Chef ${String.fromCharCode(65+(i%5))}`, authorUrl: `chef-detail.html?id=${100+i%5}`, cuisineName: ['Italian','Mexican','American','Thai','Indian'][i%5], cuisineUrl: `cuisine-detail.html?name=${['italian','mexican','american','thai','indian'][i%5]}` });
    if(state.type === 'chef') for (let i = 1; i <= 3; i++) allPossibleResults.push({ type: 'chef', id: 100+i, name: `Chef ${state.query||'Great'} ${String.fromCharCode(65+i)}`, url: `chef-detail.html?id=${100+i}`, thumbnail: 'images/placeholder/user-avatar.png', rating: (Math.random()*3+7).toFixed(1), description: `Known for amazing ${state.query||'various'} dishes.` });
    if(state.type === 'ingredient') for (let i = 1; i <= 5; i++) allPossibleResults.push({ type: 'ingredient', id: 200+i, name: `${state.query||'Essential'} Ingredient ${i}`, url: `ingredient-detail.html?id=${200+i}`, thumbnail: 'images/placeholder/ingredient.jpg', rating: (Math.random()*2+8).toFixed(1), description: `Goes well with ${state.query||'everything'}.` });
    if(state.type === 'cookbook') for (let i = 1; i <= 2; i++) allPossibleResults.push({ type: 'cookbook', id: 300+i, title: `Cooking ${state.query||'Like a Pro'} Vol ${i}`, url: `cookbook-detail.html?id=${300+i}`, thumbnail: 'images/placeholder/cookbook-generic.jpg', rating: (Math.random()*1+9).toFixed(1), authorName: `Author ${String.fromCharCode(70+i)}`, description: `Features ${state.query||'classic'} recipes.` });
    // Add dummy data for technique, cuisine, show, equipment...

    // Filtering
    let filteredResults = allPossibleResults.filter(item => {
        if (item.type !== state.type) return false; // Type must match
        if (queryLower && !JSON.stringify(item).toLowerCase().includes(queryLower)) return false; // Simple text search
        // Example cuisine filter
        if (state.filters.cuisine && state.filters.cuisine.length > 0) {
             if (!item.cuisineName || !state.filters.cuisine.some(c => item.cuisineName.toLowerCase() === c.toLowerCase())) return false;
        }
        // Example difficulty filter
        if (state.filters.difficulty && state.filters.difficulty.length > 0) {
             // Assume item.difficulty = 'easy'/'medium'/'hard'
             if (!item.difficulty || !state.filters.difficulty.includes(item.difficulty.toLowerCase())) return false;
        }
        // Add more filter logic...
        return true;
    });

    // Sorting
    if (state.sort === 'rating_desc') filteredResults.sort((a, b) => (parseFloat(b.rating)||0) - (parseFloat(a.rating)||0));
    else if (state.sort === 'rating_asc') filteredResults.sort((a, b) => (parseFloat(a.rating)||0) - (parseFloat(b.rating)||0));
    else if (state.sort === 'newest') filteredResults.reverse(); // Simplistic

    // Pagination
    const totalResults = filteredResults.length;
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const startIndex = (state.page - 1) * resultsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, startIndex + resultsPerPage);

    return { results: paginatedResults, totalResults: totalResults, totalPages: totalPages, currentPage: state.page };
}