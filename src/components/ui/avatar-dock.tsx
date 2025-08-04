import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  image?: string;
}

interface AvatarDockProps {
  users?: User[];
}

const AvatarDock: React.FC<AvatarDockProps> = ({ users = [] }) => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Mock users for demonstration if none provided
  const mockUsers: User[] = [
    { id: '1', name: 'ADMIN USER', image: undefined },
    { id: '2', name: 'JOHN SMITH', image: undefined },
    { id: '3', name: 'JANE DOE', image: undefined },
    { id: '4', name: 'MIKE WILSON', image: undefined },
    { id: '5', name: 'SARAH JONES', image: undefined },
  ];

  const displayUsers = users.length > 0 ? users : mockUsers;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = (userId: string) => {
    // Placeholder function - no action for now
    console.log('Avatar clicked:', userId);
  };

  return (
    <div id="avatar-dock" className="fixed right-4 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-2">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            className="relative"
            onMouseEnter={() => setHoveredUser(user.id)}
            onMouseLeave={() => setHoveredUser(null)}
          >
            {/* Avatar */}
            <button
              onClick={() => handleAvatarClick(user.id)}
              className="w-16 h-16 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center cursor-pointer font-mono font-bold"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-black dark:text-white text-lg font-bold">
                  {getInitials(user.name)}
                </span>
              )}
            </button>

            {/* Tooltip */}
            {hoveredUser === user.id && (
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 z-50">
                <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 border-2 border-black dark:border-white whitespace-nowrap font-mono text-sm font-bold">
                  {user.name}
                  {/* Tooltip arrow */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-black dark:border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarDock;
