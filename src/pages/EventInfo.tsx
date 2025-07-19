import { useParams, useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy,
  Timer,
  IndianRupee
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';

// Fix for default markers in react-leaflet
const DefaultIcon = L.divIcon({
  html: `<div style="background-color: #1B3C53; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #F9F3EF;"></div>`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface EventData {
  id: string;
  title: string;
  sport: string;
  emoji: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  coordinates: [number, number];
  description: string;
  rules: string[];
  registrationFee: number;
  maxParticipants: number;
  currentParticipants: number;
  registrationDeadline: number;
  image: string;
  organizers: {
    name: string;
    role: string;
    image: string;
  }[];
}

const eventData: { [key: string]: EventData } = {
  "badminton": {
    id: "badminton",
    title: "Intra-Diploma Badminton Tournament",
    sport: "Badminton",
    emoji: "🏸",
    date: "Friday, April 07",
    time: "09:30 AM",
    venue: "Agnel PolyTechnic Court (7th Floor)",
    address: "Vashi, Navi Mumbai, Maharashtra 400703",
    coordinates: [19.0760, 73.0777],
    description: "Join us for an exciting badminton tournament featuring singles, doubles, and mixed doubles categories. Open to all skill levels with professional coaching available.",
    rules: [
      "Best of 3 games, each to 21 points (max 30)",
      "Rally scoring system used",
      "Service alternates every 2 points (singles), diagonally",
      "Switch sides after each game",
      "In doubles, players alternate serves and positions",
      "Faults: out of bounds, net touch, double hit",
      "Referee's decision is final"
    ],
    registrationFee: 150,
    maxParticipants: 32,
    currentParticipants: 24,
    registrationDeadline: Date.now() + (2 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1544717684-7ba720c2b5ea?w=800&h=400&fit=crop",
    organizers: [
      {
        name: "Rahul Sharma",
        role: "Tournament Director",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      {
        name: "Priya Patel",
        role: "Sports Coordinator",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
      },
      {
        name: "Amit Kumar",
        role: "Referee",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  "basketball": {
    id: "basketball",
    title: "Inter-College Basketball Championship",
    sport: "Basketball",
    emoji: "🏀",
    date: "Saturday, April 08",
    time: "02:00 PM",
    venue: "Main Basketball Court",
    address: "Sports Complex, Agnel PolyTechnic, Vashi",
    coordinates: [19.0760, 73.0777],
    description: "High-energy basketball championship with teams from various colleges competing for the ultimate trophy.",
    rules: [
      "4 quarters of 12 minutes each",
      "5 players per team on court",
      "24-second shot clock",
      "6 team fouls per quarter",
      "Overtime: 5 minutes if tied",
      "Standard FIBA rules apply"
    ],
    registrationFee: 200,
    maxParticipants: 30,
    currentParticipants: 28,
    registrationDeadline: Date.now() + (1 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop",
    organizers: [
      {
        name: "Coach Mike Johnson",
        role: "Head Coach",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face"
      },
      {
        name: "Sarah Williams",
        role: "Event Manager",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  "football": {
    id: "football",
    title: "Annual Football Championship",
    sport: "Football",
    emoji: "⚽",
    date: "Sunday, April 09",
    time: "05:00 PM",
    venue: "Main Football Ground",
    address: "Agnel PolyTechnic Sports Ground, Vashi",
    coordinates: [19.0760, 73.0777],
    description: "The most anticipated football event of the year with teams battling for glory on the field.",
    rules: [
      "90 minutes (45 min each half)",
      "11 players per team",
      "3 substitutions allowed",
      "Offside rule applies",
      "Yellow/Red card system",
      "FIFA standard rules"
    ],
    registrationFee: 300,
    maxParticipants: 22,
    currentParticipants: 18,
    registrationDeadline: Date.now() + (3 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop",
    organizers: [
      {
        name: "David Rodriguez",
        role: "Tournament Director",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
      },
      {
        name: "Maria Garcia",
        role: "Referee Coordinator",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
      }
    ]
  }
};

// Countdown Timer Component
const CountdownTimer = ({ deadline }: { deadline: number }) => {
  const [timeLeft, setTimeLeft] = useState(deadline - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = deadline - Date.now();
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "Registration Closed";
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isUrgent = timeLeft <= 24 * 60 * 60 * 1000;
  const isCritical = timeLeft <= 2 * 60 * 60 * 1000;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      timeLeft <= 0 
        ? 'bg-red-500/20 text-red-600' 
        : isCritical 
          ? 'bg-red-500/20 text-red-600' 
          : isUrgent 
            ? 'bg-orange-500/20 text-orange-600' 
            : 'bg-green-500/20 text-green-600'
    }`}>
      <Timer className="h-4 w-4" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default function EventInfo() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const event = eventData[eventId as string];

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    setIsRegistering(true);
    // Simulate registration process
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Successfully registered for the event!");
    setIsRegistering(false);
  };

  const progressPercentage = (event.currentParticipants / event.maxParticipants) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border"
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Event Details</h1>
            <p className="text-sm text-muted-foreground">{event.sport}</p>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden mb-6">
            <div 
              className="relative h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Event Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                  {event.emoji} {event.sport}
                </Badge>
              </div>

              {/* Registration Timer */}
              <div className="absolute top-4 right-4">
                <CountdownTimer deadline={event.registrationDeadline} />
              </div>

              {/* Event Title */}
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-white text-2xl font-bold mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Event Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-6"
        >
          {/* Description & Rules */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">About This Event</h2>
              <p className="text-muted-foreground mb-6">{event.description}</p>
              
              <h3 className="text-lg font-semibold text-foreground mb-3">Tournament Rules</h3>
              <ul className="space-y-2">
                {event.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold">{index + 1}.</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Registration Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Registration Details</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Registration Fee</span>
                  <div className="flex items-center gap-1 font-semibold text-foreground">
                    <IndianRupee className="h-4 w-4" />
                    {event.registrationFee}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-semibold text-foreground">
                    {event.currentParticipants}/{event.maxParticipants}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {event.maxParticipants - event.currentParticipants} spots remaining
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleRegister}
                disabled={isRegistering || event.currentParticipants >= event.maxParticipants}
                className="w-full"
                size="lg"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Registering...
                  </>
                ) : event.currentParticipants >= event.maxParticipants ? (
                  "Event Full"
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Register Now!
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Event Location</h2>
              
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">{event.venue}</h3>
                  <p className="text-muted-foreground text-sm">{event.address}</p>
                </div>
              </div>

              {/* Map */}
              <div className="h-64 rounded-lg overflow-hidden border border-border">
                <MapContainer
                  center={event.coordinates as [number, number]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={event.coordinates as [number, number]}>
                    <Popup>
                      <div className="text-center">
                        <h3 className="font-semibold">{event.venue}</h3>
                        <p className="text-sm text-gray-600">{event.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Organizers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Council In-charges For The Event</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {event.organizers.map((organizer, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                  >
                    <img
                      src={organizer.image}
                      alt={organizer.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{organizer.name}</h3>
                      <p className="text-muted-foreground text-xs">{organizer.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}