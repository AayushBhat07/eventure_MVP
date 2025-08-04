import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { User, Menu, Lock } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface TeamMember {
  _id: Id<"teamMembers"> | Id<"users">;
  name: string;
  email?: string;
  role?: string;
  image?: string;
}

interface AvatarDockProps {
  onStartDM?: (userId: Id<"teamMembers"> | Id<"users">) => void;
}

const AvatarDock: React.FC<AvatarDockProps> = ({ onStartDM }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Get all team members and users
  const teamMembers = useQuery(api.team.getAllTeamMembers);
  const users = useQuery(api.users.getAllUsers);

  // Combine and deduplicate team members and users
  const allMembers: TeamMember[] = React.useMemo(() => {
    const members: TeamMember[] = [];
    
    // Add team members
    if (teamMembers) {
      teamMembers.forEach(member => {
        members.push({
          _id: member._id,
          name: member.name,
          email: member.email,
          role: member.role || 'Volunteer',
          image: undefined, // Team members don't have images in current schema
        });
      });
    }

    // Add users (excluding current user)
    if (users && user) {
      users.forEach((u: any) => {
        if (u._id !== user._id) {
          members.push({
            _id: u._id,
            name: u.name || 'User',
            email: u.email,
            role: u.role || 'User',
            image: u.image,
          });
        }
      });
    }

    return members;
  }, [teamMembers, users, user]);

  const handleAvatarClick = (member: TeamMember) => {
    const isAdmin = user?.role === 'admin';
    
    if (isAdmin && onStartDM) {
      onStartDM(member._id);
    } else {
      setShowAccessDenied(true);
    }
  };

  const renderAvatar = (member: TeamMember) => {
    const initials = member.name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        key={member._id}
        className="relative group"
        onMouseEnter={() => setHoveredUser(member._id)}
        onMouseLeave={() => setHoveredUser(null)}
      >
        <button
          onClick={() => handleAvatarClick(member)}
          className="w-12 h-12 border-3 border-black dark:border-white bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center cursor-pointer"
        >
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-black dark:text-white" />
          )}
        </button>

        {/* Tooltip */}
        {hoveredUser === member._id && (
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 z-50">
            <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 border-2 border-black dark:border-white whitespace-nowrap font-mono text-sm">
              <div className="font-bold">{member.name}</div>
              <div className="text-xs opacity-80">{member.role}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isExpanded) {
    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-12 h-12 border-3 border-black dark:border-white bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center"
        >
          <Menu className="w-6 h-6 text-black dark:text-white" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col">
        {/* Avatar Container */}
        <div className="bg-white dark:bg-black border-3 border-black dark:border-white max-h-[60vh] overflow-y-auto">
          <div className="flex flex-col gap-1 p-2">
            {allMembers.map(renderAvatar)}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(false)}
          className="w-12 h-12 border-3 border-black dark:border-white border-t-0 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center"
        >
          <Menu className="w-6 h-6 text-black dark:text-white" />
        </button>
      </div>

      {/* Access Denied Modal */}
      <Dialog open={showAccessDenied} onOpenChange={setShowAccessDenied}>
        <DialogContent className="max-w-md bg-white dark:bg-black border-3 border-black dark:border-white font-mono">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Lock className="w-6 h-6" />
              ADMIN ACCESS REQUIRED
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm font-mono">
              Only admins can start direct messages.
            </p>
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowAccessDenied(false)}
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-mono border-2 border-black dark:border-white"
              >
                DISMISS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarDock;