import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createSampleEvents = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if events already exist
    const existingEvents = await ctx.db.query("events").collect();
    if (existingEvents.length > 0) {
      return { success: false, message: "Sample events already exist" };
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    const sampleEvents = [
      {
        name: "Annual Sports Day 2024",
        description: "Join us for an exciting day of sports competitions including cricket, football, basketball, and athletics. Open to all students and faculty members. Prizes for winners!",
        venue: "Main Sports Complex",
        startDate: now + (7 * oneDay),
        endDate: now + (7 * oneDay) + (8 * oneHour),
        maxParticipants: 200,
        createdBy: "admin@example.com",
        status: "active" as const,
      },
      {
        name: "Tech Symposium 2024",
        description: "A comprehensive technical symposium featuring workshops on AI, Machine Learning, Web Development, and Cybersecurity. Industry experts will share insights and conduct hands-on sessions.",
        venue: "Auditorium Block A",
        startDate: now + (14 * oneDay),
        endDate: now + (14 * oneDay) + (6 * oneHour),
        maxParticipants: 150,
        createdBy: "admin@example.com",
        status: "active" as const,
      },
      {
        name: "Cultural Fest - Harmony 2024",
        description: "Celebrate diversity through music, dance, drama, and art. Multiple stages with performances throughout the day. Food stalls from different cultures. Everyone welcome!",
        venue: "Open Air Theatre",
        startDate: now + (21 * oneDay),
        endDate: now + (21 * oneDay) + (10 * oneHour),
        maxParticipants: 500,
        createdBy: "admin@example.com",
        status: "active" as const,
      },
      {
        name: "Hackathon 2024",
        description: "24-hour coding marathon! Build innovative solutions to real-world problems. Teams of 2-4 members. Mentorship from industry professionals. Amazing prizes and internship opportunities.",
        venue: "Computer Science Block",
        startDate: now + (28 * oneDay),
        endDate: now + (29 * oneDay),
        maxParticipants: 100,
        createdBy: "admin@example.com",
        status: "active" as const,
      },
      {
        name: "Career Fair 2024",
        description: "Meet recruiters from top companies. On-spot interviews, resume reviews, and career counseling sessions. Dress professionally and bring multiple copies of your resume.",
        venue: "Convention Center",
        startDate: now + (35 * oneDay),
        endDate: now + (35 * oneDay) + (5 * oneHour),
        maxParticipants: 300,
        createdBy: "admin@example.com",
        status: "active" as const,
      },
      {
        name: "Environmental Awareness Workshop",
        description: "Learn about sustainability, climate change, and how you can make a difference. Interactive sessions on waste management, renewable energy, and conservation.",
        venue: "Seminar Hall 3",
        startDate: now + (42 * oneDay),
        endDate: now + (42 * oneDay) + (3 * oneHour),
        maxParticipants: 80,
        createdBy: "admin@example.com",
        status: "active" as const,
      },
      {
        name: "Photography Exhibition & Contest",
        description: "Showcase your photography skills! Submit your best shots in categories: Nature, Portrait, Street, and Abstract. Exhibition of selected works followed by awards ceremony.",
        venue: "Art Gallery",
        startDate: now + (49 * oneDay),
        endDate: now + (49 * oneDay) + (4 * oneHour),
        maxParticipants: 60,
        createdBy: "admin@example.com",
        status: "active" as const,
      },
      {
        name: "Alumni Meet 2024",
        description: "Reconnect with old friends and make new connections. Networking sessions, campus tour, and dinner. Share your experiences and inspire current students.",
        venue: "Alumni Hall",
        startDate: now + (56 * oneDay),
        endDate: now + (56 * oneDay) + (6 * oneHour),
        maxParticipants: 250,
        createdBy: "admin@example.com",
        status: "active" as const,
      },
    ];

    const eventIds = [];
    for (const event of sampleEvents) {
      const eventId = await ctx.db.insert("events", event);
      eventIds.push(eventId);
    }

    return {
      success: true,
      message: `Created ${eventIds.length} sample events successfully`,
      eventIds,
    };
  },
});
