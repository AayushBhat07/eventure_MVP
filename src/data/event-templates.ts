export interface EventTemplate {
  name: string;
  description: string;
  venue: string;
  imageUrl: string;
  category: string;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    name: "Tech Workshop",
    description:
      "Hands-on workshop covering the latest technologies, frameworks, and tools. Participants will build real projects under expert guidance and leave with practical skills they can apply immediately.",
    venue: "",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    category: "technology",
  },
  {
    name: "Hackathon",
    description:
      "An intense 24-hour coding marathon where teams compete to build innovative solutions to real-world problems. Prizes, mentorship, and networking opportunities await the best projects.",
    venue: "",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    category: "technology",
  },
  {
    name: "Seminar",
    description:
      "An insightful seminar featuring industry leaders and academic experts sharing knowledge on cutting-edge topics. Includes Q&A sessions and panel discussions for deeper engagement.",
    venue: "",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    category: "academic",
  },
  {
    name: "Cultural Event",
    description:
      "A vibrant celebration of art, music, dance, and creativity. Showcasing diverse talents from across the campus with performances, exhibitions, and interactive cultural activities.",
    venue: "",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    category: "cultural",
  },
  {
    name: "Sports Meet",
    description:
      "Annual inter-department sports competition featuring track and field events, team sports, and individual challenges. Compete for glory, trophies, and the spirit of sportsmanship.",
    venue: "",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=800&q=80",
    category: "sports",
  },
  {
    name: "Competition",
    description:
      "A high-stakes competitive event testing skills across multiple domains — coding, design, debate, or quiz. Individual and team categories with exciting prizes for top performers.",
    venue: "",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    category: "competition",
  },
  {
    name: "Training Session",
    description:
      "Professional development training designed to upskill participants in specific areas such as leadership, communication, technical certifications, or career readiness.",
    venue: "",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    category: "training",
  },
];
