import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MenuBar } from "@/components/ui/glow-menu";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ThemeProvider, useTheme } from 'next-themes';
import { Home, Calendar, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { Id } from '@/convex/_generated/dataModel';
import { motion } from 'framer-motion';

interface AdminUser {
  _id: Id<"admins">;
  email: string;
  name?: string;
}

function AdminSettingsContent() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState("Settings");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    branch: "",
    phone: "",
    email: "",
  });

  const teamMember = useQuery(
    api.team.getTeamMemberByAdminId,
    adminUser ? { adminId: adminUser._id } : "skip"
  );

  const updateAdminProfile = useMutation(api.team.updateAdminProfile);

  useEffect(() => {
    const adminData = sessionStorage.getItem("adminUser");
    if (adminData) {
      const parsedAdmin = JSON.parse(adminData);
      setAdminUser(parsedAdmin);
      setFormData(prev => ({ ...prev, email: parsedAdmin.email }));
    } else {
      // If no admin data, redirect to sign-in
      navigate('/admin-signIn');
    }
  }, [navigate]);

  useEffect(() => {
    if (teamMember) {
      setFormData({
        name: teamMember.name || "",
        rollNo: teamMember.rollNo || "",
        branch: teamMember.branch || "",
        phone: teamMember.phone || "",
        email: teamMember.email || adminUser?.email || "",
      });
    }
  }, [teamMember, adminUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!adminUser) {
      toast.error("No admin user identified. Please sign in again.");
      return;
    }

    // Basic validation
    if (!formData.name || !formData.rollNo || !formData.branch || !formData.phone || !formData.email) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    try {
      await updateAdminProfile({
        adminId: adminUser._id,
        ...formData,
      });
      toast.success("Profile updated successfully!");
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuItemClick = (itemName: string) => {
    setActiveMenuItem(itemName);
    
    // Navigate to the corresponding route
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
      default:
        break;
    }
  };

  const menuItems = [
    { name: 'Dashboard', label: 'Dashboard', href: '/admin-dashboard', icon: Home, gradient: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-500' },
    { name: 'Events', label: 'Events', href: '/admin-events', icon: Calendar, gradient: 'from-green-500 to-emerald-500', iconColor: 'text-green-500' },
    { name: 'Team', label: 'Team', href: '/admin-team', icon: Users, gradient: 'from-purple-500 to-violet-500', iconColor: 'text-purple-500' },
    { name: 'Settings', label: 'Settings', href: '/admin-settings', icon: Settings, gradient: 'from-red-500 to-orange-500', iconColor: 'text-red-500' }
  ];

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  };

  const isTeamMemberLoading = teamMember === undefined;

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundPaths title="" />
      </div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <header className="border-b-2 border-black dark:border-white/20 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ADMIN SETTINGS</h1>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold">{getCurrentDate()}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">ADMIN PANEL</div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-lg">
                AB
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

        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              className="bg-card/80 backdrop-blur-sm border-4 border-black dark:border-white p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-6 tracking-tight">PROFILE SETTINGS</h2>
              
              {isTeamMemberLoading ? (
                <p>Loading profile...</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-bold mb-2 block">NAME</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => handleInputChange("name", e.target.value)} 
                      className="border-2 border-black dark:border-white font-mono" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="rollNo" className="text-sm font-bold mb-2 block">ROLL NO</Label>
                    <Input 
                      id="rollNo" 
                      value={formData.rollNo} 
                      onChange={(e) => handleInputChange("rollNo", e.target.value)} 
                      className="border-2 border-black dark:border-white font-mono" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="branch" className="text-sm font-bold mb-2 block">BRANCH</Label>
                    <Input 
                      id="branch" 
                      value={formData.branch} 
                      onChange={(e) => handleInputChange("branch", e.target.value)} 
                      className="border-2 border-black dark:border-white font-mono" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-bold mb-2 block">PHONE NUMBER</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={(e) => handleInputChange("phone", e.target.value)} 
                      className="border-2 border-black dark:border-white font-mono" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-bold mb-2 block">EMAIL ADDRESS</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => handleInputChange("email", e.target.value)} 
                      className="border-2 border-black dark:border-white font-mono" 
                    />
                  </div>
                  <Button 
                    onClick={handleSave}
                    className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-mono text-lg py-3 border-2 border-black dark:border-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "SAVING..." : "SAVE CHANGES »"}
                  </Button>
                </div>
              )}

              {teamMember && (
                <div className="mt-6 pt-6 border-t-2 border-black dark:border-white text-sm text-gray-600 dark:text-gray-400">
                  <p>Last updated: {new Date(teamMember._creationTime).toLocaleDateString()}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminSettingsContent />
    </ThemeProvider>
  );
}