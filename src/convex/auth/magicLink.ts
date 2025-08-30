 // @ts-nocheck
import { Email } from "@convex-dev/auth/providers/Email";
import { generateRandomString, alphabet } from "oslo/crypto";
import { createEmailProvider } from "./emailProvider";
import { internal } from "../_generated/api";

export const magicLink = Email({
  id: "magic-link",
  maxAge: 60 * 15, // 15 minutes
  
  // Generate a secure token for magic links
  generateVerificationToken() {
    return generateRandomString(32, alphabet("a-z", "A-Z", "0-9"));
  },
  
  async sendVerificationRequest({ identifier: email, provider, token, request }) {
    try {
      const ctxAny = (request as any)?.ctx;

      // Check rate limiting if context is available
      if (ctxAny?.runQuery) {
        const rateLimitCheck = await ctxAny.runQuery(internal.auth.rateLimit.checkRateLimit, {
          identifier: email,
          type: "magic_link",
        });

        if (!rateLimitCheck.isAllowed) {
          const resetTimeMinutes = Math.ceil((rateLimitCheck.resetTime - Date.now()) / (1000 * 60));
          throw new Error(
            `Too many magic link requests. Please try again in ${resetTimeMinutes} minutes. ` +
            `Remaining attempts: ${rateLimitCheck.remainingAttempts}`
          );
        }

        // Record the attempt as pending
        await ctxAny.runMutation(internal.auth.rateLimit.recordAttempt, {
          identifier: email,
          type: "magic_link",
          success: false,
        });
      }

      // Construct the magic link URL
      const urlStr = typeof request?.url === "string" ? request.url : "";
      let origin = "";
      try {
        origin = new URL(urlStr).origin;
      } catch (_) {
        // ignore
      }
      const baseUrl = process.env.SITE_URL || origin || "http://localhost:5173";
      const magicLinkUrl = `${baseUrl}/auth?token=${token}&email=${encodeURIComponent(email)}`;

      // Send magic link using the configured email provider
      const emailProvider = createEmailProvider();
      const appName = process.env.VLY_APP_NAME || "a vly.ai application";
      await emailProvider.sendMagicLink(email, magicLinkUrl, appName);

      // Update the attempt as successful if context is available
      if (ctxAny?.runMutation) {
        await ctxAny.runMutation(internal.auth.rateLimit.recordAttempt, {
          identifier: email,
          type: "magic_link",
          success: true,
        });
      }

    } catch (error) {
      console.error("Failed to send magic link:", error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Failed to send magic link. Please try again."
      );
    }
  },
});