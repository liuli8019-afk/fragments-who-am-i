# Changelog

**English** | [简体中文](CHANGELOG.zh.md)

This is a single-file project without strict semantic versioning; entries are recorded by date. Roughly follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## 2026-08-09

### Changed
- Default UI language changed from Chinese to English: the app now opens in English on first load, and `<html lang>` / the page title follow suit. You can still switch back to Chinese via the button in the top-right corner; existing data is unaffected.
- Added project documentation: `LICENSE` (MIT), `PRIVACY.md` (privacy notes), `CHANGELOG.md` (this file), and `config.example.js` (an API config reference — not loaded automatically).
- Added a Chinese translation of every doc (`README.zh.md`, `PRIVACY.zh.md`, `CHANGELOG.zh.md`), each cross-linked with its English counterpart.
- Swapped which language each doc defaults to: `README.md` / `PRIVACY.md` / `CHANGELOG.md` are now the English versions (so the repo's homepage on GitHub renders in English by default), with the Chinese translation living at the `.zh.md` suffix.
- Added an opening tagline — "One HTML file. Minimal by design." — as the first line of the README, right under the title.

### Added
- A one-time "Before you start" card on first launch: the generated words are a pattern description and not a diagnosis, all data stays on this device, and if you've been struggling lately, please talk to someone you trust. Shown once per browser (tracked via a `seenIntro` flag), never again after it's dismissed.
- A permanently visible, low-contrast note under the deep-construct word cloud, repeating the same "not a diagnosis / local data / talk to someone" message so it's not gated behind the 8-memory reveal easter egg.
- A "not a medical device" bullet in the README disclaimer, and a matching line in the app's own Settings → Boundaries list.
- Reframed the deep-map tagline from "a more clinical lens" to "a descriptive lens borrowed from psychology vocabulary — not a clinical assessment," and added an explicit "what this is / isn't" line right under the README's opening tagline, to keep the project's own claims from reading as a medical or diagnostic product.

### Changed
- The first-launch card is now always bilingual — English on top, Chinese below with a divider — regardless of the app's current UI language, instead of only showing whichever language was active.
- README opening tagline expanded: "One HTML file. Minimal by design. Made for fun and personal journaling — if it happens to help, great, but it is absolutely not a professional diagnosis."
- The "Deeper psychological constructs" feature bullet now reads "Deeper psychological constructs, for reference," to underline that it's a reference, not a finding.
- Deep-cloud footnote now also suggests seeking professional support, not just talking to someone you trust.

### Fixed
- Fixed the just-submitted analysis card frequently showing Chinese words even with the UI set to English. Root cause: when the model skipped the optional `en` translation field for a brand-new word, `mergeProfile` fell back to the Chinese keyword, and the reply card had frozen its labels at submit time — so it never picked up the correction that `ensureTranslations()` would otherwise backfill. Fixed by (1) deriving the reply card's word chips live from `D.surface` / `D.deep` instead of a frozen snapshot, so they update automatically once a translation arrives, and (2) calling `ensureTranslations()` immediately after every submit instead of only at boot or on a language toggle.
- Strengthened the prompt's language instruction: it's now stated up front, bilingually, and explicitly says to ignore both the prompt's own language and the language of the user's input — models were sometimes drifting toward Chinese for the `reply`/`event`/`evidence` fields even when English was requested.

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
