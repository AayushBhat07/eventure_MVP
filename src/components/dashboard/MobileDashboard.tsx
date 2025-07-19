import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { 
  User, 
  Calendar, 
  Award, 
  LogOut,
  Sun,
  Moon,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export function MobileDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState("DAY-01");

  const userStats = useQuery(api.dashboard.getUserStats);
  const upcomingEvents = useQuery(api.dashboard.getUpcomingEvents);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Mock event data with images for the design
  const mockEvents = [
    {
      id: 1,
      title: "TABLE TENNIS",
      time: "00:01:00",
      status: "Registration Almost Full!",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop",
      buttonText: "Register Now"
    },
    {
      id: 2,
      title: "VOLLEYBALL",
      time: "00:01:00", 
      status: "Registration Closed!",
      image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=200&fit=crop",
      buttonText: "Register Now"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Phone Frame */}
      <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
        
        {/* Status Bar */}
        <div className="h-6 bg-black rounded-t-3xl flex items-center justify-center">
          <div className="w-20 h-1 bg-white rounded-full"></div>
        </div>

        {/* Header Section */}
        <div className="px-6 py-6 bg-white dark:bg-gray-800">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                HELLO,
              </h1>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                [{userStats?.name?.toUpperCase() || "NAME"}]
              </h2>
            </div>
            
            {/* Profile Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full p-0">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  My Events
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  My Certificates
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Light Mode</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              } relative`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Events:</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-1 h-6 px-3 text-xs bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                >
                  View All
                </Button>
              </div>
            </div>

            {/* Day Filter Buttons */}
            <div className="flex gap-2 mb-6">
              {["DAY-01", "DAY-02", "DAY-03"].map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 text-sm font-medium rounded-full ${
                    selectedDay === day 
                      ? "bg-gray-900 text-white hover:bg-gray-800" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
                  }`}
                >
                  {day}
                </Button>
              ))}
            </div>

            {/* Event Cards */}
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative overflow-hidden rounded-2xl"
                >
                  <div className="relative h-32 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }}>
                    <div className="absolute inset-0 bg-black bg-opacity-40" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-white px-3 py-1 rounded-full">
                        <span className="text-xs font-medium text-gray-900">
                          {event.status}
                        </span>
                      </div>
                    </div>

                    {/* Event Title */}
                    <div className="absolute bottom-3 left-3">
                      <h4 className="text-white font-bold text-lg tracking-wider">
                        {event.title}
                      </h4>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-gray-900 text-white border-gray-900 hover:bg-gray-800 rounded-full font-medium"
                    >
                      {event.time}
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gray-900 text-white hover:bg-gray-800 rounded-full font-medium"
                    >
                      {event.buttonText}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}