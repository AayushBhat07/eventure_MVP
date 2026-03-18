import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router";

export function RegisteredEventsWidget() {
  const upcomingEvents = useQuery(api.dashboard.getUpcomingEvents);
  const navigate = useNavigate();

  return (
    <div className="space-y-2 min-h-[120px]">
      {!upcomingEvents ? (
        <div className="text-xs text-muted-foreground">Loading...</div>
      ) : upcomingEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Calendar className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
            NO REGISTERED EVENTS
          </p>
        </div>
      ) : (
        upcomingEvents.slice(0, 4).map((event) => (
          <div
            key={event._id}
            className="border-2 border-black dark:border-white p-2 hover:bg-accent transition-colors cursor-pointer"
            onClick={() => navigate(`/event/${event._id}`)}
          >
            <h4 className="font-bold text-xs truncate">{event.name}</h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{new Date(event.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}