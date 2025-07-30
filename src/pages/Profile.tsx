import { Protected } from "@/lib/protected-page";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { ThemeSwitcher } from "@/components/ui/theme-switcher-1";
import { Home, Calendar, Trophy, User, Settings, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface FormData {
  name: string;
  rollNo: string;
  branch: string;
  mobileNumber: string;
  email: string;
}

interface FormErrors {
  name?: string;
  rollNo?: string;
  branch?: string;
  mobileNumber?: string;
  email?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const userProfile = useQuery(api.users.getUserProfile);
  const updateProfile = useMutation(api.users.updateUserProfile);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    rollNo: "",
    branch: "",
    mobileNumber: "",
    email: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const navItems = [
    { name: 'Dashboard', url: '/dashboard', icon: Home },
    { name: 'Events', url: '/events', icon: Calendar },
    { name: 'Certificates', url: '/certificates', icon: Trophy },
    { name: 'Profile', url: '/profile', icon: User },
    { name: 'Settings', url: '/settings', icon: Settings }
  ];

  // Load user data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile && !isDataLoaded) {
      setFormData({
        name: userProfile.name || "",
        rollNo: userProfile.rollNo || "",
        branch: userProfile.branch || "",
        mobileNumber: userProfile.mobileNumber || "",
        email: userProfile.email || ""
      });
      setIsDataLoaded(true);
    }
  }, [userProfile, isDataLoaded]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Mobile number validation
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be exactly 10 digits";
    }

    // Roll number validation
    if (formData.rollNo && formData.rollNo.trim().length < 3) {
      newErrors.rollNo = "Roll number must be at least 3 characters";
    }

    // Branch validation
    if (formData.branch && formData.branch.trim().length < 2) {
      newErrors.branch = "Branch must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await updateProfile({
        name: formData.name,
        rollNo: formData.rollNo || undefined,
        branch: formData.branch || undefined,
        mobileNumber: formData.mobileNumber || undefined,
        email: formData.email || undefined,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while data is being fetched
  if (!userProfile && user) {
    return (
      <Protected>
        <NavBar items={navItems} />
        <div className="fixed top-0 right-6 z-50 pt-6">
          <ThemeSwitcher />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <NavBar items={navItems} />
      
      {/* Theme Switcher positioned in top-right corner, aligned with navbar */}
      <div className="fixed top-0 right-6 z-50 pt-6">
        <ThemeSwitcher />
      </div>
      
      {/* Profile title */}
      <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80 dark:from-white dark:to-white/80">
            Profile
          </h1>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="pt-48 flex justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="bg-gray-50 dark:bg-gray-800 shadow-lg border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Profile
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Update your details below
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div>
                <Input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full h-12 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 border-2 rounded-lg shadow-sm transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Roll No Field */}
              <div>
                <Input
                  type="text"
                  placeholder="Roll No."
                  value={formData.rollNo}
                  onChange={(e) => handleInputChange('rollNo', e.target.value)}
                  className={`w-full h-12 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 border-2 rounded-lg shadow-sm transition-all duration-200 ${
                    errors.rollNo 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                  }`}
                />
                {errors.rollNo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rollNo}</p>
                )}
              </div>

              {/* Branch Field */}
              <div>
                <Input
                  type="text"
                  placeholder="Branch"
                  value={formData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  className={`w-full h-12 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 border-2 rounded-lg shadow-sm transition-all duration-200 ${
                    errors.branch 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                  }`}
                />
                {errors.branch && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.branch}</p>
                )}
              </div>

              {/* Mobile Number Field */}
              <div>
                <Input
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  className={`w-full h-12 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 border-2 rounded-lg shadow-sm transition-all duration-200 ${
                    errors.mobileNumber 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                  }`}
                />
                {errors.mobileNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mobileNumber}</p>
                )}
              </div>

              {/* Email Address Field */}
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full h-12 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 border-2 rounded-lg shadow-sm transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Save Changes Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Protected>
  );
}