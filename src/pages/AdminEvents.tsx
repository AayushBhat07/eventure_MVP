import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { Calendar } from "lucide-react";

export default function AdminEvents() {
  const events = useQuery(api.events.getAllEventsWithDetails);

  if (events === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const bentoItems: BentoItem[] = events.map((event, index) => {
    const eventDate = new Date(event.startDate);
    const now = new Date();
    let displayStatus: string = event.status;

    if (event.status === 'active' && eventDate.getTime() < now.getTime() && new Date(event.endDate).getTime() > now.getTime()) {
        displayStatus = 'ongoing';
    } else if (event.status === 'active' && eventDate.getTime() > now.getTime()) {
        displayStatus = 'upcoming';
    }

    return {
      title: event.name,
      description: (
        <div>
          <p className="mb-2">{event.description}</p>
          <div className="font-bold text-sm">
            <CountdownTimer targetDate={event.startDate} />
          </div>
        </div>
      ),
      icon: <Calendar className="w-4 h-4 text-neutral-500" />,
      status: displayStatus,
      meta: eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      tags: [
        `${event.registrations.length} Participants`,
        `${event.volunteers.length} Volunteers`,
        `Team: ${event.creator?.name || 'N/A'}`,
      ],
      cta: "View Details",
      colSpan: index === 0 || index === 3 ? 2 : 1,
      hasPersistentHover: index === 0,
    };
  });

  return (
    <div className="bg-background min-h-screen p-8 font-mono">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tighter">ADMIN EVENTS</h1>
        <p className="text-muted-foreground mt-2">Centralized dashboard for all events.</p>
      </header>
      <BentoGrid items={bentoItems} />
    </div>
  );
}