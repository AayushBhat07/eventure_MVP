import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, HelpCircle, Send } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "event-related", label: "Event-related" },
];

export function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTicket = useMutation(api.tickets.createTicket);
  const events = useQuery(api.events.list);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (category === "event-related" && !selectedEventId) {
      toast.error("Please select an event");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        eventId: category === "event-related" ? selectedEventId : undefined,
      });
      if (result.success) {
        toast.success("Ticket submitted successfully!");
        setSubject("");
        setDescription("");
        setCategory("general");
        setSelectedEventId("");
        onClose();
      } else {
        toast.error(result.message || "Failed to create ticket");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit ticket";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSubject("");
      setDescription("");
      setCategory("general");
      setSelectedEventId("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white dark:bg-neutral-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-black uppercase tracking-wider">Submit a Ticket</span>
              </div>
              <button onClick={handleClose} disabled={isSubmitting} className="hover:opacity-70 transition-opacity">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Subject */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  disabled={isSubmitting}
                  className="w-full border-2 border-black dark:border-white bg-[#f5f0e8] dark:bg-neutral-800 text-black dark:text-white px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  Category *
                </label>
                <div className="flex gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setCategory(cat.value);
                        if (cat.value !== "event-related") setSelectedEventId("");
                      }}
                      disabled={isSubmitting}
                      className={`flex-1 py-2 px-3 border-2 text-xs font-black uppercase transition-all ${
                        category === cat.value
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-[3px_3px_0px_#555] dark:shadow-[3px_3px_0px_#aaa]"
                          : "border-black dark:border-white bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Dropdown (only if event-related) */}
              {category === "event-related" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                    Select Event *
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border-2 border-black dark:border-white bg-[#f5f0e8] dark:bg-neutral-800 text-black dark:text-white px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">-- Select an event --</option>
                    {events?.map((event: { _id: string; name: string }) => (
                      <option key={event._id} value={event._id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

              {/* Description */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full border-2 border-black dark:border-white bg-[#f5f0e8] dark:bg-neutral-800 text-black dark:text-white px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !subject.trim() || !description.trim()}
                className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-wider text-sm py-3.5 border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] dark:hover:shadow-[2px_2px_0px_#fff] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-muted-foreground">
                Our team will respond to your ticket as soon as possible.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
