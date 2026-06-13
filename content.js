// Listen for text selection
document.addEventListener('mouseup', async (e) => {
  const selection = window.getSelection();
  const word = selection.toString().trim();

  // Only proceed if a single word is selected
  if (!word || word.includes(' ')) {
    return;
  }

  // Prevent acting if clicking inside an existing popup
  const existingPopup = document.getElementById('vocab-builder-popup');
  if (existingPopup && existingPopup.contains(e.target)) {
    return;
  }

  // Remove old popup if it exists
  if (existingPopup) {
    existingPopup.remove();
  }

  // Get coordinates of the highlighted text
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  showPopup(word, rect.left + window.scrollX, rect.bottom + window.scrollY);
});

// Hide popup when clicking anywhere else
document.addEventListener('mousedown', (e) => {
  const popup = document.getElementById('vocab-builder-popup');
  if (popup && !popup.contains(e.target)) {
    popup.remove();
  }
});

async function showPopup(word, x, y) {
  const popup = document.createElement('div');
  popup.id = 'vocab-builder-popup';
  popup.style.left = `${x}px`;
  popup.style.top = `${y + 10}px`;
  popup.innerHTML = `<div class="vocab-loading">Loading definition...</div>`;
  document.body.appendChild(popup);

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) throw new Error('Word not found');

    const data = await response.json();
    const meaningObj = data[0].meanings[0];
    const definition = meaningObj.definitions[0].definition;
    const synonyms = meaningObj.synonyms || [];
    const synonymText = synonyms.length > 0 ? synonyms.slice(0, 3).join(', ') : 'None';

    popup.innerHTML = `
      <div class="vocab-title">${word}</div>
      <div class="vocab-text">${definition}</div>
      <div id="vocab-synonyms" class="vocab-text"></div>
      <button id="vocab-save-btn">Save Word</button>
    `;

    const synonymEl = document.getElementById('vocab-synonyms');
    if (synonymText && synonymText !== 'None') {
      synonymEl.textContent = synonymText;
    } else {
      synonymEl.style.display = 'none';
    }

    document.getElementById('vocab-save-btn').addEventListener('click', () => {
      const btn = document.getElementById('vocab-save-btn');
      btn.textContent = '✓ Saved to Hub!';
      btn.style.backgroundColor = '#10B981';
      saveWord(word, definition, synonymText, popup);
    });
  } catch (error) {
    popup.innerHTML = `<div class="vocab-error">Could not find definition for "${word}".</div>`;
  }
}

function saveWord(word, definition, synonym, popup) {
  chrome.runtime.sendMessage(
    { action: 'saveWord', word, definition, synonym },
    (response) => {
      if (response && response.success) {
        if (response.alreadySaved) {
          popup.innerHTML = `<div class="vocab-error">Already saved.</div>`;
          return;
        }

        setTimeout(() => popup.remove(), 1000);
      }
    }
  );
}