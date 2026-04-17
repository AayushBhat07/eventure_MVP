"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { internal } from "./_generated/api";

function getGeminiModel() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

function getApiKey(): string | null {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }
  return apiKey.trim();
}

/**
 * Generate a doodle-style illustration using Imagen API with Gemini API key.
 * Returns base64-encoded PNG image data, or null on failure.
 */
async function generateDoodleImage(eventName: string): Promise<{ base64: string; mimeType: string } | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const prompt = `A fun, colorful doodle-style illustration representing "${eventName}". Hand-drawn sketch style with vibrant colors, simple shapes, and playful elements. White background, clean and modern doodle art.`;

  try {
    // Try Imagen 3.0 predict endpoint first
    const imagenResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" },
        }),
      }
    );

    if (imagenResp.ok) {
      const data = await imagenResp.json();
      const predictions = data.predictions;
      if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
        return { base64: predictions[0].bytesBase64Encoded, mimeType: "image/png" };
      }
    }

    // Fallback: Try Gemini 2.0 Flash with image output via generateContent
    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      }
    );

    if (geminiResp.ok) {
      const data = await geminiResp.json();
      const candidates = data.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              return {
                base64: part.inlineData.data,
                mimeType: part.inlineData.mimeType || "image/png",
              };
            }
          }
        }
      }
    }

    // If both fail, log the errors
    const imagenText = !imagenResp.ok ? await imagenResp.text().catch(() => "") : "";
    const geminiText = !geminiResp.ok ? await geminiResp.text().catch(() => "") : "";
    console.error("[Image Gen] Imagen status:", imagenResp.status, imagenText.substring(0, 200));
    console.error("[Image Gen] Gemini status:", geminiResp.status, geminiText.substring(0, 200));

    return null;
  } catch (err) {
    console.error("[Image Gen] Error:", err);
    return null;
  }
}

/**
 * Fallback: fetch a relevant image from Unsplash search
 */
async function fetchUnsplashImageUrl(keyword: string): Promise<string> {
  try {
    const resp = await fetch(
      `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(keyword)}&per_page=3`,
      { headers: { Accept: "application/json" } }
    );
    if (resp.ok) {
      const data = await resp.json();
      if (data.results && data.results.length > 0) {
        const idx = Math.floor(Math.random() * Math.min(3, data.results.length));
        const photo = data.results[idx];
        const rawUrl = photo.urls?.raw;
        if (rawUrl) {
          return `${rawUrl}&w=800&h=400&fit=crop&q=80`;
        }
        return photo.urls?.regular || photo.urls?.small || "";
      }
    }
  } catch (err) {
    console.error("[Unsplash] Fetch error:", err);
  }
  return `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop&q=80`;
}

function deriveKeyword(eventName: string): string {
  return eventName.split(/\s+/).slice(0, 2).join(" ").toLowerCase() || "event";
}

