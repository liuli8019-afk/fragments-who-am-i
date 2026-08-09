# Changelog

**English** | [简体中文](CHANGELOG.md)

This is a single-file project without strict semantic versioning; entries are recorded by date. Roughly follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## 2026-08-09

### Changed
- Default UI language changed from Chinese to English: the app now opens in English on first load, and `<html lang>` / the page title follow suit. You can still switch back to Chinese via the button in the top-right corner; existing data is unaffected.
- Added project documentation: `LICENSE` (MIT), `PRIVACY.md` / `PRIVACY.en.md` (privacy notes), `CHANGELOG.md` / `CHANGELOG.en.md` (this file), and `config.example.js` (an API config reference — not loaded automatically).
- Added English versions of every doc (`README.en.md`, `PRIVACY.en.md`, `CHANGELOG.en.md`), each cross-linked with its Chinese counterpart.

## 2026-08-08

### Changed
- Rewrote navigation: replaced a handful of loose state variables (`view` / `origin` / `listFilter` / `openId` / `darkFlow`) with a single navigation stack (`push` / `pop` / `frame`), fixing some edge cases in back-navigation.
- Provider names, protocol labels, CORS-relay notes, and API error messages are now fully localized instead of staying Chinese-only when the UI is switched to English.
- Added a safeguard (`fixSurfaceWord` / `fixDeepTerm`) against the model occasionally swapping the bilingual fields for surface words and deep constructs, with a one-time migration for previously stored data.
- Surface word count relaxed from "always exactly 10" to 3–10 — the app no longer forces the model to pad out a list when there isn't enough material.
- Enter now sends the message (Shift+Enter for a newline), while correctly handling IME composition and touch keyboards so composing Chinese text or typing on a soft keyboard doesn't accidentally trigger a send.

### Fixed
- Fixed the word cloud occasionally picking up words like "remembers clearly" or "articulate" — traits that describe the act of narrating today, not the person inside the story back then. The prompt now explicitly distinguishes the two and only keeps traits belonging to the person in the story.

## 2026-08-08 (migration)

### Changed
- Migrated the project from Vite + React + Tailwind + a server-side `api/analyze.js` proxy to a single-file static site (`index.html`) with no build step and no server.
- AI calls now go directly from the browser to whichever provider you configure in settings, instead of through any server we control; server-side environment variables like `ANTHROPIC_API_KEY` are no longer needed.
- Removed `src/`, `api/`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `package.json`, `package-lock.json`, and other build-time files.
