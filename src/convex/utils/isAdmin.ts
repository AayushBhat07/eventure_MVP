import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const isAdmin = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return false;
    }
    const user = await ctx.db.get(args.userId);
    return user?.role === "admin";
  },
});
