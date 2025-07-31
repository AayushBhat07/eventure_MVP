import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Target,
  User,
  Plus,
  CheckSquare,
  Square,
  Settings,
  Bell,
  LayoutDashboard,
  Home
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { MenuBar } from '@/components/ui/glow-menu';
import { ThemeProvider, useTheme } from 'next-themes';

const todos = [
  { id: 1, text: "Review event proposals", completed: false },
  { id: 2, text: "Update venue bookings", completed: true },
  { id: 3, text: "Send participant confirmations", completed: false },
  { id: 4, text: "Prepare certificates", completed: false }
];

function AdminDashboardContent() {
  const { theme, setTheme } = useTheme();
  const allUsers = useQuery(api.users.listAll);
  const availableVolunteers = allUsers || [];
  
  // Fetch real event data
  const currentOngoingEvent = useQuery(api.events.getCurrentOngoingEvent);
  const nextUpcomingEvent = useQuery(api.events.getNextUpcomingEvent);
  const allEvents = useQuery(api.events.getAllEvents);
  const upcomingEvents = useQuery(api.events.getUpcomingEvents);

  // Calculate real stats
  const totalEvents = allEvents?.length || 0;
  const upcomingEventsCount = upcomingEvents?.length || 0;
  const completedEvents = allEvents?.filter(event => event.status === "completed").length || 0;
  const activeParticipants = 156; // This would need a separate query for registrations

  const stats = [
    { title: "TOTAL EVENTS", value: totalEvents.toString(), icon: CalendarIcon, color: "bg-yellow-400" },
    { title: "ACTIVE PARTICIPANTS", value: activeParticipants.toString(), icon: Users, color: "bg-green-400" },
    { title: "COMPLETED EVENTS", value: completedEvents.toString(), icon: Target, color: "bg-blue-400" },
    { title: "UPCOMING EVENTS", value: upcomingEventsCount.toString(), icon: Clock, color: "bg-red-400" }
  ];

  const [todoList, setTodoList] = useState(todos);
  const [newTodo, setNewTodo] = useState("");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [selectedVolunteers, setSelectedVolunteers] = useState<Id<"users">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEventAsAdmin = useMutation(api.events.createEventAsAdmin);

  const toggleVolunteer = (volunteerId: Id<"users">) => {
    setSelectedVolunteers(prev =>
      prev.includes(volunteerId)
        ? prev.filter(id => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: todoList.length + 1,
        text: newTodo,
        completed: false
      };
      setTodoList([...todoList, newTodoItem]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodoList(todoList.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const eventName = formData.get("eventName") as string;
    const venue = formData.get("venue") as string;
    const eventDate = formData.get("eventDate") as string;
    const eventTime = formData.get("eventTime") as string;
    const description = formData.get("description") as string;
    const maxParticipants = formData.get("maxParticipants") as string;

    if (!eventName?.trim() || !venue?.trim() || !eventDate || !eventTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const adminData = sessionStorage.getItem("adminUser");
      if (!adminData) {
        toast.error("Admin session expired. Please sign in again.");
        setIsSubmitting(false);
        return;
      }

      const admin = JSON.parse(adminData);
      
      const volunteerIds = selectedVolunteers;

      const result = await createEventAsAdmin({
        name: eventName,
        description: description || "",
        venue: venue,
        eventDate: eventDate,
        eventTime: eventTime,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        volunteerIds,
        adminEmail: admin.email,
      });

      if (result.success) {
        toast.success(result.message);
        e.currentTarget.reset();
        setSelectedVolunteers([]);
        setIsCreateEventOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Event creation error:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: todoList.length + 1,
        text: newTodo,
        completed: false
      };
      setTodoList([...todoList, newTodoItem]);
      setNewTodo("");
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  };

  // Helper function to format date and time
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

  // Format events for calendar
  const calendarEvents = allEvents?.map(event => ({
    date: new Date(event.startDate).toISOString().split('T')[0],
    title: event.name
  })) || [];

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, label: "Dashboard", href: "#", gradient: "from-blue-500 to-purple-600", iconColor: "text-blue-400" },
    { name: "Events", icon: CalendarIcon, label: "Events", href: "#", gradient: "from-green-500 to-cyan-600", iconColor: "text-green-400" },
    { name: "Users", icon: Users, label: "Users", href: "#", gradient: "from-red-500 to-orange-600", iconColor: "text-red-400" },
    { name: "Settings", icon: Settings, label: "Settings", href: "#", gradient: "from-yellow-500 to-amber-600", iconColor: "text-yellow-400" },
    { name: "Notifications", icon: Bell, label: "Notifications", href: "#", gradient: "from-pink-500 to-rose-600", iconColor: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header Section */}
      <header className="border-b-2 border-black dark:border-white/20 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">EVENT ADMIN DASHBOARD</h1>
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
        <MenuBar items={menuItems} activeItem={activeMenuItem} onItemClick={setActiveMenuItem} />
      </div>

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Event - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-card border-4 border-black dark:border-white p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 tracking-tighter">CURRENT EVENT</h2>
              {currentOngoingEvent ? (
                <div className="bg-yellow-400 text-black p-6 border-2 border-black">
                  <h3 className="text-3xl font-bold mb-2 tracking-tighter uppercase">
                    {currentOngoingEvent.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-lg font-bold">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      {formatEventDateTime(currentOngoingEvent.startDate).eventDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {formatEventDateTime(currentOngoingEvent.startDate).eventTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {currentOngoingEvent.venue}
                    </div>
                  </div>
                  {currentOngoingEvent.description && (
                    <p className="mt-3 text-base font-medium">
                      {currentOngoingEvent.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-200 dark:bg-gray-800 text-center p-6 border-2 border-black dark:border-white">
                  <h3 className="text-2xl font-bold mb-2 tracking-tighter">
                    NO CURRENT ONGOING EVENT
                  </h3>
                  <p className="text-lg font-medium text-muted-foreground">
                    No events are currently running
                  </p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className={`${stat.color} text-black p-4 border-2 border-black dark:border-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold tracking-tighter">{stat.title}</p>
                      <p className="text-3xl font-bold tracking-tighter">{stat.value}</p>
                    </div>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Event */}
            <div className="bg-card border-4 border-black dark:border-white p-6">
              <h2 className="text-xl font-bold mb-4 tracking-tighter">UPCOMING EVENT</h2>
              {nextUpcomingEvent ? (
                <div className="bg-blue-400 text-black p-4 border-2 border-black">
                  <h3 className="text-lg font-bold mb-2 tracking-tighter uppercase">
                    {nextUpcomingEvent.name}
                  </h3>
                  <div className="space-y-1 text-sm font-bold">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatEventDateTime(nextUpcomingEvent.startDate).eventDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatEventDateTime(nextUpcomingEvent.startDate).eventTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {nextUpcomingEvent.venue}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-200 dark:bg-gray-800 text-center p-4 border-2 border-black dark:border-white">
                  <h3 className="text-lg font-bold mb-2 tracking-tighter">
                    NO UPCOMING EVENTS
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    No events scheduled
                  </p>
                </div>
              )}
            </div>

            {/* Create New Event */}
            <section className="border-2 border-black dark:border-white/20 p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4 tracking-tight">CREATE NEW EVENT</h2>
              <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-mono text-lg px-8 py-4 border-2 border-black dark:border-white"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    CREATE NEW EVENT
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-2 border-black dark:border-white font-mono">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">CREATE NEW EVENT</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="eventName" className="text-sm font-bold mb-2 block">EVENT NAME</Label>
                        <Input 
                          id="eventName"
                          name="eventName"
                          className="border-2 border-black dark:border-white font-mono text-base p-3"
                          placeholder="Enter event name"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="venue" className="text-sm font-bold mb-2 block">VENUE</Label>
                        <Input 
                          id="venue"
                          name="venue"
                          className="border-2 border-black dark:border-white font-mono text-base p-3"
                          placeholder="Enter venue"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="eventDate" className="text-sm font-bold mb-2 block">EVENT DATE</Label>
                        <Input 
                          id="eventDate"
                          name="eventDate"
                          type="date"
                          className="border-2 border-black dark:border-white font-mono text-base p-3"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventTime" className="text-sm font-bold mb-2 block">START TIME</Label>
                        <Input 
                          id="eventTime"
                          name="eventTime"
                          type="time"
                          className="border-2 border-black dark:border-white font-mono text-base p-3"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="maxParticipants" className="text-sm font-bold mb-2 block">MAX PARTICIPANTS</Label>
                      <Input 
                        id="maxParticipants"
                        name="maxParticipants"
                        type="number"
                        className="border-2 border-black dark:border-white font-mono text-base p-3"
                        placeholder="Enter maximum participants"
                        min="1"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-bold mb-2 block">DESCRIPTION</Label>
                      <Textarea 
                        id="description"
                        name="description"
                        className="border-2 border-black dark:border-white font-mono text-base p-3 min-h-[100px]"
                        placeholder="Enter event description"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-bold mb-3 block">ASSIGN VOLUNTEERS</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-black dark:border-white p-2">
                        {availableVolunteers.map((volunteer) => (
                          <div key={volunteer._id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <button
                              type="button"
                              onClick={() => toggleVolunteer(volunteer._id)}
                              className="flex-shrink-0"
                              disabled={isSubmitting}
                            >
                              {selectedVolunteers.includes(volunteer._id) ? (
                                <CheckSquare className="h-5 w-5 text-black dark:text-white" />
                              ) : (
                                <Square className="h-5 w-5 text-black dark:text-white" />
                              )}
                            </button>
                            <div>
                              <div className="font-bold">{volunteer.name}</div>
                              <div className="text-sm text-gray-500">{volunteer.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit"
                        className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-mono text-base py-3 border-2 border-black dark:border-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'CREATING...' : 'CREATE EVENT'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateEventOpen(false);
                          setSelectedVolunteers([]);
                        }}
                        className="flex-1 border-2 border-black dark:border-white font-mono text-base py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={isSubmitting}
                      >
                        CANCEL
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </section>

            {/* Calendar */}
            <div className="bg-card border-4 border-black dark:border-white p-6">
              <h2 className="text-xl font-bold mb-4 tracking-tighter">CALENDAR</h2>
              <div className="grid grid-cols-7 gap-2 text-center font-bold text-sm">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 3;
                  const date = `2024-12-${String(day).padStart(2, '0')}`;
                  const hasEvent = calendarEvents.find((e: { date: string }) => e.date === date);
                  return (
                    <div
                      key={i}
                      className={`
                        p-2 text-center text-sm border-2 border-black dark:border-white
                        ${day > 0 && day <= 31 ? '' : 'text-muted-foreground'}
                        ${hasEvent ? 'bg-yellow-400 text-black font-bold' : ''}
                      `}
                    >
                      {day > 0 && day <= 31 ? day : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Todo List */}
            <div className="border-2 border-black p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckSquare className="w-6 h-6" />
                <h2 className="text-xl font-bold">TODO LIST</h2>
              </div>
              
              {/* Add new todo */}
              <div className="flex gap-2 mb-6">
                <Input 
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="border-2 border-black font-mono flex-1"
                  placeholder="ADD NEW TASK"
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <Button 
                  onClick={addTodo}
                  className="bg-black text-white hover:bg-gray-800 font-bold px-4 border-0"
                >
                  ADD
                </Button>
              </div>

              {/* Todo items */}
              <div className="space-y-3">
                {todoList.map(todo => (
                  <div 
                    key={todo.id} 
                    className={`flex items-center gap-3 p-3 border border-black cursor-pointer hover:bg-gray-100 ${
                      todo.completed ? 'bg-gray-50 text-gray-600' : ''
                    }`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <div className="w-5 h-5 border-2 border-black flex items-center justify-center">
                      {todo.completed ? (
                        <div className="w-3 h-3 bg-black"></div>
                      ) : null}
                    </div>
                    <span className={`font-bold text-sm ${todo.completed ? 'line-through' : ''}`}>
                      {todo.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminDashboardContent />
    </ThemeProvider>
  )
}