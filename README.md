# SmoothActions

SmoothActions is a lightweight Chrome extension that provides one-click automations for repetitive web tasks.

## Features

- **Copy All Code Blocks** — Extract and copy all visible code blocks from the current page.
- **Copy Visible Text** — Copy the visible page text to the clipboard.
- **Extract Page Links** — Gather all link URLs from the current page and copy them.
- **Toggle Focus Mode** — Dim distractions on the page and enable a minimal focus overlay.
- **Read Page Aloud** — Use the browser speech synthesis API to read visible page content.
- **Clean URL** — Remove query parameters from the current page URL and copy the cleaned link.
- **Auto Scroll** — Auto-scroll the current page with tap-based speed control and stop after four clicks.
- **Download Images** — Download all images found on the current page.

## Installation

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `smoothactions-extension` folder.

## Usage

1. Click the SmoothActions toolbar icon to open the popup.
2. Choose any action button to run the corresponding automation on the active tab.
3. For auto scroll:
   - 1 click = slow
   - 2 clicks = medium
   - 3 clicks = fast
   - 4 clicks = stop scrolling

## Settings

The extension uses Chrome storage to preserve settings such as:

- `scrollSpeed`
- `tapControl`
- `zipImages`

These are available through the extension settings UI.

## Files

- `manifest.json` — Extension manifest configuration.
- `popup.html` — Popup UI layout.
- `popup.css` — Popup styling.
- `popup.js` — Popup action handling logic.
- `background.js` — Background service worker.
- `content.js` — Content script injected into pages.
- `copycode.js` — Code block extraction helper.
- `settings.js` — Settings page logic.
- `icons/` — Extension icons.

## Permissions

The extension requires the following permissions:

- `tabs`
- `scripting`
- `activeTab`
- `storage`
- `downloads`
- `host_permissions` for `<all_urls>`

## License

This project is provided as-is. Update the license section as needed.
