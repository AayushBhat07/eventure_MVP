import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getTeamMemberByAdminId = query({
  args: { adminId: v.id("admins") },
  handler: async (ctx, args) => {
    const teamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_admin_id", (q) => q.eq("adminId", args.adminId))
      .unique();
    return teamMember;
  },
});

export const checkAdminProfile = query({
  args: { adminId: v.id("admins") },
  handler: async (ctx, args) => {
    const teamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_admin_id", (q) => q.eq("adminId", args.adminId))
      .unique();

    if (!teamMember) {
      return { isProfileComplete: false };
    }

    const { name, rollNo, branch, phone, email } = teamMember;
    const isProfileComplete = !!(name && rollNo && branch && phone && email);

    return { isProfileComplete };
  },
});

// Add a new team member
export const addTeamMember = mutation({
  args: {
    name: v.string(),
    rollNo: v.string(),
    branch: v.string(),
    phone: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
    volunteerEvents: v.optional(v.array(v.id("events"))),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) {
        return { success: false, message: "Invalid email format" };
      }

      // Validate phone number (10 digits)
      if (!/^\d{10}$/.test(args.phone)) {
        return { success: false, message: "Phone number must be 10 digits" };
      }

      // Check if member already exists
      const existingMember = await ctx.db
        .query("teamMembers")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();

      if (existingMember) {
        return { success: false, message: "Team member with this email already exists" };
      }

      // Create new team member (without adminId for regular volunteers)
      await ctx.db.insert("teamMembers", {
        name: args.name,
        rollNo: args.rollNo,
        branch: args.branch,
        phone: args.phone,
        email: args.email,
        role: args.role || "Volunteer",
        isActive: true,
        volunteerEvents: args.volunteerEvents || [],
        // adminId is optional and not provided for regular volunteers
      });

      return { success: true, message: "Team member added successfully!" };
    } catch (error) {
      console.error("Add team member error:", error);
      return { success: false, message: "Failed to add team member. Please try again." };
    }
  },
});

// Update team member
export const updateTeamMember = mutation({
  args: {
    memberId: v.id("teamMembers"),
    name: v.string(),
    rollNo: v.string(),
    branch: v.string(),
    phone: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
    volunteerEvents: v.optional(v.array(v.id("events"))),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) {
        return { success: false, message: "Invalid email format" };
      }

      // Validate phone number (10 digits)
      if (!/^\d{10}$/.test(args.phone)) {
        return { success: false, message: "Phone number must be 10 digits" };
      }

      await ctx.db.patch(args.memberId, {
        name: args.name,
        rollNo: args.rollNo,
        branch: args.branch,
        phone: args.phone,
        email: args.email,
        role: args.role,
        volunteerEvents: args.volunteerEvents,
      });

      return { success: true, message: "Team member updated successfully!" };
    } catch (error) {
      console.error("Update team member error:", error);
      return { success: false, message: "Failed to update team member. Please try again." };
    }
  },
});

export const updateAdminProfile = mutation({
  args: {
    adminId: v.id("admins"),
    name: v.string(),
    rollNo: v.string(),
    branch: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const teamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_admin_id", (q) => q.eq("adminId", args.adminId))
      .unique();

    if (!teamMember) {
      // If no team member entry exists for this admin, create one
      await ctx.db.insert("teamMembers", {
        adminId: args.adminId,
        name: args.name,
        rollNo: args.rollNo,
        branch: args.branch,
        phone: args.phone,
        email: args.email,
        role: "Admin",
        isActive: true,
      });
    } else {
      // Otherwise, update the existing entry
      await ctx.db.patch(teamMember._id, {
        name: args.name,
        rollNo: args.rollNo,
        branch: args.branch,
        phone: args.phone,
        email: args.email,
      });
    }

    return { success: true };
  },
});

// Delete team member
export const deleteTeamMember = mutation({
  args: {
    memberId: v.id("teamMembers"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.memberId);
      return { success: true, message: "Team member deleted successfully!" };
    } catch (error) {
      console.error("Delete team member error:", error);
      return { success: false, message: "Failed to delete team member. Please try again." };
    }
  },
});

// Get all team members with their volunteered events
export const getAllTeamMembers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("teamMembers"),
      adminId: v.optional(v.id("admins")),
      name: v.string(),
      rollNo: v.string(),
      branch: v.string(),
      phone: v.string(),
      email: v.string(),
      role: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      volunteerEvents: v.optional(v.array(v.id("events"))),
      eventNames: v.array(v.string()), // Event names they're volunteering for
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx) => {
    const teamMembers = await ctx.db.query("teamMembers").collect();
    
    // Get event names for each team member
    const membersWithEvents = await Promise.all(
      teamMembers.map(async (member) => {
        const eventNames: string[] = [];
        
        if (member.volunteerEvents) {
          for (const eventId of member.volunteerEvents) {
            const event = await ctx.db.get(eventId);
            if (event) {
              eventNames.push(event.name);
            }
          }
        }
        
        return {
          ...member,
          eventNames,
        };
      })
    );
    
    return membersWithEvents;
  },
});