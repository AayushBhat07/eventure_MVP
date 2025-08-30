// @ts-nocheck
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

export const createAdmin = action({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string; id: any }> => {
    try {
      // Hash the password
      const saltRounds = 12;
      const hashedPassword: string = await bcrypt.hash(args.password, saltRounds);

      // Call internal mutation to save the admin
      // Further relax type inference to avoid deep instantiation
      const result = (await (ctx as any).runMutation(
        (internal as any).admin_creation.createAdminInternal,
        {
          email: args.email,
          passwordHash: hashedPassword,
          role: args.role,
        }
      )) as { success: boolean; message: string; id: any };

      return result;
    } catch (error) {
      console.error("Error creating admin:", error);
      throw new Error("Failed to create admin");
    }
  },
});