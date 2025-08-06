import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
}

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const listMembers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      return [];
    }
    return await ctx.db.query("users").collect();
  },
});

export const updateUserProfile = mutation({
  args: {
    name: v.string(),
    rollNo: v.string(),
    branch: v.string(),
    mobileNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }
    await ctx.db.patch(user._id, {
      name: args.name,
      rollNo: args.rollNo,
      branch: args.branch,
      mobileNumber: args.mobileNumber,
    });
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    return {
      name: user.name,
      rollNo: user.rollNo,
      branch: user.branch,
      mobileNumber: user.mobileNumber,
      email: user.email
    };
  },
});