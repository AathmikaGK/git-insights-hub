const parseModalities = () => {
  const raw = process.env.NANO_BANANA_RESPONSE_MODALITIES;
  if (!raw) return ["TEXT", "IMAGE"];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
};

const toDataUrl = (mimeType: string, base64: string) => `data:${mimeType};base64,${base64}`;

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

  const responseModalities = parseModalities();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities,
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

    const videoInline = parts.find(
      (p: any) => p?.inlineData?.data && String(p?.inlineData?.mimeType || "").startsWith("video/"),
    );

    if (videoInline?.inlineData?.data) {
      return res.status(200).json({
        mediaType: "video",
        mediaDataUrl: toDataUrl(videoInline.inlineData.mimeType, videoInline.inlineData.data),
      });
    }

    const imageInline = parts.find(
      (p: any) => p?.inlineData?.data && String(p?.inlineData?.mimeType || "").startsWith("image/"),
    );

    if (imageInline?.inlineData?.data) {
      return res.status(200).json({
        mediaType: "image",
        mediaDataUrl: toDataUrl(imageInline.inlineData.mimeType, imageInline.inlineData.data),
        warning:
          "Endpoint did not return video. Showing generated image instead. Configure NANO_BANANA_API_URL + NANO_BANANA_RESPONSE_MODALITIES for a video-capable model.",
      });
    }

    return res.status(502).json({
      error:
        "No playable media returned from Nano Banana. If you need video, configure a video-capable endpoint in NANO_BANANA_API_URL and response modalities in NANO_BANANA_RESPONSE_MODALITIES.",
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown server error" });
  }
}
