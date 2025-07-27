
document.addEventListener('DOMContentLoaded', () => {
  let data = [];
  let currentPage = 1;
  const itemsPerPage = 16;
  let activeTag = 'all';
  let searchQuery = '';

  const gallery = document.getElementById('galleryGrid');
  const tagFilter = document.getElementById('tagFilter');
  const searchInput = document.getElementById('searchInput');
  const pageIndicator = document.getElementById('pageIndicator');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');

  fetch('gallery.json')
    .then(res => res.json())
    .then(json => {
      data = json;
      const uniqueTags = [...new Set(data.map(item => item.tag))];
      uniqueTags.forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        tagFilter.appendChild(opt);
      });
      updateGallery();
    });

  function updateGallery() {
    const filtered = data.filter(item =>
      (activeTag === 'all' || item.tag === activeTag) &&
      (item.name.toLowerCase().includes(searchQuery) || item.tag.toLowerCase().includes(searchQuery))
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    gallery.innerHTML = '';
    filtered.slice(start, end).forEach(item => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <img src="${item.src}" alt="${item.name}">
        <p>${item.name}</p>
      `;
      gallery.appendChild(div);
    });

    pageIndicator.textContent = `Page ${currentPage}`;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
  }

  tagFilter.addEventListener('change', e => {
    activeTag = e.target.value;
    currentPage = 1;
    updateGallery();
  });

  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    currentPage = 1;
    updateGallery();
  });

  prevPage.addEventListener('click', () => {
    currentPage--;
    updateGallery();
  });

  nextPage.addEventListener('click', () => {
    currentPage++;
    updateGallery();
  });
});
