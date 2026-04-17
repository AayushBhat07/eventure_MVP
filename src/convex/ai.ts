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
