// @ts-nocheck
"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import bcrypt from "bcryptjs";
import { internal } from "./_generated/api";

export const adminLogin = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string; user?: any }> => {
    const adminUser = await (ctx as any).runQuery(internal.admin_creation.getAdminByEmail, { email: args.email }) as any;

    if (adminUser) {
      const isPasswordValid = await bcrypt.compare(args.password, adminUser.password);
      if (!isPasswordValid) {
        return { success: false, message: "Invalid credentials" };
      }
      const userToReturn = {
        _id: adminUser._id,
        _creationTime: adminUser._creationTime,
        email: adminUser.email,
        role: "admin", // Force role to be correct
        name: adminUser.name,
      };
      return { success: true, message: "Login successful", user: userToReturn };
    } 
    
    const teamMember = await (ctx as any).runQuery(internal.admin_creation.getTeamMemberByEmail, { email: args.email }) as any;
    if (!teamMember || !teamMember.password) {
      return { success: false, message: "Invalid credentials" };
    }
    const isPasswordValid = await bcrypt.compare(args.password, teamMember.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials" };
    }
    
    const userToReturn = {
      _id: teamMember._id,
      _creationTime: teamMember._creationTime,
      email: teamMember.email,
      role: "teammember", // Force role to be correct
      name: teamMember.name,
      userId: teamMember.userId,
      department: teamMember.department,
      branch: teamMember.branch,
      rollNo: teamMember.rollNo,
      joinedAt: teamMember.joinedAt,
    };
    
    return { success: true, message: "Login successful", user: userToReturn };
  },
});