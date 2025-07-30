import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Badge } from './badge';
import { LucideIcon } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useNavigate } from 'react-router';

interface BrutalistSportsCardProps {
  sport: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  icon: LucideIcon;
  eventId: Id<"events">;
}

export const BrutalistSportsCard: React.FC<BrutalistSportsCardProps> = ({
  sport,
  title,
  date,
  time,
  venue,
  icon: Icon,
  eventId,
}) => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate(`/event/${sport.toLowerCase()}`);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative max-w-sm w-full bg-white dark:bg-card border-4 border-black dark:border-white rounded-lg overflow-hidden shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]"
    >
      <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-12 w-12 text-primary" />
          <Badge variant="destructive" className="text-sm font-bold tracking-tighter border-2 border-black dark:border-white">
            {sport}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-extrabold tracking-tighter mb-3 text-foreground">{title}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground font-mono">
            <span className="font-semibold mr-2">Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground font-mono">
            <span className="font-semibold mr-2">Time:</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground font-mono">
            <span className="font-semibold mr-2">Venue:</span>
            <span>{venue}</span>
          </div>
        </div>
        <Button
          onClick={handleRegisterClick}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black dark:border-white rounded-md py-3 text-lg tracking-tighter"
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
};