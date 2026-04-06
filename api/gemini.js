// ── Rate limit simple por IP (in-memory, se resetea con cada cold start) ────
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 15;              // máx requests por ventana
const ipHits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// ── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("CONFIG ERROR: GEMINI_API_KEY not set");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // Rate limit por IP
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
             || req.socket?.remoteAddress
             || "unknown";

    if (isRateLimited(ip)) {
      return res.status(429).json({ error: "Demasiadas solicitudes. Intenta en un momento." });
    }

    const { payload } = req.body || {};

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Missing or invalid payload" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GEMINI ERROR:", JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API error",
        raw: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
