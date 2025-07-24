
document.addEventListener("DOMContentLoaded", () => {
  const cards = Array.from(document.querySelectorAll(".lora-card"));
  const perPage = 6;
  let currentPage = 1;
  let currentFilter = "all";

  const buttons = document.querySelectorAll(".filter-menu button");

function getFilteredCards() {
  return cards.filter(card => {
    const categoryAttr = card.getAttribute("data-category") || "";
    const categories = categoryAttr.trim().split(/\s+/); // ← trim entfernt Leerzeichen!
    return currentFilter === "all" || categories.includes(currentFilter);
  });
}

function showPage(page) {
  const filtered = getFilteredCards();
  const start = (page - 1) * perPage;
  const end = page * perPage;

  cards.forEach(card => {
    card.style.display = "none";
  });

  filtered.slice(start, end).forEach(card => {
    card.style.display = "block";
  });

  const buttons = document.querySelectorAll(".pagination button");
  buttons.forEach((btn, i) => {
    btn.classList.toggle("active", i + 1 === page);
  });

  currentPage = page;
}

function setupPagination() {
  const container = document.querySelector(".pagination");
  if (container) container.remove();

  const filtered = getFilteredCards();
  const pageCount = Math.ceil(filtered.length / perPage);

  // 🧠 Diese Zeile ist NEU: Verstecke zuerst alles
  cards.forEach(card => {
    card.style.display = "none";
  });

  // ✅ Immer Seite 1 zeigen, auch wenn keine Paginierung nötig
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

  document.querySelector(".layout-container").appendChild(pagination);
}

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.getAttribute("data-filter");
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPage = 1;
      setupPagination();
    });
  });

  setupPagination();
});
