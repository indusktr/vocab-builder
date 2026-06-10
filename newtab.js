document.addEventListener('DOMContentLoaded', () => {
  const wordList = document.getElementById('word-list');
  const searchInput = document.getElementById('search');
  const statusSelect = document.getElementById('statusFilter');
  let words = [];
  let searchTerm = '';
  let statusFilter = 'all';

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

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      renderCards();
    });
    statusSelect.value = 'all';
  }

  function renderCards() {
    wordList.innerHTML = '';

    // Build a list of display items mapping to original indices,
    // and reverse it so the newest saved words appear first.
    const displayList = words.map((item, index) => ({ item, index })).reverse();

    // Apply search filter
    const filtered = displayList.filter(({ item }) => {
      const status = item.status || 'neutral';
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }
      if (!searchTerm) return true;
      return String(item.word).toLowerCase().includes(searchTerm)
        || String(item.definition || '').toLowerCase().includes(searchTerm)
        || String(item.synonym || '').toLowerCase().includes(searchTerm);
    });

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
      const status = item.status || 'unknown';
      const card = document.createElement('div');
      card.className = 'card';
      card.draggable = true;
      card.dataset.index = originalIndex;
      card.innerHTML = `
        <div class="card-word">${item.word}</div>
        <div class="card-text"><strong>Definition:</strong> ${item.definition}</div>
        <div class="card-text"><strong>Synonyms:</strong> ${item.synonym}</div>
        <div class="status-row">
          <button type="button" class="status-btn known ${status === 'known' ? 'active' : ''}" data-index="${originalIndex}" data-status="known" title="Fully memorised">✅</button>
          <button type="button" class="status-btn review ${status === 'review' ? 'active' : ''}" data-index="${originalIndex}" data-status="review" title="Needs review">➖</button>
          <button type="button" class="status-btn unknown ${status === 'unknown' ? 'active' : ''}" data-index="${originalIndex}" data-status="unknown" title="Don't know">❌</button>
        </div>
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

    wordList.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const wordIndex = Number(e.target.getAttribute('data-index'));
        const newStatus = e.target.getAttribute('data-status');
        updateWordStatus(wordIndex, newStatus);
      });
    });
  }

  function updateWordStatus(index, newStatus) {
    if (!words[index]) return;
    const currentStatus = words[index].status || 'neutral';
    if (currentStatus === newStatus) {
      words[index].status = 'neutral';
    } else {
      words[index].status = newStatus;
    }
    saveWords();
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
