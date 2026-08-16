// === Gallery Settings ===
const perPage = 9; // Number of items per page (3x3 grid)
let currentPage = 1;
let currentSort = "az"; // "az" or "newest"
let currentSearch = "";
let galleryData = []; // Will be populated with gallery items
let lastFocusedElement = null;

// === Initialize on DOM Load ===
document.addEventListener('DOMContentLoaded', function() {
    loadGalleryData();
    setupControls();
});

// === Load Gallery Data ===
function loadGalleryData() {
    fetch('gallery.json')
        .then(response => {
            if (!response.ok) throw new Error(`Gallery request failed: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Transform data to match expected format
            galleryData = data.map((item, index) => ({
                id: index + 1,
                title: item.name,
                tags: [item.tag],
                image: item.src,
                dateAdded: new Date() // Add current date as placeholder for newest sort
            }));
            
            // Don't populate tag filter anymore
            // populateTagFilter();
            
            // Display gallery after data is loaded
            displayGallery();
        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            // Fallback to empty array
            galleryData = [];
            // populateTagFilter();
            displayGallery();
        });
}

// === Setup Controls ===
function setupControls() {
    const sortAZ = document.getElementById('sortAZ');
    const sortNewest = document.getElementById('sortNewest');
    const searchInput = document.getElementById('searchInput');
    
    // Sort button clicks
    sortAZ.addEventListener('click', function() {
        currentSort = 'az';
        currentPage = 1;
        updateActiveButton('sortAZ');
        displayGallery();
    });
    
    sortNewest.addEventListener('click', function() {
        currentSort = 'newest';
        currentPage = 1;
        updateActiveButton('sortNewest');
        displayGallery();
    });
    
    // Search input with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = this.value.toLowerCase().trim();
            currentPage = 1;
            displayGallery();
        }, 300);
    });
}

// === Update Active Button ===
function updateActiveButton(activeId) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    const activeButton = document.getElementById(activeId);
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
}

// === Filter and Display Gallery ===
function displayGallery() {
    let filteredItems = galleryData.filter(item => {
        // Search filter
        const searchMatch = !currentSearch || 
            item.title.toLowerCase().includes(currentSearch) ||
            item.tags.some(tag => tag.toLowerCase().includes(currentSearch));
        
        return searchMatch;
    });
    
    // Sort items based on current sort
    if (currentSort === 'az') {
        filteredItems = filteredItems.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === 'newest') {
        filteredItems = filteredItems.sort((a, b) => b.id - a.id); // Reverse order for newest first
    }
    
    // Display current page items
    displayItems(filteredItems);
    
    // Update pagination
    updatePagination(filteredItems.length);
}

// === Display Items ===
function displayItems(items) {
    const grid = document.getElementById('galleryGrid');
    const startIdx = (currentPage - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageItems = items.slice(startIdx, endIdx);
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add items to grid
    pageItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'gallery-item';
        itemElement.tabIndex = 0;
        itemElement.setAttribute('role', 'button');
        itemElement.setAttribute('aria-label', `Open ${item.title} preview`);
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="item-info">
                <h3>${item.title}</h3>
                <div class="tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        itemElement.addEventListener('click', () => openFullView(item.image, item.title));
        itemElement.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            openFullView(item.image, item.title);
        });
        grid.appendChild(itemElement);
    });
}

// === Advanced Pagination ===
function updatePagination(totalItems) {
    const pageCount = Math.ceil(totalItems / perPage);
    
    if (pageCount <= 1) {
        document.querySelector('.pagination').style.display = 'none';
        return;
    }
    
    document.querySelector('.pagination').style.display = 'flex';
    
    let html = '';

    // Previous button
    html += `<button class="nav-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;

    // Calculate which pages to show
    let startPage, endPage;
    const maxVisiblePages = 5;
    
    if (pageCount <= maxVisiblePages) {
        startPage = 1;
        endPage = pageCount;
    } else {
        if (currentPage <= 3) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (currentPage >= pageCount - 2) {
            startPage = pageCount - maxVisiblePages + 1;
            endPage = pageCount;
        } else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }
    }

    // First page and ellipsis if needed
    if (startPage > 1) {
        html += `<button onclick="goToPage(1)" ${currentPage === 1 ? 'class="active"' : ''}>1</button>`;
        if (startPage > 2) {
            html += `<span class="ellipsis">...</span>`;
        }
    }

    // Main page numbers
    for (let i = startPage; i <= endPage; i++) {
        html += `<button type="button" onclick="goToPage(${i})" ${currentPage === i ? 'class="active" aria-current="page"' : ''}>${i}</button>`;
    }

    // Last page and ellipsis if needed
    if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
            html += `<span class="ellipsis">...</span>`;
        }
        html += `<button onclick="goToPage(${pageCount})" ${currentPage === pageCount ? 'class="active"' : ''}>${pageCount}</button>`;
    }

    // Next button
    html += `<button class="nav-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === pageCount ? 'disabled' : ''}>Next</button>`;

    // Page jump input
    html += `<div class="page-jump">
        <span>Go to:</span>
        <input type="number" id="page-jump-input" min="1" max="${pageCount}" placeholder="Page">
        <button onclick="handlePageJump(${pageCount})">Go</button>
    </div>`;

    document.querySelector('.pagination').innerHTML = html;
    
    // Add enter key handler for page jump
    const jumpInput = document.getElementById('page-jump-input');
    if (jumpInput) {
        jumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handlePageJump(pageCount);
            }
        });
    }
}

// === Page Navigation Functions ===
function goToPage(page) {
    currentPage = page;
    displayGallery();
}

function handlePageJump(maxPage) {
    const jumpInput = document.getElementById('page-jump-input');
    const page = parseInt(jumpInput.value);
    
    if (page >= 1 && page <= maxPage) {
        currentPage = page;
        displayGallery();
        jumpInput.value = '';
    } else {
        jumpInput.value = '';
        jumpInput.placeholder = 'Invalid page';
        setTimeout(() => {
            jumpInput.placeholder = 'Page';
        }, 2000);
    }
}

// === Fullview/Lightbox Functions ===
function openFullView(imageSrc, imageTitle) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('fullviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fullviewModal';
        modal.className = 'fullview-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'fullviewTitle');
        modal.innerHTML = `
            <div class="fullview-content">
                <button type="button" class="fullview-close" aria-label="Close preview">&times;</button>
                <img id="fullviewImage" class="fullview-image" src="" alt="">
                <div class="fullview-title" id="fullviewTitle"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.fullview-close').addEventListener('click', closeFullView);
        
        // Add click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFullView();
            }
        });
        
        // Add escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeFullView();
            }
        });
    }
    
    lastFocusedElement = document.activeElement;

    // Set image and title
    document.getElementById('fullviewImage').src = imageSrc;
    document.getElementById('fullviewImage').alt = imageTitle;
    document.querySelector('.fullview-title').textContent = imageTitle;
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    modal.querySelector('.fullview-close').focus();
}

function closeFullView() {
    const modal = document.getElementById('fullviewModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore page behavior
        lastFocusedElement?.focus();
    }
}
