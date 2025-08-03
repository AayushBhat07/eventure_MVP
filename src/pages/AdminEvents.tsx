import React, { useState } from 'react';
import { MenuBar } from '@/components/ui/glow-menu';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Settings,
  Bell,
  Plus,
  Loader2,
} from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ThemeProvider } from 'next-themes';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreateEventModal } from '@/components/admin/CreateEventModal';

function AdminEventsContent() {
  const [activeMenuItem, setActiveMenuItem] = useState("Events");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const allEvents = useQuery(api.events.getAllEventsWithDetails);
  const allUsers = useQuery(api.users.listAll);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/admin-dashboard", gradient: "from-blue-500 to-purple-600", iconColor: "text-blue-400" },
    { name: "Events", icon: CalendarIcon, label: "Events", href: "/admin-events", gradient: "from-green-500 to-cyan-600", iconColor: "text-green-400" },
    { name: "Users", icon: Users, label: "Users", href: "#", gradient: "from-red-500 to-orange-600", iconColor: "text-red-400" },
    { name: "Settings", icon: Settings, label: "Settings", href: "#", gradient: "from-yellow-500 to-amber-600", iconColor: "text-yellow-400" },
    { name: "Notifications", icon: Bell, label: "Notifications", href: "#", gradient: "from-pink-500 to-rose-600", iconColor: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative">
      <div className="absolute inset-0 z-0">
        <BackgroundPaths />
      </div>
      <div className="relative z-10">
        <MenuBar items={menuItems} activeItem={activeMenuItem} onItemClick={setActiveMenuItem} />
        
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">
                EVENT MANAGEMENT
              </h1>
              <p className="text-muted-foreground font-medium">
                Manage all events, volunteers, and registrations
              </p>
            </div>
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] hover:shadow-[6px_6px_0px_#000] dark:hover:shadow-[6px_6px_0px_#fff] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              CREATE EVENT
            </Button>
          </div>

          <div className="grid gap-6">
            {allEvents === undefined && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className="text-lg font-mono">Loading events...</span>
              </div>
            )}

            {allEvents && allEvents.length === 0 && (
              <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No Events Found</h2>
                  <p className="text-muted-foreground text-center mb-6">
                    Create your first event to get started.
                  </p>
                  <Button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Event
                  </Button>
                </CardContent>
              </Card>
            )}

            {allEvents && allEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allEvents.map(event => (
                  <Card key={event._id} className="border-4 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                      <p className="text-muted-foreground line-clamp-3">{event.description}</p>
                      <div className="mt-4 text-sm">
                        <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                        <p><strong>Venue:</strong> {event.venue}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        <CreateEventModal
          isOpen={createModalOpen}
          onOpenChange={setCreateModalOpen}
          allUsers={allUsers}
        />
      </div>
    </div>
  );
}

export default function AdminEvents() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AdminEventsContent />
    </ThemeProvider>
  );
}