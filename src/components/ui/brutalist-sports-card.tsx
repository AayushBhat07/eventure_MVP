import React from 'react';
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Calendar, Clock, MapPin } from "lucide-react";

interface BrutalistSportsCardProps {
  sport: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  icon: React.ComponentType<any>;
  viewPath?: string;
}

const BrutalistSportsCard: React.FC<BrutalistSportsCardProps> = ({ 
  sport, 
  title, 
  date, 
  time, 
  venue, 
  icon: Icon, 
  viewPath 
}) => {
  const navigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("View Details clicked for:", title);
    toast.info(`Opening details for ${title}...`);
    if (viewPath) {
      navigate(viewPath);
    }
  };
  
  const handleRegisterNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Register Now clicked for:", title);
    toast.success(`Successfully registered for ${title}!`);
  };

  return (
    <div 
      className="w-80 p-5 bg-white dark:bg-neutral-900 border-[6px] border-black dark:border-white m-4 relative"
      style={{
        boxShadow: '12px 12px 0 #000',
        transition: 'transform 0.3s, box-shadow 0.3s',
        zIndex: 1
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(-5px, -5px)';
        e.currentTarget.style.boxShadow = '17px 17px 0 #000';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translate(0, 0)';
        e.currentTarget.style.boxShadow = '12px 12px 0 #000';
      }}
    >
      <div className="flex items-center gap-3 mb-4 pb-4 border-b-[3px] border-black dark:border-white">
        <div className="flex-shrink-0 bg-black dark:bg-white text-white dark:text-black p-2.5 flex items-center justify-center">
          <Icon size={24} />
        </div>
        <span className="text-2xl font-black text-black dark:text-white uppercase flex-1">
          {sport}
        </span>
      </div>
      
      <div className="mb-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white mb-2">
          <Calendar size={16} />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white mb-2">
          <Clock size={16} />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white mb-2">
          <MapPin size={16} />
          <span>{venue}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 relative" style={{ zIndex: 10 }}>
        <button 
          onClick={handleViewDetails}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          className="w-full border-[3px] border-black dark:border-white bg-black dark:bg-white text-white dark:text-black py-3 px-4 text-base font-bold uppercase transition-transform hover:bg-green-500 hover:text-black"
          style={{ 
            cursor: 'pointer',
            position: 'relative',
            zIndex: 100
          }}
        >
          View Details →
        </button>
        <button 
          onClick={handleRegisterNow}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          className="w-full border-[3px] border-black dark:border-white bg-red-500 text-white py-3 px-4 text-base font-bold uppercase transition-transform hover:bg-red-600"
          style={{ 
            cursor: 'pointer',
            position: 'relative',
            zIndex: 100
          }}
        >
          Register Now!
        </button>
      </div>
    </div>
  );
}

export { BrutalistSportsCard };