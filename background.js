chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveWord') {
    
    // Background worker safely accesses storage
    chrome.storage.local.get({ savedWords: [] }, (result) => {
      const words = result.savedWords;
      const alreadySaved = words.some(w => w.word.toLowerCase() === request.word.toLowerCase());
      
      if (!alreadySaved) {
        words.unshift({ 
          word: request.word, 
          definition: request.definition, 
          synonym: request.synonym,
          savedAt: Date.now()
        });
      }

      chrome.storage.local.set({ savedWords: words }, () => {
        sendResponse({ success: true, alreadySaved });
      });
    });

    // Required to keep the message channel open for the async storage call
    return true; 
  }
});