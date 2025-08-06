import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const createAdminUser = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin user already exists
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "admin@eventhub.com"))
      .first();

    if (existingAdmin) {
      return { success: false, message: "Admin user already exists" };
    }

    // Create admin user
    const adminId = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@eventhub.com",
      role: "admin",
      emailVerificationTime: Date.now(),
    });

    return { success: true, message: "Admin user created successfully", userId: adminId };
  },
});