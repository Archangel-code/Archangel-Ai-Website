document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('galleryGrid');
  const tagInput = document.getElementById('tagInput');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageIndicator = document.getElementById('pageIndicator');

  let allItems = [];
  let currentPage = 1;
  const itemsPerPage = 16;
  let searchTag = '';

  function updateGallery() {
    const filteredItems = allItems.filter(item =>
      searchTag === '' || item.tag.toLowerCase().includes(searchTag)
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    grid.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    filteredItems.slice(start, end).forEach(item => {
      const el = document.createElement('div');
      el.className = 'gallery-item';
      el.dataset.tags = item.tag;
      el.innerHTML = `
        <img src="${item.src}" alt="${item.name}" class="rounded shadow">
        <p class="mt-2 text-center">${item.name}</p>
      `;
      grid.appendChild(el);
    });

    pageIndicator.textContent = `Page ${currentPage}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }

  tagInput.addEventListener('input', () => {
    searchTag = tagInput.value.trim().toLowerCase();
    currentPage = 1;
    updateGallery();
  });

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateGallery();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    currentPage++;
    updateGallery();
  });

  // JSON laden
fetch('gallery.json')
    .then(res => res.json())
    .then(data => {
      allItems = data;
      updateGallery();
    });
});
