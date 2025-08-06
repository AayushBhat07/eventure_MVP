import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("events"),
    name: v.string(),
    description: v.string(),
    venue: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    maxParticipants: v.optional(v.number()),
    createdBy: v.id("users"),
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("completed")),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    venue: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    maxParticipants: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    eventId: v.optional(v.id("events")),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    try {
      const eventId = await ctx.db.insert("events", {
        name: args.name,
        description: args.description,
        venue: args.venue,
        startDate: args.startDate,
        endDate: args.endDate,
        maxParticipants: args.maxParticipants,
        createdBy: user._id,
        status: "active",
      });

      return { 
        success: true, 
        message: "Event created successfully",
        eventId 
      };
    } catch (error) {
      return { 
        success: false, 
        message: "Failed to create event" 
      };
    }
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    venue: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    maxParticipants: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("cancelled"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});