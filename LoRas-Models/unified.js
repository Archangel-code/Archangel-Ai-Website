// ==============================
// unified.js – LoRA Gallery Logic
// ==============================

// === Settings ===
const perPage = 6;
let currentFilter = "all";
let currentPage = 1;

// === DOM References ===
const cards = Array.from(document.querySelectorAll(".lora-card"));
const filterButtons = document.querySelectorAll(".filter-menu button");

// === Utility: Get Filtered Cards ===
function getFilteredCards() {
  return cards.filter(card => {
    const categoryAttr = card.getAttribute("data-category") || "";
    const categories = categoryAttr.trim().split(/\s+/);
    return currentFilter === "all" || categories.includes(currentFilter);
  });
}

// === Show a Page of Filtered Cards ===
function showPage(page) {
  const filtered = getFilteredCards();
  const start = (page - 1) * perPage;
  const end = page * perPage;

  // Hide all cards
  cards.forEach(card => {
    card.style.display = "none";
  });

  // Show selected page cards only
  filtered.slice(start, end).forEach(card => {
    card.style.display = "block";
  });

  // Highlight active page button
  const buttons = document.querySelectorAll(".pagination button");
  buttons.forEach((btn, i) => {
    btn.classList.toggle("active", i + 1 === page);
  });

  currentPage = page;
}

// === Create Pagination Buttons ===
function setupPagination() {
  const oldPagination = document.querySelector(".pagination");
  if (oldPagination) oldPagination.remove();

  const filtered = getFilteredCards();
  const pageCount = Math.ceil(filtered.length / perPage);

  // Always show first page, even without pagination
  showPage(1);

  if (pageCount <= 1) return;

  const pagination = document.createElement("div");
  pagination.className = "pagination";

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      showPage(i);
    });

    pagination.appendChild(btn);
  }

document.getElementById("pagination-slot").appendChild(pagination);
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