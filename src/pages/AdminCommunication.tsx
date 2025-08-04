import React, { useState, useEffect } from 'react';
import { MenuBar } from "@/components/ui/glow-menu";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ThemeProvider, useTheme } from 'next-themes';
import { Home, Calendar, Users, Settings, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router";
import { Id } from '@/convex/_generated/dataModel';

interface AdminUser {
  _id: Id<"admins">;
  email: string;
  name?: string;
}

// Sample hardcoded messages for the initial layout
const sampleMessages = [
  {
    id: 1,
    adminName: "John Doe",
    timestamp: "3 Aug, 10:24 PM",
    text: "Meeting at 5 PM tomorrow."
  },
  {
    id: 2,
    adminName: "Jane Smith",
    timestamp: "3 Aug, 9:15 AM",
    text: "Please submit your event reports by Friday. All coordinators must include participant feedback and budget details."
  },
  {
    id: 3,
    adminName: "Mike Johnson",
    timestamp: "2 Aug, 6:30 PM",
    text: "New safety protocols are now in effect for all outdoor events. Check the updated guidelines in the shared folder."
  }
];

function AdminCommunicationContent() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState("Communication");

  useEffect(() => {
    const adminData = sessionStorage.getItem("adminUser");
    if (adminData) {
      setAdminUser(JSON.parse(adminData));
    }
  }, []);

  const handleMenuItemClick = (itemName: string) => {
    setActiveMenuItem(itemName);
    
    switch (itemName) {
      case 'Dashboard':
        navigate('/admin-dashboard');
        break;
      case 'Events':
        navigate('/admin-events');
        break;
      case 'Team':
        navigate('/admin-team');
        break;
      case 'Settings':
        navigate('/admin-settings');
        break;
      case 'Communication':
        navigate('/admin-communication');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { name: 'Dashboard', label: 'Dashboard', href: '/admin-dashboard', icon: Home, gradient: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-500' },
    { name: 'Events', label: 'Events', href: '/admin-events', icon: Calendar, gradient: 'from-green-500 to-emerald-500', iconColor: 'text-green-500' },
    { name: 'Team', label: 'Team', href: '/admin-team', icon: Users, gradient: 'from-purple-500 to-violet-500', iconColor: 'text-purple-500' },
    { name: 'Communication', label: 'Communication', href: '/admin-communication', icon: MessageSquare, gradient: 'from-orange-500 to-red-500', iconColor: 'text-orange-500' },
    { name: 'Settings', label: 'Settings', href: '/admin-settings', icon: Settings, gradient: 'from-red-500 to-pink-500', iconColor: 'text-red-500' }
  ];

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative">
      {/* Fixed Background Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundPaths title="" />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header Section */}
        <header className="border-b-2 border-black dark:border-white/20 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">COMMUNICATION CENTER</h1>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold">{getCurrentDate()}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">ADMIN PANEL</div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-lg">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 border-2 border-black dark:border-white">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </header>

        {/* Floating Navbar */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <MenuBar items={menuItems} activeItem={activeMenuItem} onItemClick={handleMenuItemClick} />
        </div>

        {/* Brutalist Page Header - Fixed/Sticky */}
        <div className="sticky top-0 z-40 bg-black dark:bg-white text-white dark:text-black border-b-4 border-black dark:border-white">
          <div className="text-center py-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              📢 ANNOUNCEMENTS
            </h2>
          </div>
        </div>

        {/* Scrollable Message Feed */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 px-4 py-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {sampleMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] p-4"
              >
                {/* Message Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-sm uppercase tracking-wide">
                    {message.adminName}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {message.timestamp}
                  </div>
                </div>
                
                {/* Message Content */}
                <div className="text-base leading-relaxed">
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Reserved Space for Input Box (Step 2) */}
          <div className="max-w-4xl mx-auto mt-8 mb-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 border-4 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wide">
                MESSAGE INPUT AREA (STEP 2)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCommunication() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminCommunicationContent />
    </ThemeProvider>
  );
}
