
// === Settings ===
const perPage = 6;
let currentFilter = "all";
let currentPage = 1;
let currentSort = "alphabetical";

// === Initialize on DOM Load ===
document.addEventListener('DOMContentLoaded', function() {
    setupCardEvents();
    setupFilterButtons();
    setupSortButtons();
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

// === Filtering and Sorting ===
function filterAndDisplayCards() {
    const cards = Array.from(document.querySelectorAll('.lora-card'));
    const filteredCards = cards.filter(card => {
        return currentFilter === 'all' || card.dataset.category === currentFilter;
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

// === End of Script ===
