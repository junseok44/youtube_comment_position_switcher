# YouTube Comment Position Switcher

A Chrome extension that allows you to switch the position of comments and related videos on YouTube for a better viewing experience.

## Features

- Switch between comments and related videos positions on YouTube video pages
- Maintain a fixed height for the comments section with scrollable content
- Convenient interface to view both video and comments simultaneously
- Persistent state across page refreshes and navigation
- Works only on YouTube video pages

## Installation for Development

1. Open `chrome://extensions/` in your Chrome browser
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this project's folder

## How to Use

1. Navigate to any YouTube video page (URL containing `/watch?v=`)
2. Click the extension icon in your browser toolbar
3. Toggle the switch to change the position of comments and related videos
4. Your preference will be saved and automatically applied to other video pages

## Notes

- This extension works based on YouTube's DOM structure
- It may not work if YouTube changes its layout
- The extension only activates on video pages, not on the main page or other YouTube pages
