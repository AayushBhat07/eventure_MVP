import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/use-auth';
import { X, Paperclip, Send } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';

interface PrivateDMModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: Id<"users"> | Id<"teamMembers">;
  recipientName: string;
  recipientRole?: string;
}

interface DirectMessage {
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

  // Live query for direct messages
  const messages = useQuery(
    api.privateMessages.getDirectMessages,
    isOpen && currentUser ? { recipientId } : "skip"
  ) as DirectMessage[] | undefined;

  // Mutations for sending messages and reactions
  const sendMessage = useMutation(api.privateMessages.sendDirectMessage);
  const markAsRead = useMutation(api.privateMessages.markPrivateMessageAsRead);
  const toggleReaction = useMutation(api.privateMessages.togglePrivateMessageReaction);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when modal opens or new messages arrive
  useEffect(() => {
    if (isOpen && messages && currentUser) {
      messages.forEach(message => {
        if (message.senderId !== currentUser._id && 
            (!message.readBy || !message.readBy.includes(currentUser._id))) {
          markAsRead({ messageId: message._id });
        }
      });
    }
  }, [isOpen, messages, currentUser, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || isPosting) return;

    setIsPosting(true);
    try {
      const result = await sendMessage({
        recipientId,
        message: messageText.trim(),
      });

      if (result.success) {
        setMessageText('');
        toast.success('Message sent!');
      } else {
        toast.error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsPosting(false);
    }
  };

  const handleEmojiReaction = async (messageId: Id<"private_messages">, emoji: string) => {
    try {
      const result = await toggleReaction({ messageId, emoji });
      if (!result.success) {
        toast.error(result.message || 'Failed to toggle reaction');
      }
    } catch (error) {
      console.error('Toggle reaction error:', error);
      toast.error('Failed to toggle reaction');
    }
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

  const isMessageRead = (message: DirectMessage): boolean => {
    if (message.senderId === currentUser?._id) {
      // For sent messages, check if recipient has read it
      return message.readBy ? message.readBy.length > 1 : false;
    }
    return true; // Received messages are always considered "read" for display
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
          {/* Loading State */}
          {messages === undefined && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-black border-t-transparent animate-spin"></div>
              <p className="text-gray-500 font-mono uppercase mt-4">LOADING MESSAGES...</p>
            </div>
          )}

          {/* Empty State */}
          {messages && messages.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-mono font-bold text-gray-600 mb-2 uppercase">NO MESSAGES YET</h3>
              <p className="text-gray-500 font-mono uppercase">Start the conversation with {recipientName}!</p>
            </div>
          )}

          {/* Messages */}
          {messages && messages.length > 0 && messages.map((message) => {
            const isSent = message.senderId === currentUser?._id;
            const messageRead = isMessageRead(message);

            return (
              <div key={message._id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[70%]">
                  <div className={`p-4 border-4 border-black font-mono ${
                    isSent ? 'bg-white ml-4' : 'bg-[#eaeaea] mr-4'
                  }`}>
                    <p className="text-sm leading-relaxed">
                      {message.message}
                    </p>
                    
                    {/* Reactions */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {Object.entries(message.reactions).map(([emoji, userIds]) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiReaction(message._id, emoji)}
                            className={`px-2 py-1 text-xs border-2 border-black ${
                              userIds.includes(currentUser?._id || '' as Id<"users">)
                                ? 'bg-black text-white'
                                : 'bg-white hover:bg-gray-100'
                            }`}
                          >
                            {emoji} {userIds.length}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-2 mt-1 text-xs font-mono text-gray-600 ${
                    isSent ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {isSent && (
                      <span className="font-bold uppercase">
                        {messageRead ? 'READ ✅' : 'SENT ✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
                disabled={isPosting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="px-4 py-2 border-4 border-black bg-white hover:bg-gray-100 font-mono text-sm font-bold uppercase"
                disabled={isPosting}
              >
                😀
              </button>

              {/* Attach Button */}
              <button 
                className="px-4 py-2 border-4 border-black bg-white hover:bg-gray-100 font-mono text-sm font-bold uppercase"
                disabled={isPosting}
              >
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
                <p className="font-mono text-sm font-bold uppercase mb-2">QUICK REACTIONS</p>
                <div className="flex gap-2">
                  {['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '💯'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-8 h-8 border-2 border-black hover:bg-gray-100 font-mono"
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