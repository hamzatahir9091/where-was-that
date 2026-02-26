
# 📍 Where Was That

A lightweight Chrome extension that lets you **drop visual pins on any webpage** and save their positions — so you never lose where something was again.

Perfect for:

* Remembering important sections
* Marking bugs while testing
* Saving references while reading
* Annotating long pages visually

---

## ✨ Features

* 📌 Add pins anywhere on a webpage
* 🖱️ Click-to-place system
* 💾 Pins stored per page
* 🗂 View saved pins
* ⌨️ Keyboard shortcuts support
* 🎯 Lightweight & fast

---

# 🛠 How To Use Locally (Development Setup)

Since this is a Chrome extension, it’s not started with `npm run dev`.

Follow these steps:

---

## 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/where-was-that.git
cd where-was-that
```

Or if already cloned:

```bash
git pull origin main
```

---

## 2️⃣ Make Sure You Have These Files

Your project folder should look something like:

```
where-was-that/
│
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── styles.css
└── assets/
```

---

## 3️⃣ Load Extension in Chrome

1. Open Chrome
2. Go to:

```
chrome://extensions
```

3. Turn on **Developer Mode** (top right)
4. Click **Load unpacked**
5. Select your `where-was-that` project folder

Done ✅

Your extension should now appear in the toolbar.

---

# 📌 How To Use The Extension

### 🔹 Add a Pin

* Click the extension icon
* Use your “Add Pin” button
* Click anywhere on the page
* Pin gets placed

---

### 🔹 View Saved Pins

* Click the extension icon
* Open saved pins panel
* Click a saved pin to scroll to it

---

### 🔹 Keyboard Shortcuts (Example)

You can configure shortcuts in:

```
chrome://extensions/shortcuts
```

Suggested:

| Action    | Windows/Linux    | Mac             |
| --------- | ---------------- | --------------- |
| Add Pin   | Ctrl + Shift + P | Cmd + Shift + P |
| Show Pins | Ctrl + Shift + O | Cmd + Shift + O |

---

# 🧠 How It Works

* `content.js` injects UI & handles pin placement
* Pins are positioned using absolute positioning
* Coordinates are stored (likely using `chrome.storage`)
* Pins are re-rendered on page reload

---

# 🔄 Updating the Extension

After making changes:

1. Go to `chrome://extensions`
2. Click **Reload** on your extension
3. Refresh your test page

---

# 🏗 Future Improvements

* Drag to reposition pins
* Rename pins
* Color-coded pins
* Per-domain pin grouping
* Export / import pins
* Smooth scroll to pin
* Animation effects (bounce, pulse, etc.)


