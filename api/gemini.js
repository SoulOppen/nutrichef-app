export default async function handler(req, res) {
  try {
    const { kind, payload } = req.body;

    let url = "";
    
    if (kind === "text") {
      url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
    } else if (kind === "vision") {
      url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent";
    }

    const response = await fetch(`${url}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Error Gemini" });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("Error API Gemini:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}