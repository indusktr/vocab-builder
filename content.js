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
  // Position the popup slightly below the highlighted word
  popup.style.left = `${x}px`;
  popup.style.top = `${y + 10}px`; 
  popup.innerHTML = `<div class="vocab-loading">Loading definition...</div>`;
  document.body.appendChild(popup);

  try {
    // Fetch data from the Free Dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) throw new Error('Word not found');

    const data = await response.json();
    
    // Extract the first available meaning, definition, and synonyms
    const meaningObj = data[0].meanings[0];
    const definition = meaningObj.definitions[0].definition;
    const synonyms = meaningObj.synonyms || [];
    const synonymText = synonyms.length > 0 ? synonyms.slice(0, 3).join(', ') : 'None';

    popup.innerHTML = `
      <div class="vocab-title">${word}</div>
      <div class="vocab-text"><strong>Def:</strong> ${definition}</div>
      <div class="vocab-text"><strong>Syn:</strong> ${synonymText}</div>
      <button id="vocab-save-btn">Save Word</button>
    `;

    document.getElementById('vocab-save-btn').addEventListener('click', () => {
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

        const btn = document.getElementById('vocab-save-btn');
        btn.textContent = 'Saved!';
        btn.style.backgroundColor = '#10b981';
        
        setTimeout(() => popup.remove(), 1000); 
      }
    }
  );
}