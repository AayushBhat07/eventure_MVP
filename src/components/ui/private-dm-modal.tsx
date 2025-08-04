import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/use-auth';
import { X, Paperclip, Send } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import EmojiPicker from 'emoji-picker-react';

interface PrivateDMModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: Id<"users"> | Id<"teamMembers">;
  recipientName: string;
  recipientRole?: string;
}

interface PrivateMessage {
  _id: Id<"private_messages">;
  _creationTime: number;
  senderId: Id<"users">;
  receiverId: Id<"users">;
  message: string;
  timestamp: number;
  attachments?: Array<{
    name: string;
    url: string;
    type: "image" | "video" | "pdf" | "docx" | "other";
    size?: number;
  }>;
  reactions?: Record<string, Id<"users">[]>;
  readBy?: Id<"users">[];
  senderName?: string;
  receiverName?: string;
}

const PrivateDMModal: React.FC<PrivateDMModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientRole = "Member"
}) => {
  const { user: currentUser } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Skip the query for now to prevent ID mismatch error
  const messages: PrivateMessage[] | undefined = undefined;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when modal opens (disabled for now)
  useEffect(() => {
    if (isOpen && messages && currentUser) {
      // Temporarily disabled to prevent errors
      // messages.forEach(message => {
      //   if (message.senderId !== currentUser._id && 
      //       (!message.readBy || !message.readBy.includes(currentUser._id))) {
      //     markAsRead({ messageId: message._id });
      //   }
      // });
    }
  }, [isOpen, messages, currentUser]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || isPosting) return;

    // For now, show a toast that this is a demo
    toast.success('DM functionality is being set up. This is a demo interface.');
    setMessageText('');
    return;
  };

  const handleEmojiReaction = async (messageId: Id<"private_messages">, emoji: string) => {
    // Temporarily disabled
    toast.success('Emoji reactions will be available soon!');
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-[#f9f9f9] border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col">
        
        {/* Header */}
        <div className="border-b-4 border-black p-6 flex items-center justify-between bg-[#eaeaea]">
          <div className="flex items-center gap-4">
            {/* Recipient Avatar */}
            <div className="w-16 h-16 rounded-full border-4 border-black bg-white flex items-center justify-center">
              <span className="text-xl font-mono font-bold">
                {getInitials(recipientName)}
              </span>
            </div>
            
            {/* Recipient Info */}
            <div>
              <h2 className="text-2xl font-mono font-bold tracking-tight uppercase">
                {recipientName} – {recipientRole}
              </h2>
              <p className="text-sm font-mono text-gray-600 uppercase">PRIVATE MESSAGE</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-12 h-12 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors duration-200 flex items-center justify-center font-bold text-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Show demo message for now */}
          <div className="text-center py-12">
            <h3 className="text-xl font-mono font-bold text-gray-600 mb-2 uppercase">DM INTERFACE READY</h3>
            <p className="text-gray-500 font-mono uppercase">Private messaging with {recipientName} will be available soon.</p>
            <p className="text-gray-500 font-mono uppercase text-sm mt-2">This is a demo of the brutalist DM interface.</p>
            
            {/* Demo Message Bubbles */}
            <div className="mt-8 space-y-4">
              {/* Received Message Demo */}
              <div className="flex justify-start">
                <div className="max-w-[70%]">
                  <div className="p-4 border-4 border-black font-mono bg-[#eaeaea] mr-4">
                    <p className="text-sm leading-relaxed">
                      Hey! This is what a received message looks like in the brutalist DM interface.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-gray-600">
                    <span>14:30</span>
                  </div>
                </div>
              </div>

              {/* Sent Message Demo */}
              <div className="flex justify-end">
                <div className="max-w-[70%]">
                  <div className="p-4 border-4 border-black font-mono bg-white ml-4">
                    <p className="text-sm leading-relaxed">
                      And this is what your sent messages will look like! Clean, bold, and brutalist.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-gray-600 justify-end">
                    <span>14:31</span>
                    <span className="font-bold uppercase">READ ✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t-4 border-black p-6 bg-[#eaeaea]">
          <div className="flex gap-4">
            {/* Message Input */}
            <div className="flex-1">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="TYPE YOUR MESSAGE..."
                className="w-full h-20 p-3 border-4 border-black font-mono text-sm resize-none focus:outline-none bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="px-4 py-2 border-4 border-black bg-white hover:bg-gray-100 font-mono text-sm font-bold uppercase"
              >
                😀
              </button>

              {/* Attach Button */}
              <button className="px-4 py-2 border-4 border-black bg-white hover:bg-gray-100 font-mono text-sm font-bold uppercase">
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isPosting}
                className={`px-6 py-2 border-4 border-black font-mono text-sm font-bold uppercase transition-colors ${
                  messageText.trim() && !isPosting
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isPosting ? 'SENDING...' : 'SEND'}
              </button>
            </div>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mt-4 border-4 border-black">
              <div className="p-4 bg-white">
                <p className="font-mono text-sm font-bold uppercase">EMOJI PICKER COMING SOON!</p>
                <div className="flex gap-2 mt-2">
                  {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-8 h-8 border-2 border-black hover:bg-gray-100"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateDMModal;