export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.NANO_BANANA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NANO_BANANA_API_KEY is not configured" });
  }

  const prompt = req.body?.prompt;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  const endpoint =
    process.env.NANO_BANANA_API_URL ??
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["VIDEO", "TEXT"],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || `Nano Banana API error: ${response.status}`,
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const videoPart = parts.find((p: any) => p?.inlineData?.data && String(p?.inlineData?.mimeType || "").startsWith("video/"));

    if (!videoPart?.inlineData?.data) {
      return res.status(502).json({ error: "No video returned from Nano Banana" });
    }

    return res.status(200).json({
      videoDataUrl: `data:${videoPart.inlineData.mimeType};base64,${videoPart.inlineData.data}`,
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown server error" });
  }
}
