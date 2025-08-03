"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { google } from "googleapis";
import { api } from "./_generated/api";

export const exportToGoogleSheets = internalAction({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    try {
      const participants = await ctx.runQuery(api.events.getEventParticipants, { eventId });
      const event = await ctx.runQuery(api.events.getEventById, { eventId });

      if (!event) {
        throw new Error("Event not found");
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${event.name} - Participants`,
          },
        },
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;
      if (!spreadsheetId) {
        throw new Error("Failed to create spreadsheet");
      }

      const values = [
        ["Name", "Roll Number", "Branch", "Phone Number", "Email Address", "Payment Status", "Registration Date"],
        ...participants.map(p => [
          p.name || "N/A",
          p.rollNo || "N/A",
          p.branch || "N/A",
          p.mobileNumber || "N/A",
          p.email || "N/A",
          p.paymentStatus,
          new Date(p.registrationDate).toLocaleDateString(),
        ]),
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "A1",
        valueInputOption: "RAW",
        requestBody: {
          values,
        },
      });

      return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    } catch (error) {
      console.error("Error exporting to Google Sheets:", error);
      throw new Error("Failed to export to Google Sheets. Please check your environment variables and permissions.");
    }
  },
});
