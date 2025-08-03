import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from "@/lib/utils";
import { IconUser, IconCalendarEvent } from "@tabler/icons-react";
import { MenuBar } from '@/components/ui/glow-menu';
import { LayoutDashboard, Calendar as CalendarIcon, Users, Settings, Bell } from "lucide-react";

const AdminTeamPage = () => {
  const adminsWithEvents = useQuery(api.admin.getAllAdminsWithEvents);
  const [activeMenuItem, setActiveMenuItem] = useState("Team");

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/admin-dashboard", gradient: "from-blue-500 to-purple-600", iconColor: "text-blue-400" },
    { name: "Events", icon: CalendarIcon, label: "Events", href: "/admin-events", gradient: "from-green-500 to-cyan-600", iconColor: "text-green-400" },
    { name: "Team", icon: Users, label: "Team", href: "/admin-team", gradient: "from-red-500 to-orange-600", iconColor: "text-red-400" },
    { name: "Settings", icon: Settings, label: "Settings", href: "#", gradient: "from-yellow-500 to-amber-600", iconColor: "text-yellow-400" },
    { name: "Notifications", icon: Bell, label: "Notifications", href: "#", gradient: "from-pink-500 to-rose-600", iconColor: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <MenuBar items={menuItems} activeItem={activeMenuItem} onItemClick={setActiveMenuItem} />
      </div>
      <div className="pt-24">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-10">Admin Team</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-10 max-w-7xl mx-auto gap-4">
          {adminsWithEvents?.map((admin, index) => (
            <AdminProfileCard 
              key={admin._id}
              name={admin.name || 'Unnamed Admin'}
              email={admin.email}
              events={admin.events}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminProfileCard = ({
  name,
  email,
  events,
  index,
}: {
  name: string;
  email: string;
  events: any[];
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col p-6 relative group/feature border dark:border-neutral-800 rounded-lg",
        "bg-white dark:bg-black shadow-md hover:shadow-lg transition-shadow duration-300"
      )}
    >
      <div className="mb-4 relative z-10 text-neutral-600 dark:text-neutral-400">
        <IconUser size={32} />
      </div>
      <div className="text-xl font-bold mb-2 relative z-10">
        <span className="text-neutral-800 dark:text-neutral-100">{name}</span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 mb-4">
        <strong>Email:</strong> {email}
      </p>
      <div className="border-t dark:border-neutral-700 pt-4 mt-auto">
        <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
          <IconCalendarEvent size={20} />
          Events Created
        </h4>
        <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
          {events.length > 0 ? (
            events.map(event => <li key={event._id}>{event.name}</li>)
          ) : (
            <li>No events created.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminTeamPage;