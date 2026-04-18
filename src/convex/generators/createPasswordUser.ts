"use node";
import { action } from "../_generated/server";
import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const createPasswordUser = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const { account, user } = await createAccount(ctx, {
        provider: "password",
        account: {
          id: args.email,
          secret: args.password,
        },
        profile: {
          email: args.email,
          name: args.name ?? args.email.split("@")[0],
          role: "user" as const,
          emailVerificationTime: Date.now(),
        },
        shouldLinkViaEmail: true,
      });
      return {
        success: true,
        message: `Password account created for ${args.email}`,
        userId: user._id,
        accountId: account._id,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, message: msg };
    }
  },
});
