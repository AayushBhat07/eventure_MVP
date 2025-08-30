import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { ROLES } from "./schema";

// Normalize email to lowercase for consistent lookups
export const getAdminByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    return await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first(); // changed from unique()
  },
});

// Normalize email to lowercase for consistent lookups
export const getTeamMemberByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first(); // changed from unique()
  },
});

export const anyAdminExists = internalQuery({
  args: {},
  handler: async (ctx) => {
    const firstAdmin = await ctx.db.query("admins").first();
    return firstAdmin !== null;
  },
});

export const createAdminInternal = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Normalize email for uniqueness and storage
    const email = args.email.toLowerCase();

    // Check if email already exists in admins table
    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingAdmin) {
      throw new Error("An admin with this email already exists");
    }

    // Check if email already exists in teamMembers table
    const existingTeamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingTeamMember) {
      throw new Error("A team member with this email already exists");
    }

    // Validate role
    if (args.role !== ROLES.ADMIN && args.role !== ROLES.USER) {
      throw new Error("Invalid role specified");
    }

    // Create the admin/team member based on role
    if (args.role === ROLES.ADMIN) {
      const adminId = await ctx.db.insert("admins", {
        email,
        password: args.passwordHash,
        name: undefined,
        role: "admin",
      });

      return {
        success: true,
        message: "Admin created successfully",
        id: adminId,
      };
    } else {
      // Create team member
      const teamMemberId = await ctx.db.insert("teamMembers", {
        // Set userId undefined until linked to a users document
        userId: undefined,
        name: email.split("@")[0], // Use email prefix as default name
        email,
        role: "teammember",
        password: args.passwordHash,
        joinedAt: Date.now(),
      });

      return {
        success: true,
        message: "Team member created successfully",
        id: teamMemberId,
      };
    }
  },
});