
// ==============================
// unified.js – LoRA Gallery Logic with Sort
// ==============================

// === Settings ===
const perPage = 6;
let currentFilter = "all";
let currentPage = 1;
let currentSort = "alphabetical"; // or "newest"

// === DOM References ===
const cards = Array.from(document.querySelectorAll(".lora-card"));
const filterButtons = document.querySelectorAll(".filter-menu button");
const sortButtons = document.querySelectorAll(".sort-menu .sort-btn");
const galleryContainer = document.querySelector(".gallery-container");

// === Setup Sort Buttons ===
sortButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sortButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSort = btn.dataset.sort;
    setupPagination();
  });
});

// === Utility: Get Filtered and Sorted Cards ===
function getFilteredCards() {
  let filtered = cards.filter(card => {
    const categoryAttr = card.getAttribute("data-category") || "";
    const categories = categoryAttr.trim().split(/\s+/);
    return currentFilter === "all" || categories.includes(currentFilter);
  });

  if (currentSort === "alphabetical") {
    filtered.sort((a, b) => {
      const nameA = (a.querySelector("h3")?.textContent.split("(")[0] || "").trim().toLowerCase();
      const nameB = (b.querySelector("h3")?.textContent.split("(")[0] || "").trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } else if (currentSort === "newest") {
    filtered.sort((a, b) => {
      const timeA = new Date(a.dataset.timestamp || 0);
      const timeB = new Date(b.dataset.timestamp || 0);
      return timeB - timeA;
    });
  }

  return filtered;
}

// === Show a Page of Filtered Cards (and reorder DOM!) ===
function showPage(page) {
  const filtered = getFilteredCards();
  const start = (page - 1) * perPage;
  const end = page * perPage;

  // Entferne alle Karten aus dem Container
  cards.forEach(card => {
    card.style.display = "none";
    if (card.parentNode === galleryContainer) {
      galleryContainer.removeChild(card);
    }
  });

  // Zeige und füge sortierte Karten in richtiger Reihenfolge ein
  filtered.slice(start, end).forEach(card => {
    card.style.display = "block";
    galleryContainer.appendChild(card);
  });

  const buttons = document.querySelectorAll(".pagination button");
  buttons.forEach((btn, i) => {
    btn.classList.toggle("active", i + 1 === page);
  });

  currentPage = page;
}

// === Setup Pagination ===
function setupPagination() {
  const oldPagination = document.querySelector(".pagination");
  if (oldPagination) oldPagination.remove();

  const filtered = getFilteredCards();
  const pageCount = Math.ceil(filtered.length / perPage);

  showPage(1);
  updateSingleCardClass();

  if (pageCount <= 1) return;

  const pagination = document.createElement("div");
  pagination.className = "pagination";

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      showPage(i);
      updateSingleCardClass();
    });

    pagination.appendChild(btn);
  }

  document.getElementById("pagination-slot").appendChild(pagination);
}

// === Observe Changes to Cards and Update Single Card Class ===
function updateSingleCardClass() {
  const visibleCards = document.querySelectorAll(".lora-card:not([style*='display: none'])");
  const container = document.querySelector(".gallery-container");

  if (visibleCards.length === 1) {
    container.classList.add("single-card");
  } else {
    container.classList.remove("single-card");
  }
}

// === Setup Filter Buttons ===
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    setupPagination();
  });
});

// === Initial Load ===
setupPagination();
