import {
  Home,
  Calendar,
  Users,
  Settings,
  MessageSquare,
  Ticket,
  ScanLine,
  BarChart3,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { name: "Dashboard", url: "/admin-dashboard", icon: Home },
  { name: "Events", url: "/admin-events", icon: Calendar },
  { name: "Check-In", url: "/admin-checkin", icon: ScanLine },
  { name: "Analytics", url: "/admin-event-analytics", icon: BarChart3 },
  { name: "Tickets", url: "/admin-tickets", icon: Ticket },
  { name: "Communication", url: "/admin-communication", icon: MessageSquare },
  { name: "Team", url: "/admin-team", icon: Users },
  { name: "Settings", url: "/admin-settings", icon: Settings },
];
