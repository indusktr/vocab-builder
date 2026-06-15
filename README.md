**Vocab Builder** is a lightweight, privacy-first Chrome extension that helps you understand and retain new words seamlessly without interrupting your reading flow. Simply highlight or double-click any unfamiliar word on any website to instantly view its definition and synonyms in a clean popup card. Save it to your personalized dashboard, track your mastery, and expand your vocabulary effortlessly.

Perfect for students preparing for competitive exams like the **SAT, GRE, GMAT, IELTS, and TOEFL**, or anyone looking to improve their English vocabulary while reading articles, books, or news online.

---

## Features

- **Instant Word Lookup:** Double-click or highlight any word to view definitions and synonyms via a floating popup card without leaving the page.
- **One-Click Saving:** Instantly add words along with their context directly to your personal vocabulary library.
- **Smart New Tab Dashboard:** Every time you open a new tab, access a clean workspace to manage, search, and filter your collection.
- **Color-Coded Progress Tracking:** Gamify your learning by organizing words based on your mastery status:
  - 🟢 **Fully Memorized**
  - 🟡 **Needs Review / Partially Known**
  - 🔴 **Don't Know Yet**
- **Beautiful Dark Mode:** Study comfortably day or night with a seamless, dedicated dark theme custom-built for night owls.
- **Privacy First:** No accounts, no tracking, and no external servers. Everything is stored securely on your local device via the Chrome Storage API.

├── manifest.json         # Extension configuration and metadata
├── background.js         # Service worker handles background events
├── content.js            # Injected script handles word selection & lookup
├── content.css           # Styling for the floating definition popup
├── newtab.html           # Structure for the personalized dashboard
├── newtab.js             # Logic for managing, filtering, and updating words
├── newtab.css            # Layout and styles for the dashboard & dark mode
└── icons/                # Icons Folder containing:
    ├── 16.png            # Toolbar icon (16x16)
    ├── 32.png            # High-DPI toolbar icon (32x32)
    ├── 48.png            # Extension management page icon (48x48)
    └── 128.png           # Chrome Web Store & installation icon (128x128)
