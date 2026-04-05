import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminAuth() {
  if (!getApps().length) {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      throw new Error("Missing Firebase Admin credentials");
    }

    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  return getAuth();
}

export default async function handler(req, res) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Authorization bearer token" });
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return res.status(401).json({ error: "Missing Firebase ID token" });
    }

    try {
      await getFirebaseAdminAuth().verifyIdToken(token);
    } catch (error) {
      console.error("AUTH ERROR:", error);
      return res.status(401).json({ error: "Invalid or expired Firebase ID token" });
    }

    // El cliente ya envÃ­a el body en formato Gemini vÃ¡lido dentro de `payload`.
    // Solo lo re-enviamos tal cual, sin re-envolver.
    const { payload } = req.body || {};

    if (!payload) {
      return res.status(400).json({ error: "Missing payload" });
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
        error: data.error?.message,
        raw: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
