
// === Settings ===
const perPage = 6;
let currentFilter = "all";
let currentPage = 1;
let currentSort = "alphabetical";
let currentSearch = "";

// === Initialize on DOM Load ===
document.addEventListener('DOMContentLoaded', function() {
    setupCardEvents();
    setupFilterButtons();
    setupSortButtons();
    setupSearchFunctionality();
    filterAndDisplayCards();
    
    // Set initial scroll position
    document.documentElement.style.setProperty('--window-scroll-y', window.scrollY + 'px');
    
    // Track scroll position for modal centering
    window.addEventListener('scroll', function() {
        document.documentElement.style.setProperty('--window-scroll-y', window.scrollY + 'px');
    });
});

// === Card Events ===
function setupCardEvents() {
    // Handle card clicks
    document.querySelectorAll('.lora-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' || e.target.closest('.buttons')) return;
            
            const expand = this.nextElementSibling;
            if (expand && expand.classList.contains('card-expand')) {
                // Close all other modals
                document.querySelectorAll('.card-expand').forEach(el => {
                    el.classList.remove('active');
                });
                
                // Update scroll position for modal centering
                document.documentElement.style.setProperty('--window-scroll-y', window.scrollY + 'px');
                
                // Show modal (blur is now part of the modal)
                expand.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Handle close button and background clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-btn') || e.target.classList.contains('card-expand')) {
            const expandedCard = e.target.closest('.card-expand');
            if (expandedCard) {
                expandedCard.classList.remove('active');
                document.body.style.overflow = '';
            }
            e.stopPropagation();
        }
    });

    // Handle ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const expandedCard = document.querySelector('.card-expand.active');
            if (expandedCard) {
                expandedCard.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// === Filter Buttons ===
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-menu button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            currentPage = 1;
            filterAndDisplayCards();
        });
    });
}

// === Sort Buttons ===
function setupSortButtons() {
    const sortButtons = document.querySelectorAll('.sort-menu .sort-btn');
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            sortButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentSort = button.dataset.sort;
            filterAndDisplayCards();
        });
    });
}

// === Search Functionality ===
function setupSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const clearButton = document.getElementById('clear-search');
    
    // Search input event listener with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = this.value.toLowerCase().trim();
            currentPage = 1;
            filterAndDisplayCards();
        }, 300); // 300ms debounce
    });
    
    // Clear search button
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        currentSearch = '';
        currentPage = 1;
        filterAndDisplayCards();
        searchInput.focus();
    });
    
    // Enter key to focus search
    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && !document.querySelector('.card-expand.active') && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// === Filtering and Sorting ===
function filterAndDisplayCards() {
    const cards = Array.from(document.querySelectorAll('.lora-card'));
    const filteredCards = cards.filter(card => {
        // Category filter
        const categoryMatch = currentFilter === 'all' || card.dataset.category === currentFilter;
        
        // Search filter
        let searchMatch = true;
        if (currentSearch) {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const tags = card.dataset.tags ? card.dataset.tags.toLowerCase() : '';
            
            // Get description from the expanded modal if the card description is empty
            const expandedCard = card.nextElementSibling;
            let expandedDescription = '';
            if (expandedCard && expandedCard.classList.contains('card-expand')) {
                const infoText = expandedCard.querySelector('.info-text p');
                if (infoText) {
                    expandedDescription = infoText.textContent.toLowerCase();
                }
            }
            
            searchMatch = title.includes(currentSearch) || 
                         description.includes(currentSearch) || 
                         expandedDescription.includes(currentSearch) ||
                         tags.includes(currentSearch);
        }
        
        return categoryMatch && searchMatch;
    });

    // Sort cards
    filteredCards.sort((a, b) => {
        if (currentSort === 'alphabetical') {
            const titleA = a.querySelector('h3').textContent.trim().toLowerCase();
            const titleB = b.querySelector('h3').textContent.trim().toLowerCase();
            return titleA.localeCompare(titleB);
        } else if (currentSort === 'newest') {
            const dateA = new Date(a.dataset.timestamp);
            const dateB = new Date(b.dataset.timestamp);
            return dateB - dateA;
        }
        return 0;
    });

    // Display cards and update pagination
    displayCards(filteredCards);
    updatePagination(filteredCards.length);
    updateSearchResultsInfo(filteredCards.length, cards.length);
}

// === Display Cards ===
function displayCards(cards) {
    const startIdx = (currentPage - 1) * perPage;
    const endIdx = startIdx + perPage;
    
    // Hide all cards and their expanded views
    document.querySelectorAll('.lora-card, .card-expand').forEach(el => {
        el.style.display = 'none';
    });

    // Show current page's cards and their modals
    cards.slice(startIdx, endIdx).forEach(card => {
        card.style.display = '';
        
        // Find the corresponding card-expand more reliably
        let expand = card.nextElementSibling;
        
        // Skip any text nodes or other elements until we find card-expand
        while (expand && (!expand.classList || !expand.classList.contains('card-expand'))) {
            expand = expand.nextElementSibling;
        }
        
        if (expand && expand.classList.contains('card-expand')) {
            expand.style.display = '';
        }
    });

    // Update single card class
    const container = document.querySelector('.gallery-container');
    container.classList.toggle('single-card', cards.length === 1);
}

// === Pagination ===
function updatePagination(totalCards) {
    const paginationSlot = document.getElementById('pagination-slot');
    const pageCount = Math.ceil(totalCards / perPage);

    let html = '<div class="pagination">';
    for (let i = 1; i <= pageCount; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    html += '</div>';

    paginationSlot.innerHTML = html;

    // Add click handlers to pagination buttons
    document.querySelectorAll('.pagination button').forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            currentPage = idx + 1;
            filterAndDisplayCards();
        });
    });
}

// === Search Results Info ===
function updateSearchResultsInfo(filteredCount, totalCount) {
    const searchResultsInfo = document.getElementById('search-results-info');
    
    if (currentSearch) {
        if (filteredCount === 0) {
            searchResultsInfo.textContent = `No results found for "${currentSearch}"`;
        } else if (filteredCount === 1) {
            searchResultsInfo.textContent = `1 result found for "${currentSearch}"`;
        } else {
            searchResultsInfo.textContent = `${filteredCount} results found for "${currentSearch}"`;
        }
        searchResultsInfo.style.display = 'block';
    } else if (currentFilter !== 'all') {
        if (filteredCount === 0) {
            searchResultsInfo.textContent = `No ${currentFilter} models found`;
        } else if (filteredCount === 1) {
            searchResultsInfo.textContent = `1 ${currentFilter} model`;
        } else {
            searchResultsInfo.textContent = `${filteredCount} ${currentFilter} models`;
        }
        searchResultsInfo.style.display = 'block';
    } else {
        searchResultsInfo.style.display = 'none';
    }
}

// === End of Script ===
