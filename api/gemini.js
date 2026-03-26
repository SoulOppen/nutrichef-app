export default async function handler(req, res) {
  try {
    console.log("ENV KEY:", process.env.GEMINI_API_KEY ? "OK" : "MISSING");

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    if (!req.body) {
      return res.status(400).json({ error: "No body provided" });
    }

    console.log("BODY:", JSON.stringify(req.body));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const text = await response.text(); // 👈 IMPORTANTE

    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini error",
        raw: data,
      });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("SERVER CRASH:", error);
    res.status(500).json({ error: error.message });
  }
}