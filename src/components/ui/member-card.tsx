import React from 'react';
import { Button } from './button';
import { motion } from 'framer-motion';
import { Id } from '@/convex/_generated/dataModel';

interface Member {
  _id: Id<"teamMembers">;
  name: string;
  rollNo: string;
  branch: string;
  phone: string;
  email: string;
  role?: string;
  volunteerEvents?: Id<"events">[];
}

interface MemberCardProps {
  member: Member;
  onEdit: () => void;
  isHovered: boolean;
  hideEdit?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit, isHovered, hideEdit }) => {
  return (
    <motion.div
      className="relative bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] transition-all duration-300 rounded-lg z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        transform: isHovered ? 'scale(1.05) translateX(-4px) translateY(-4px)' : 'scale(1) translateX(0) translateY(0)',
        boxShadow: isHovered ? '12px 12px 0px #000' : '8px 8px 0px #000',
        zIndex: isHovered ? 20 : 10,
      }}
    >
      {/* Default view - Name and Branch only */}
      <div className={`p-6 ${isHovered ? 'hidden' : 'block'}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              {member.name}
            </h3>
            <div className="mt-2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase tracking-wider inline-block">
              {member.branch}
            </div>
          </div>
          {!hideEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="border-2 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              EDIT
            </Button>
          )}
        </div>
      </div>

      {/* Expanded view on hover - All details */}
      <div className={`p-6 ${isHovered ? 'block' : 'hidden'}`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            {member.name}
          </h3>
          {!hideEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="border-2 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              EDIT
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="border-2 border-black dark:border-white p-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">ROLE</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{member.role || 'VOLUNTEER'}</div>
          </div>
          
          <div className="border-2 border-black dark:border-white p-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">ROLL NO</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{member.rollNo}</div>
          </div>
          
          <div className="border-2 border-black dark:border-white p-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">BRANCH</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{member.branch}</div>
          </div>
          
          <div className="border-2 border-black dark:border-white p-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">PHONE</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{member.phone}</div>
          </div>
          
          <div className="border-2 border-black dark:border-white p-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">EMAIL</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white break-all">{member.email}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemberCard;