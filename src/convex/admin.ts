import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Admin login mutation
export const adminLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // This is an insecure way to handle passwords.
    // In a real app, you should use a proper authentication system.
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!admin) {
      return { success: false, message: "Invalid email or password" };
    }

    if (admin.role !== "admin") {
      return { success: false, message: "You are not an admin" };
    }
    
    // This is an insecure password check.
    // @ts-ignore
    if (admin.password !== args.password) {
        return { success: false, message: "Invalid email or password" };
    }

    return {
      success: true,
      message: "Login successful",
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    };
  },
});

// List all admins
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    return admins;
  },
});