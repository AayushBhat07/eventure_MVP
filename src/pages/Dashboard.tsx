import { Protected } from "@/lib/protected-page";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { ThemeSwitcher } from "@/components/ui/theme-switcher-1";
import { Home, Calendar, Trophy, User, Settings, Bike, Dribbble, Swords } from "lucide-react";
import { BrutalistSportsCard } from "@/components/ui/brutalist-sports-card";

export default function Dashboard() {
  const navItems = [
    { name: 'Dashboard', url: '/dashboard', icon: Home },
    { name: 'Events', url: '/events', icon: Calendar },
    { name: 'Certificates', url: '/certificates', icon: Trophy },
    { name: 'Profile', url: '/profile', icon: User },
    { name: 'Settings', url: '/settings', icon: Settings }
  ];

  const events = [
    {
      sport: "Cycling",
      title: "Mountain Bike Championship",
      date: "2024-08-15",
      time: "09:00 AM",
      venue: "Pine Ridge Trail",
      icon: <Bike />,
    },
    {
      sport: "Basketball",
      title: "Summer Slam 3v3",
      date: "2024-08-20",
      time: "02:00 PM",
      venue: "City Center Arena",
      icon: <Dribbble />,
    },
    {
      sport: "Fencing",
      title: "Regional Epee Tournament",
      date: "2024-09-01",
      time: "10:00 AM",
      venue: "Knights Hall",
      icon: <Swords />,
    },
  ];

  return (
    <Protected>
      <NavBar items={navItems} />
      
      {/* Theme Switcher positioned in top-right corner, aligned with navbar */}
      <div className="fixed top-0 right-6 z-50 pt-6">
        <ThemeSwitcher />
      </div>
      
      {/* Event Dashboard title */}
      <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80 dark:from-white dark:to-white/80">
            Event Dashboard
          </h1>
        </div>
      </div>

      <div className="pt-48 flex flex-wrap justify-center">
        {events.map((event, index) => (
          <BrutalistSportsCard
            key={index}
            sport={event.sport}
            title={event.title}
            date={event.date}
            time={event.time}
            venue={event.venue}
            icon={event.icon}
          />
        ))}
      </div>
    </Protected>
  );
}