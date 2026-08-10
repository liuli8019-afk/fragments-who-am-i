# Fragments — Who Am I?

**English** | [简体中文](README.zh.md)

One HTML file. Minimal by design. Made for fun and personal journaling — if it happens to help, great, but it is absolutely not a professional diagnosis.

**What this is:** a tool for organizing personal narratives — turning scattered memories into two word clouds. **What this isn't:** a psychological test, a diagnosis, or a medical device.

Your identity is made of countless fragments. Most people never assemble the full picture.

Slowly, through remembering,
weaving every episode of your life back together,
you find out how you were shaped.

> Your memories shape who you are.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-Beta-blue)
![Language](https://img.shields.io/badge/Language-JavaScript-F7DF1E)
![No Build](https://img.shields.io/badge/Build%20Step-None-lightgrey)

An exploration tool that uses AI to analyze fragments of your life and reconstruct a picture of your identity. The entire project is a single HTML file — no build step, no server.

Record whatever you happen to remember, and AI turns each piece into:
- Plain, everyday personality keywords
- Deeper psychological constructs, for reference

As memories accumulate, a truer picture of yourself gradually comes into view.

---

## 🎯 The Problem

Most people live in the present without knowing how their identity was shaped by the past.

Who we are was shaped by countless past events, but forgetting and avoidance bury the key moments. The result: we can't see a complete, honest picture of ourselves.

Traditional personality tests ask "what do you think you are right now" — and the answer you give usually reflects "what you wish you were," not what you actually are.

Fragments doesn't ask you anything. It only records your story, and lets AI extract traits from the story itself.

---

## ✨ What Makes It Different

| | Fragments | Traditional Personality Tests |
|---|----------|---------|
| Data source | Things that actually happened to you | Things you think you'd do |
| Basis | Primary evidence (life traces) | Subjective choices in the moment |
| Time span | Accumulated, long-term observation | A static snapshot |
| Result tends toward | A more honest picture | A more idealized picture |
| Susceptible to expectations | Less | More |

---

## 📁 Project Structure

```
Fragments/
│
├── index.html              # The app — this one file is the entire thing
│
├── README.md               # Project intro (English, this file)
├── README.zh.md            # Project intro (Chinese)
│
├── LICENSE                  # MIT license
│
├── .gitignore               # Git ignore rules
│
├── config.example.js        # API config reference (bilingual comments, not loaded at runtime)
│
├── PRIVACY.md                # Privacy notes (English)
├── PRIVACY.zh.md              # Privacy notes (Chinese)
│
├── CHANGELOG.md               # Changelog (English)
└── CHANGELOG.zh.md             # Changelog (Chinese)
```

No `src/`, no `api/`, no `package.json` — `index.html` is the whole codebase, short enough to read end to end.

---

## 🚀 How To Use It

### Three steps to see yourself

1. **Record** — Remembered something from the past? Write it down (Chinese and English both work).
2. **AI analysis** — The system extracts traits from your actual story.
3. **See yourself** — Two layers of self-portrait get built up over time.

### What you get

**📊 Surface trait map**
See your personality at a glance
- Plain keyword tags: "brave," "cautious," "persistent," and so on
- The more often a word recurs, the larger it renders in the word cloud, showing your most common patterns at a glance

**🧠 Deep psychological map**
A descriptive lens borrowed from psychology vocabulary — not a clinical assessment
- Descriptive constructs drawn from attachment theory, trauma psychology, cognitive-behavioral theory, and related fields
- Helps you understand your deeper motivations and patterns; once you've logged enough memories, a long-press on the word cloud unlocks a row of "directions worth paying attention to" (explicitly labeled as not a diagnosis)

---

## 📋 Features

- ✅ Text input (Chinese and English both supported; UI defaults to English, one click to switch to Chinese)
- ✅ Real-time AI analysis
- ✅ Two-layer visualization (surface traits + deep constructs)
- ✅ Traceability (click any word in the cloud to see which memories it came from)
- ✅ Memory list and detail view
- ✅ Data export / import (JSON)
- ✅ Bilingual UI — surface words merge by their Chinese keyword, deep constructs merge by their English term, so switching languages never splits the same word into two entries
- ✅ Voice input (where the browser supports the Web Speech API)
- ✅ Crisis-signal detection: when self-harm / suicide signals are detected, analysis is skipped and only a caring message is shown

---

## 🔧 Quick Start

This is a single-file project. Nothing to install, nothing to build.

1. Download `index.html` (or grab it from a clone of this repo)
2. Double-click to open it — your browser runs it directly as a web page
3. **Press and hold the title on the home screen for 1.2 seconds** to open the hidden settings page, pick a provider, and paste in your own API key (Anthropic Claude / OpenAI / Google Gemini / OpenRouter / Groq / DeepSeek / Moonshot Kimi / Zhipu GLM / Alibaba Qwen / SiliconFlow / local Ollama / local LM Studio / any custom endpoint)
4. All data lives in your browser's local storage (`localStorage`) — nothing passes through any server we run

You can export all your data as JSON from the settings page; if you switch devices or lose the file, import it back the same way.

### Running from source

```bash
git clone https://github.com/liuli8019-afk/fragments-who-am-i.git
cd fragments-who-am-i
# No npm install needed — just open it
open index.html          # macOS
# Or serve it statically (optional; opening it locally is already enough)
python3 -m http.server
```

Deploying it publicly works the same way: GitHub Pages, Vercel (static hosting), Netlify, or any static file host — just publish `index.html`, no build command involved.

---

## 🔐 Privacy & Data

- No account, no login — fully anonymous
- Local storage — all memory data lives in your browser's `localStorage`
- No tracking, no analytics — we don't collect any usage data, because there's no server to collect it on
- Export anytime — your full data set can be exported as JSON

Memory content is sent to whichever AI provider you configure in settings (e.g. Anthropic, OpenAI, Google) for analysis — that step is unavoidable, since this kind of semantic analysis can't be done locally in the browser. The request is sent **directly from your browser**, never through a server we operate. If you want to stay fully offline, configure a local Ollama or LM Studio instead.

Full details in [PRIVACY.md](PRIVACY.md) ([中文](PRIVACY.zh.md)).

### Why open source

This is a tool that holds private memories. "We don't upload your data" is a claim with no way to verify if the source is closed. Open source is the only way anyone can actually check — and being a single file makes it especially easy: it's one file, anyone can read the whole thing.

---

## 🎯 Who It's For

### ✅ Best suited for

- People in therapy who want to turn scattered memories into material they can actually discuss
- Writers, journal-keepers, and anyone doing long-term self-reflection
- People trying to understand where their behavioral patterns come from
- Anyone who wants an honest self-picture rather than an idealized self-assessment

### ⚠️ Not suited for

- Medical diagnosis or psychological treatment (it is neither)
- People looking for quick, simple personality labels
- People unwilling to reflect deeply on themselves

---

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript, no framework, no build step — the whole app is one `.html` file
- **Voice input**: Web Speech API (browser-native; the mic button only appears where it's supported)
- **AI analysis**: Configured by you in settings — Anthropic Claude / OpenAI / Google Gemini / OpenRouter / Groq / DeepSeek / Moonshot Kimi / Zhipu GLM / Alibaba Qwen / SiliconFlow / local Ollama / local LM Studio / any OpenAI-compatible or Anthropic-compatible endpoint
- **Data storage**: Browser `localStorage`
- **Deployment**: Optional — GitHub Pages / Vercel (static) / Netlify (static) / any static file host, or just double-click the local file

---

## 📝 Configuration

### Setting your API key

Press and hold the home screen title (shows "Who am I?" in English by default, "我是谁?" once switched to Chinese) for 1.2 seconds to open the hidden settings page, where you pick a provider, paste your key, and choose a model.

`config.example.js` is a reference for those settings (provider list, field descriptions) — it is **not** loaded by `index.html` at runtime; it's just there for you to skim before filling out the settings page. Don't put a real key in that file and commit it.

Among the supported providers, Anthropic / Gemini / OpenRouter usually allow direct browser calls; OpenAI / Groq / SiliconFlow may or may not, and need a CORS relay configured if they fail; DeepSeek / Moonshot Kimi / Zhipu / Qwen's official endpoints don't allow direct browser calls at all and require a CORS relay — the settings page shows a note for each provider.

---

## 🐛 Known Issues

- [ ] The deep-construct word cloud can skew toward negative-sounding terms (the psychological-construct vocabulary itself has richer coverage of negative patterns)
- [ ] Automatic sync across browsers/devices isn't supported yet — use manual export/import
- [ ] Voice input depends on how well the browser supports the Web Speech API; unavailable in some browsers/systems

These are product-level improvement areas, not blocking bugs.

---

## 🤝 Contributing

Issues and pull requests are welcome! Since this is a single-file project, it helps to drop your idea in an issue first, so two people don't end up reworking the same piece of logic.

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

You're free to use, modify, and distribute this project, as long as you keep the original license notice.

---

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) ([中文](CHANGELOG.zh.md)).

---

## 🙏 Acknowledgements

- Thanks to the open source community

---

## ⚠️ Disclaimer

You must use your own API for AI analysis; any costs incurred are yours, not the project's or the developer's.

- **This project is not a medical device.** It does not provide, and is not intended to provide, medical diagnosis, psychological assessment, or treatment of any kind, in any jurisdiction.
- AI-generated content does not constitute a professional psychological diagnosis, medical judgment, or treatment recommendation.
- The analysis reflects a possible interpretation based on your input, not a definitive conclusion about your psychological state.
- A person's character and psychology are complex; a single event or a limited set of memories can't fully define who someone is.
- If you're dealing with ongoing, serious psychological distress, please seek help from a qualified therapist or medical professional.

Hopefully this can help you:
- Re-understand past experiences
- Notice hidden behavioral patterns
- See the parts of yourself that used to go unnoticed

Your story is yours to define.
AI is just here to help you look at it again.

---

Like a lot of people with zero coding background, I rely on AI to put my ideas into words. I spent more than a decade of my life feeling lost — those years slipped away like water, and looking back now, they feel like a blank page. This is my first coding project. I sincerely welcome any honest feedback, and I hope it — or at least the idea behind it — can bring a little help to someone.

---

*Fragments — Who Am I? — using AI to analyze fragments of a life and explore the structure that shaped it.*
