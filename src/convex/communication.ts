import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const listMessages = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("admin_communication_messages")
      .order("desc")
      .take(100);
    
    const messagesWithAuthors = await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        return {
          ...message,
          authorName: author?.name,
          authorImage: author?.image,
        };
      })
    );
    return messagesWithAuthors.reverse();
  },
});

export const sendMessage = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.role !== "admin") {
      throw new Error("Only admins can send messages");
    }

    await ctx.db.insert("admin_communication_messages", {
      authorId: user._id,
      content: args.content,
    });
  },
});
