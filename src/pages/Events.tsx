import { Protected } from "@/lib/protected-page";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { ThemeSwitcher } from "@/components/ui/theme-switcher-1";
import { Home, Calendar, Trophy, User, Settings } from "lucide-react";
import { BrutalistSportsCard } from "@/components/ui/brutalist-sports-card";
import {
  Bike,
  Circle,
  Sword,
  Zap,
  Target,
  Crown,
  Gamepad2,
  CircleDot,
  Flag
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function Events() {
  const navItems = [
    { name: 'Dashboard', url: '/dashboard', icon: Home },
    { name: 'Events', url: '/events', icon: Calendar },
    { name: 'Certificates', url: '/certificates', icon: Trophy },
    { name: 'Profile', url: '/profile', icon: User },
    { name: 'Settings', url: '/settings', icon: Settings }
  ];

  // Fetch events from database
  const events = useQuery(api.events.getAllEvents);

  // Icon mapping for different sports/event types
  const getEventIcon = (eventName: string) => {
    const name = eventName.toLowerCase();
    if (name.includes('cycling') || name.includes('bike')) return Bike;
    if (name.includes('basketball')) return Circle;
    if (name.includes('fencing')) return Sword;
    if (name.includes('badminton')) return Zap;
    if (name.includes('table tennis') || name.includes('ping pong')) return Target;
    if (name.includes('tennis')) return Circle;
    if (name.includes('cricket')) return Target;
    if (name.includes('athletics') || name.includes('track')) return Crown;
    if (name.includes('carrom')) return Target;
    if (name.includes('chess')) return Gamepad2;
    if (name.includes('football')) return CircleDot;
    if (name.includes('golf')) return Flag;
    // Default icon for other events
    return Calendar;
  };

  // Format date and time for display
  const formatEventDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const eventDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const eventTime = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return { eventDate, eventTime };
  };

  // Generate sport category from event name
  const getSportCategory = (eventName: string) => {
    const name = eventName.toLowerCase();
    if (name.includes('cycling')) return 'Cycling';
    if (name.includes('basketball')) return 'Basketball';
    if (name.includes('fencing')) return 'Fencing';
    if (name.includes('badminton')) return 'Badminton';
    if (name.includes('table tennis') || name.includes('ping pong')) return 'Table Tennis';
    if (name.includes('tennis')) return 'Tennis';
    if (name.includes('cricket')) return 'Cricket';
    if (name.includes('athletics') || name.includes('track')) return 'Athletics';
    if (name.includes('carrom')) return 'Carrom';
    if (name.includes('chess')) return 'Chess';
    if (name.includes('football')) return 'Football';
    if (name.includes('golf')) return 'Golf';
    // Extract first word as category for other events
    return eventName.split(' ')[0];
  };

  return (
    <Protected>
      <NavBar items={navItems} />
      
      {/* Theme Switcher positioned in top-right corner, aligned with navbar */}
      <div className="fixed top-0 right-6 z-50 pt-6">
        <ThemeSwitcher />
      </div>
      
      {/* All Events title */}
      <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80 dark:from-white dark:to-white/80">
            All Events
          </h1>
        </div>
      </div>

      <div className="pt-48 flex flex-wrap justify-center gap-6">
        {/* Loading state */}
        {events === undefined && (
          <div className="flex items-center justify-center w-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg font-mono">Loading events...</span>
          </div>
        )}

        {/* No events state */}
        {events && events.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Events Found</h2>
            <p className="text-muted-foreground">Events created from the admin dashboard will appear here.</p>
          </div>
        )}

        {/* Display events from database */}
        {events && events.length > 0 && events.map((event) => {
          const { eventDate, eventTime } = formatEventDateTime(event.startDate);
          const sport = getSportCategory(event.name);
          const EventIcon = getEventIcon(event.name);

          return (
            <BrutalistSportsCard
              key={event._id}
              sport={sport}
              title={event.name}
              date={eventDate}
              time={eventTime}
              venue={event.venue}
              icon={EventIcon}
              eventId={event._id}
            />
          );
        })}
      </div>
    </Protected>
  );
}