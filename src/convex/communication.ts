import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

export const postMessage = mutation({
  args: {
    messageText: v.string(),
    attachments: v.array(
      v.object({
        url: v.string(),
        name: v.string(),
        type: v.union(
          v.literal("image"),
          v.literal("pdf"),
          v.literal("video"),
          v.literal("docx"),
          v.literal("other"),
        ),
      }),
    ),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUser(ctx);
      if (!user) {
        return { success: false, message: "User not authenticated" };
      }

      if (user.role !== "admin") {
        return { success: false, message: "Only admins can post messages" };
      }

      await ctx.db.insert("admin_communication_messages", {
        messageText: args.messageText,
        senderId: user._id,
        senderName: user.name || "Admin",
        timestamp: Date.now(),
        attachments: args.attachments,
        reactions: {},
        readBy: [],
      });

      return { success: true, message: "Message posted successfully" };
    } catch (error) {
      console.error("Error posting message:", error);
      return { success: false, message: "Failed to post message" };
    }
  },
});

export const getMessages = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("admin_communication_messages")
      .withIndex("by_timestamp", (q) => q)
      .order("asc")
      .collect();
  },
});

export const toggleEmojiReaction = mutation({
  args: {
    messageId: v.id("admin_communication_messages"),
    emoji: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUser(ctx);
      if (!user) {
        return { success: false, message: "User not authenticated" };
      }

      const message = await ctx.db.get(args.messageId);
      if (!message) {
        return { success: false, message: "Message not found" };
      }

      const reactions = message.reactions || {};
      const userList = reactions[args.emoji] || [];

      if (userList.includes(user._id)) {
        // User has already reacted, so remove their reaction
        reactions[args.emoji] = userList.filter((id) => id !== user._id);
        if (reactions[args.emoji].length === 0) {
          delete reactions[args.emoji];
        }
      } else {
        // User has not reacted, so add their reaction
        reactions[args.emoji] = [...userList, user._id];
      }

      await ctx.db.patch(message._id, { reactions });
      return { success: true, message: "Reaction updated successfully" };
    } catch (error) {
      console.error("Error toggling emoji reaction:", error);
      return { success: false, message: "Failed to toggle reaction" };
    }
  },
});

export const uploadFile = mutation({
  args: {
    file: v.id("_storage"), // File storage ID
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    url: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUser(ctx);
      if (!user) {
        return { success: false, message: "User not authenticated" };
      }

      if (user.role !== "admin") {
        return { success: false, message: "Only admins can upload files" };
      }

      const url = await ctx.storage.getUrl(args.file);
      if (!url) {
        return { success: false, message: "Failed to get file URL" };
      }

      return { success: true, message: "File uploaded successfully", url };
    } catch (error) {
      console.error("Error uploading file:", error);
      return { success: false, message: "Failed to upload file" };
    }
  },
});

export const markAsRead = mutation({
  args: {
    messageId: v.id("admin_communication_messages"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUser(ctx);
      if (!user) {
        return { success: false, message: "User not authenticated" };
      }

      // Get the message
      const message = await ctx.db.get(args.messageId);
      if (!message) {
        return { success: false, message: "Message not found" };
      }

      // Don't mark as read if user is the sender
      if (message.senderId === user._id) {
        return { success: true, message: "Sender doesn't need to mark as read" };
      }

      // Check if user has already read this message
      const hasRead = (message.readBy || []).some((receipt: { userId: Id<"users">; userName: string; readAt: number }) => receipt.userId === user._id);
      if (hasRead) {
        return { success: true, message: "Already marked as read" };
      }

      // Add read receipt with userName
      const currentReadBy = message.readBy || [];
      const newReadReceipt = {
        userId: user._id,
        userName: user.name || "User",
        readAt: Date.now(),
      };

      await ctx.db.patch(args.messageId, {
        readBy: [...currentReadBy, newReadReceipt],
      });

      return { success: true, message: "Marked as read" };
    } catch (error) {
      console.error("Mark as read error:", error);
      return { success: false, message: "Failed to mark as read" };
    }
  },
});