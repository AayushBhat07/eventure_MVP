import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, Square } from "lucide-react";
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from "sonner";

interface CreateEventModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  allUsers: any[] | undefined;
}

export function CreateEventModal({ isOpen, onOpenChange, allUsers }: CreateEventModalProps) {
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
        onOpenChange(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              {allUsers?.map((volunteer) => (
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
                onOpenChange(false);
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
  );
}