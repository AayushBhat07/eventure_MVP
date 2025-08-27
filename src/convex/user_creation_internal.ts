import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const createUserInternal = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("teammember")),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const existingTeamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingTeamMember) {
      throw new Error("A team member with this email already exists.");
    }

    if (args.role === "admin") {
      await ctx.db.insert("admins", {
        email: args.email,
        password: args.passwordHash,
        name: args.email.split("@")[0],
        role: "admin",
      });
    } else {
      await ctx.db.insert("teamMembers", {
        userId: "" as any,
        name: args.email.split("@")[0],
        email: args.email,
        role: "teammember",
        password: args.passwordHash,
        joinedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: `User ${args.email} created successfully as a ${args.role}.`,
    };
  },
});
