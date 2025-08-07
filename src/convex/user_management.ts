import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const promoteToAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const teamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!teamMember) {
      throw new Error(`Team member with email ${args.email} not found.`);
    }

    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingAdmin) {
      throw new Error(`An admin with email ${args.email} already exists.`);
    }

    await ctx.db.insert("admins", {
      email: teamMember.email,
      name: teamMember.name,
      password: teamMember.password!,
      role: "admin",
      branch: teamMember.branch,
      rollNo: teamMember.rollNo,
      mobileNumber: teamMember.mobileNumber,
    });

    await ctx.db.delete(teamMember._id);

    return { success: true, message: `User ${args.email} has been promoted to admin.` };
  },
});
