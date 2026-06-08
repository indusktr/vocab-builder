document.addEventListener('DOMContentLoaded', () => {
  const wordList = document.getElementById('word-list');
  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sort');
  let words = [];
  let searchTerm = '';
  let sortMode = 'newest';

  chrome.storage.local.get({ savedWords: [] }, (result) => {
    words = result.savedWords || [];

    if (words.length === 0) {
      wordList.innerHTML = `<p class="empty-state">You haven't saved any words yet. Highlight a word on any webpage to get started!</p>`;
      return;
    }

    renderCards();
  });

  // Wire up search and sort UI
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      renderCards();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortMode = e.target.value;
      renderCards();
    });
    // default value
    sortSelect.value = 'newest';
  }

  function renderCards() {
    wordList.innerHTML = '';

    // Build a list of display items mapping to original indices
    const displayList = words.map((item, index) => ({ item, index }));

    // Apply search filter
    const filtered = displayList.filter(({ item }) => {
      if (!searchTerm) return true;
      return String(item.word).toLowerCase().includes(searchTerm)
        || String(item.definition || '').toLowerCase().includes(searchTerm)
        || String(item.synonym || '').toLowerCase().includes(searchTerm);
    });

    // Apply sort
    if (sortMode === 'newest') {
      filtered.sort((a, b) => b.index - a.index);
    } else if (sortMode === 'oldest') {
      filtered.sort((a, b) => a.index - b.index);
    } else if (sortMode === 'alphabetical') {
      filtered.sort((a, b) => String(a.item.word).localeCompare(String(b.item.word)));
    }

    // If there are no results, show an empty state message
    if (filtered.length === 0) {
      if (words.length === 0) {
        wordList.innerHTML = `
          <div class="empty-state">
            <div>You haven't saved any words yet.</div>
            <div>Highlight a word on any webpage and use the extension popup to save it.</div>
            <button class="primary-btn" id="how-to-save">How to save</button>
          </div>
        `;
        const howBtn = document.getElementById('how-to-save');
        if (howBtn) howBtn.addEventListener('click', () => {
          alert("To save a word: highlight any word on a webpage, open the extension popup, and click 'Save'.");
        });
        return;
      }

      wordList.innerHTML = `<div class="empty-state">No words match your search.</div>`;
      return;
    }

    // Render filtered and sorted list
    filtered.forEach(({ item, index: originalIndex }) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.draggable = true;
      card.dataset.index = originalIndex;
      card.innerHTML = `
        <div class="card-word">${item.word}</div>
        <div class="card-text"><strong>Definition:</strong> ${item.definition}</div>
        <div class="card-text"><strong>Synonyms:</strong> ${item.synonym}</div>
        <button class="delete-btn" data-index="${originalIndex}">×</button>
      `;

      addDragHandlers(card);
      wordList.appendChild(card);
    });

    wordList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const removeIndex = Number(e.target.getAttribute('data-index'));
        words.splice(removeIndex, 1);
        saveWords();
      });
    });
  }

  function addDragHandlers(card) {
    card.addEventListener('dragstart', () => {
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('drag-over');
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');

      const dragging = document.querySelector('.card.dragging');
      if (!dragging || dragging === card) return;

      const fromIndex = Number(dragging.dataset.index);
      const toIndex = Number(card.dataset.index);
      moveWord(fromIndex, toIndex);
    });
  }

  wordList.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  wordList.addEventListener('drop', (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.card.dragging');
    if (!dragging) return;

    const targetCard = e.target.closest('.card');
    if (!targetCard) {
      const fromIndex = Number(dragging.dataset.index);
      moveWord(fromIndex, words.length - 1);
    }
  });

  function moveWord(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const [movedWord] = words.splice(fromIndex, 1);
    words.splice(toIndex, 0, movedWord);
    saveWords();
  }

  function saveWords() {
    chrome.storage.local.set({ savedWords: words }, () => {
      renderCards();
    });
  }
});
