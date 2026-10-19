import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoints for container and Cloud Run probes
  app.get(["/health", "/healthz", "/api/health"], (_req, res) => {
    res.status(200).json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Content Enhancer Endpoint using Gemini API
  app.post("/api/ai/enhance", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Gemini API Key is not configured. Please add GEMINI_API_KEY in secrets.",
        });
      }

      const { prompt, taskType, currentContent } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const ai = new GoogleGenAI({ apiKey });

      let systemInstruction = "You are an expert resume writer, career advisor, and biodata expert.";
      if (taskType === "summary") {
        systemInstruction = "You are a professional executive resume writer. Re-write or improve the user's career objective or executive summary to sound persuasive, concise, impact-driven, and active. Return ONLY the enhanced text without markdown headers, intro conversational filler, or commentary.";
      } else if (taskType === "bullet") {
        systemInstruction = "You are a top tech recruiter. Improve the user's work experience bullet points. Use strong action verbs, quantifiable achievements, and professional vocabulary. Return ONLY the bullet points or text list without intro filler.";
      } else if (taskType === "biodata") {
        systemInstruction = "You are a traditional and modern marital biodata specialist. Craft or refine a polite, respectable, warm, and well-phrased personal description / family background intro for a marital biodata. Return ONLY the enhanced text.";
      } else if (taskType === "skills") {
        systemInstruction = "You are a technical career coach. Suggest organized, high-impact key skills or categorize skills logically for the user's domain. Return ONLY the enhanced skill items as concise comma-separated or clean list items.";
      }

      const fullPrompt = `${systemInstruction}\n\nCurrent Draft/Content: "${currentContent || ""}"\nUser Instructions: "${prompt}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
      });

      const enhancedText = response.text ? response.text.trim() : "";

      res.json({ result: enhancedText });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({
        error: error?.message || "Failed to generate AI response. Please try again.",
      });
    }
  });

  // Vite development middleware or static production fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
