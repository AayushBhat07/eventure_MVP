 // @ts-nocheck
"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import bcrypt from "bcryptjs";
import { internal } from "./_generated/api";

export const createUser = action({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("teammember")),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const passwordHash = await bcrypt.hash(args.password, 10);
    return await ctx.runMutation(
      internal.user_creation_internal.createUserInternal,
      {
        email: args.email,
        passwordHash,
        role: args.role,
      }
    );
  },
});