import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Helper function to determine if a team member's profile is complete
const isTeamMemberProfileComplete = (member: Doc<"teamMembers">) => {
  return !!(
    member.name &&
    member.branch &&
    member.rollNo &&
    member.mobileNumber
  );
};

// Helper function to determine if an admin's profile is complete
const isAdminProfileComplete = (admin: Doc<"admins">) => {
    return !!(
        admin.name &&
        admin.branch &&
        admin.rollNo &&
        admin.mobileNumber
    );
};

// Keep the original query for backward compatibility
export const getAllTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teamMembers").collect();
  },
});

// Query to get all team members and admins with their profile completion status
export const getCombinedTeamWithProfileStatus = query({
  args: {},
  handler: async (ctx) => {
    const teamMembers = await ctx.db.query("teamMembers").collect();
    const admins = await ctx.db.query("admins").collect();

    const formattedTeamMembers = teamMembers.map((member) => ({
        ...member,
        type: 'teammember' as const,
        isProfileComplete: isTeamMemberProfileComplete(member),
    }));

    const formattedAdmins = admins.map((admin) => ({
        ...admin,
        type: 'admin' as const,
        isProfileComplete: isAdminProfileComplete(admin),
    }));

    const combined = [...formattedAdmins, ...formattedTeamMembers];
    
    // Sort by name, handling cases where name might be null or undefined
    return combined.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  },
});

// Mutation to update team member profile information
export const updateTeamMemberProfile = mutation({
  args: {
    teamMemberId: v.id("teamMembers"),
    name: v.optional(v.string()),
    branch: v.optional(v.string()),
    rollNo: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
    department: v.optional(v.string()),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    const { teamMemberId, adminId, ...updateData } = args;
    
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(teamMemberId, filteredUpdateData);
  },
});

// Mutation to update admin profile information
export const updateAdminProfile = mutation({
    args: {
      adminToUpdateId: v.id("admins"),
      name: v.optional(v.string()),
      branch: v.optional(v.string()),
      rollNo: v.optional(v.string()),
      mobileNumber: v.optional(v.string()),
      loggedInAdminId: v.id("admins"),
    },
    handler: async (ctx, args) => {
      const loggedInAdmin = await ctx.db.get(args.loggedInAdminId);
      if (!loggedInAdmin || loggedInAdmin.role !== "admin") {
        throw new Error("Admin access required");
      }
  
      const { adminToUpdateId, loggedInAdminId, ...updateData } = args;
      
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );
  
      await ctx.db.patch(adminToUpdateId, filteredUpdateData);
    },
  });