
# Where Was That

A lightweight Chrome extension that lets you **drop visual pins on any webpage** and save their positions so you never lose where something was again.

Perfect for:

* Remembering important sections
* Marking bugs while testing
* Saving references while reading
* Annotating long pages visually

---

## Features

*  Add pins anywhere on a webpage
*  Click-to-place system
*  Pins stored per page
*  View saved pins
*  Keyboard shortcuts support
*  Lightweight & fast

---

# How To Use Locally (Development Setup)

This project is a Chrome extension and must be loaded manually in development mode.

Follow these steps:

---

## Clone the repository

```bash
https://github.com/hamzatahir9091/where-was-that.git
cd where-was-that
```

Or if already cloned:

```bash
git pull origin main
```

---

## Make Sure You Have These Files

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

## Load Extension in Chrome

1. Open Chrome
2. Go to:

```
chrome://extensions
```

3. Turn on **Developer Mode** (top right)
4. Click **Load unpacked**
5. Select your `where-was-that` project folder

Your extension should now appear in the toolbar.

---


# How It Works

* `content.js` handles UI & pin placement
* Pins are positioned using absolute positioning
* Coordinates are stored using Chrome's storage APIs
* Pins are re-rendered on page reload

---

Contributions are welcome and appreciated. If you would like to improve this project, feel free to fork the repository and submit a pull request.
