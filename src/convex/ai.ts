"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { vly } from "../lib/vly-integrations";

export const enhanceEventDescription = action({
  args: {
    description: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      const result = await vly.ai.completion({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert event copywriter. Rewrite the given event description to be more engaging, well-structured, and professional. Use short paragraphs and bullet points where appropriate. Keep it concise but informative. Do NOT add any markdown headers or code blocks — just clean formatted text with line breaks and bullet points (using • character). Keep the tone enthusiastic but professional. Do not invent details that aren't in the original.`,
          },
          {
            role: "user",
            content: `Please enhance this event description:\n\n${args.description}`,
          },
        ],
        maxTokens: 500,
        temperature: 0.7,
      });

      if (result.success && result.data) {
        const enhanced = result.data.choices[0]?.message?.content;
        if (enhanced) {
          return { success: true, enhanced };
        }
      }
      return { success: false, enhanced: null, error: result.error || "No response from AI" };
    } catch (err: any) {
      console.error("[AI Enhance] Error:", err);
      return { success: false, enhanced: null, error: err?.message || "AI enhancement failed" };
    }
  },
});

export const generateEventImageUrl = action({
  args: {
    eventName: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      const result = await vly.ai.completion({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helper that generates a single short search keyword (1-2 words) for finding a relevant stock photo for an event. Only respond with the keyword, nothing else. Examples: "hackathon" → "coding", "sports meet" → "athletics", "cultural fest" → "festival", "workshop" → "workshop classroom", "seminar" → "conference".`,
          },
          {
            role: "user",
            content: args.eventName,
          },
        ],
        maxTokens: 20,
        temperature: 0.5,
      });

      let keyword = "event";
      if (result.success && result.data) {
        const content = result.data.choices[0]?.message?.content?.trim();
        if (content) {
          keyword = content.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "event";
        }
      }

      // Use Unsplash source for a deterministic, high-quality image
      const imageUrl = `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop&q=80`;
      // Use picsum for a random but consistent image based on the keyword hash
      const hash = Array.from(keyword).reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const picsumUrl = `https://picsum.photos/seed/${encodeURIComponent(keyword + hash)}/800/400`;

      return { success: true, imageUrl: picsumUrl, keyword };
    } catch (err: any) {
      console.error("[AI Image] Error:", err);
      return { success: false, imageUrl: null, error: err?.message || "Failed to generate image" };
    }
  },
});