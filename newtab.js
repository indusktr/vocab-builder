document.addEventListener('DOMContentLoaded', () => {
  const wordList = document.getElementById('word-list');
  let words = [];

  chrome.storage.local.get({ savedWords: [] }, (result) => {
    words = result.savedWords || [];

    if (words.length === 0) {
      wordList.innerHTML = `<p class="empty-state">You haven't saved any words yet. Highlight a word on any webpage to get started!</p>`;
      return;
    }

    renderCards();
  });

  function renderCards() {
    wordList.innerHTML = '';

    words.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.draggable = true;
      card.dataset.index = index;
      card.innerHTML = `
        <div class="card-word">${item.word}</div>
        <div class="card-text"><strong>Definition:</strong> ${item.definition}</div>
        <div class="card-text"><strong>Synonyms:</strong> ${item.synonym}</div>
        <button class="delete-btn" data-index="${index}">Remove</button>
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
