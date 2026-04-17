"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { vly } from "../lib/vly-integrations";

function checkVlyKey(): string | null {
  const key = process.env.VLY_INTEGRATION_KEY;
  if (!key || key.trim().length === 0) {
    return "VLY_INTEGRATION_KEY is not configured. Please set it in the API Keys → Backend tab.";
  }
  return null;
}

export const enhanceEventDescription = action({
  args: {
    description: v.string(),
  },
  handler: async (_ctx, args) => {
    const keyError = checkVlyKey();
    if (keyError) {
      return { success: false, enhanced: null, error: keyError };
    }

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
      const errorMsg = result.error || "No response from AI";
      console.error("[AI Enhance] API returned error:", errorMsg);
      return { success: false, enhanced: null, error: errorMsg.includes("Invalid token") ? "AI integration key is invalid or expired. Please check VLY_INTEGRATION_KEY in API Keys → Backend." : errorMsg };
    } catch (err: any) {
      console.error("[AI Enhance] Error:", err);
      const msg = err?.message || "AI enhancement failed";
      return { success: false, enhanced: null, error: msg.includes("Invalid token") ? "AI integration key is invalid or expired. Please check VLY_INTEGRATION_KEY in API Keys → Backend." : msg };
    }
  },
});

export const generateEventImageUrl = action({
  args: {
    eventName: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      // Try AI to get a keyword, but fall back gracefully if AI is unavailable
      let keyword = "event";
      const keyError = checkVlyKey();

      if (!keyError) {
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

          if (result.success && result.data) {
            const content = result.data.choices[0]?.message?.content?.trim();
            if (content) {
              keyword = content.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "event";
            }
          }
        } catch {
          // AI unavailable, use event name as keyword
          keyword = args.eventName.split(/\s+/).slice(0, 2).join(" ").toLowerCase() || "event";
        }
      } else {
        // No AI key, derive keyword from event name
        keyword = args.eventName.split(/\s+/).slice(0, 2).join(" ").toLowerCase() || "event";
      }

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