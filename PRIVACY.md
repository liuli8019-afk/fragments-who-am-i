# Privacy Notes

**English** | [简体中文](PRIVACY.zh.md)

Fragments — Who Am I? is a single file (`index.html`). There's no backend, no account system, no server we run ourselves. This document explains exactly where your data goes.

## Where your data lives

- Every memory you write, the surface words / deep constructs AI extracts from them, and the connection settings you fill in on the settings page — all of it lives in `localStorage`, on **this device, in this browser**.
- No account, no login, no cloud sync — close the browser, clear `localStorage`, or switch devices, and the data is gone. To move it, use **Export JSON** on the settings page, then **Import JSON** on the new device.
- We (the project's author) have no access to any of your data. No server is collecting it, and there's no tracking, analytics, or telemetry script.

## Where your data goes during AI analysis

When you submit a memory, that text is assembled into a prompt and **sent directly from your browser** to whichever model provider you selected in settings (e.g. Anthropic, OpenAI, Google, or a local Ollama instance you're running).

- The request doesn't pass through any server of ours — we don't have one for it to pass through.
- Whether it goes through a third-party CORS relay depends on whether your chosen provider allows direct browser calls; the settings page notes this for each provider. If you configure your own relay, that text passes through your relay — you're responsible for how much you trust that service.
- Choosing a local model (Ollama / LM Studio) keeps the text on your device entirely.

This step can't be avoided — semantic analysis needs an actual large language model, which a browser can't run locally. Which provider you use, and whether you go online at all, is entirely your call.

## About your API key

- The key is stored only in this device's browser `localStorage`, in plain text (a general limitation of browser local storage, not specific to this project). Don't leave a key sitting on a shared or physically accessible computer.
- The key is never written into any file, and never uploaded anywhere by this project.
- An exported JSON archive **includes** your key (the whole `settings` object is exported, so switching devices carries everything over in one go). Treat exported archive files as sensitive — don't send them to anyone, don't post them anywhere public, and don't commit them to a repository.
- The `index.html` published in this repository doesn't contain any key. Neither does `config.example.js` — it's a reference document, not a real config.

## Why open source

"We don't upload your data" is a claim with no way to verify when the source is closed. Open source — and being a single file — is the only way anyone can actually check for themselves.

## What you can do

- Want to stay fully offline: configure a local Ollama or LM Studio and never go online.
- Want to erase everything: the settings page has "Erase everything," which clears memories and word clouds but keeps your connection settings (so you don't have to reconfigure a provider after wiping); the connection settings themselves can also be overwritten or cleared separately.
- Want to verify what the code does: `index.html` is the entire logic, with no build artifact, no minification or obfuscation — search for keywords like `fetch(` or `localStorage` and you can see exactly where data flows.

## Disclaimer

This project is not responsible for the privacy policy or data handling of whatever third-party AI provider or CORS relay you choose to use — that's between you and that provider. Please read their terms yourself.