export const enhanceEventDescription = action({
  args: {
    description: v.string(),
  },
  handler: async (_ctx, args) => {
    const model = getGeminiModel();
    if (!model) {
      return {
        success: false,
        enhanced: null,
        error: "GOOGLE_GEMINI_API_KEY is not configured. Please set it in the Integrations tab or API Keys → Backend.",
      };
    }

    try {
      const prompt = `You are an expert event copywriter. Rewrite the given event description to be more engaging, well-structured, and professional. Use short paragraphs and bullet points where appropriate. Keep it concise but informative. Do NOT add any markdown headers or code blocks — just clean formatted text with line breaks and bullet points (using • character). Keep the tone enthusiastic but professional. Do not invent details that aren't in the original.\n\nPlease enhance this event description:\n\n${args.description}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const enhanced = response.text();

      if (enhanced && enhanced.trim().length > 0) {
        return { success: true, enhanced: enhanced.trim() };
      }
      return { success: false, enhanced: null, error: "No response from AI" };
    } catch (err: any) {
      console.error("[AI Enhance] Error:", err);
      const msg = err?.message || "AI enhancement failed";
      return { success: false, enhanced: null, error: msg };
    }
  },
});

export const generateEventImageUrl = action({
  args: {
    eventName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Try Gemini image generation first
      const imageData = await generateDoodleImage(args.eventName);

      if (imageData) {
        // Store in Convex file storage
        const binaryData = Uint8Array.from(atob(imageData.base64), (c) => c.charCodeAt(0));
        const blob = new Blob([binaryData], { type: imageData.mimeType });
        const storageId = await ctx.storage.store(blob);
        const imageUrl = await ctx.storage.getUrl(storageId);

        if (imageUrl) {
          return { success: true, imageUrl, keyword: "gemini-generated" };
        }
      }

      // Fallback to Unsplash
      const keyword = deriveKeyword(args.eventName);
      const imageUrl = await fetchUnsplashImageUrl(keyword);
      return { success: true, imageUrl, keyword };
    } catch (err: any) {
      console.error("[AI Image] Error:", err);
      return { success: false, imageUrl: null, error: err?.message || "Failed to generate image" };
    }
  },
});

export const generateImagesForAllEvents = action({
  args: {
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const events = args.overwrite
      ? await ctx.runQuery(internal.events.getAllEventsForImageRegeneration)
      : await ctx.runQuery(internal.events.getEventsWithoutImage);

    if (events.length === 0) {
      return { success: true, message: "All events already have images", count: 0 };
    }

    let updated = 0;
    let aiGenerated = 0;

    for (const event of events) {
      try {
        // Try Gemini image generation
        const imageData = await generateDoodleImage(event.name);

        if (imageData) {
          const binaryData = Uint8Array.from(atob(imageData.base64), (c) => c.charCodeAt(0));
          const blob = new Blob([binaryData], { type: imageData.mimeType });
          const storageId = await ctx.storage.store(blob);
          const imageUrl = await ctx.storage.getUrl(storageId);

          if (imageUrl) {
            await ctx.runMutation(internal.events.setEventImageUrl, {
              eventId: event._id,
              imageUrl,
            });
            updated++;
            aiGenerated++;
            continue;
          }
        }

        // Fallback to Unsplash
        const keyword = deriveKeyword(event.name);
        const imageUrl = await fetchUnsplashImageUrl(keyword);
        await ctx.runMutation(internal.events.setEventImageUrl, {
          eventId: event._id,
          imageUrl,
        });
        updated++;
      } catch (err) {
        console.error(`[Image Gen] Failed for event "${event.name}":`, err);
        // Continue with next event
      }
    }

    return {
      success: true,
      message: `${args.overwrite ? "Regenerated" : "Generated"} images for ${updated} event${updated !== 1 ? "s" : ""} (${aiGenerated} AI-generated, ${updated - aiGenerated} from Unsplash)`,
      count: updated,
    };
  },
});

export const generateAndSetEventImage = internalAction({
  args: {
    eventId: v.id("events"),
    eventName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Try Gemini image generation
      const imageData = await generateDoodleImage(args.eventName);

      if (imageData) {
        const binaryData = Uint8Array.from(atob(imageData.base64), (c) => c.charCodeAt(0));
        const blob = new Blob([binaryData], { type: imageData.mimeType });
        const storageId = await ctx.storage.store(blob);
        const imageUrl = await ctx.storage.getUrl(storageId);

        if (imageUrl) {
          await ctx.runMutation(internal.events.setEventImageUrl, {
            eventId: args.eventId,
            imageUrl,
          });
          return;
        }
      }

      // Fallback to Unsplash
      const keyword = deriveKeyword(args.eventName);
      const imageUrl = await fetchUnsplashImageUrl(keyword);
      await ctx.runMutation(internal.events.setEventImageUrl, {
        eventId: args.eventId,
        imageUrl,
      });
    } catch (err) {
      console.error(`[Auto Image Gen] Failed for event "${args.eventName}":`, err);
    }
  },
});