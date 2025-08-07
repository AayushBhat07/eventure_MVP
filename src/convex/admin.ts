import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const adminLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for admin
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (admin && admin.password === args.password) {
      return {
        success: true,
        message: "Admin login successful",
        user: {
          _id: admin._id,
          email: admin.email,
          name: admin.name,
          role: "admin",
        },
      };
    }

    // Check for team member
    const teamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (teamMember && teamMember.password === args.password) {
      return {
        success: true,
        message: "Team Member login successful",
        user: {
          _id: teamMember._id,
          email: teamMember.email,
          name: teamMember.name,
          role: teamMember.role,
        },
      };
    }

    return {
      success: false,
      message: "Invalid credentials",
    };
  },
});

export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admins").collect();
  },
});