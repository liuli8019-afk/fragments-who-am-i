// Vercel serverless function. Proxies analysis requests to Anthropic's
// Messages API using a server-side API key — the key never reaches the
// browser and never appears in the git history.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing 'prompt' in request body" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is not configured with an API key" });
    return;
  }

  let upstream;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch {
    res.status(502).json({ error: "Could not reach the analysis service." });
    return;
  }

  const data = await upstream.json();

  if (!upstream.ok) {
    // Surface a readable message without leaking the key or the full upstream body.
    res.status(upstream.status).json({
      error: data?.error?.message || "The analysis service returned an error.",
    });
    return;
  }

  res.status(200).json(data);
}
