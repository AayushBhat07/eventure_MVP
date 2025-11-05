import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router";

export function EventDiscoveryWidget() {
  const [searchQuery, setSearchQuery] = useState("");
  const events = useQuery(api.events.list);
  const navigate = useNavigate();

  const filteredEvents = events?.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 2);

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2 border-black dark:border-white"
        />
      </div>

      <div className="space-y-2 flex-1 overflow-auto">
        {!filteredEvents ? (
          <div className="text-sm text-muted-foreground">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-sm text-muted-foreground">No events found</div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event._id}
              className="border-2 border-black dark:border-white p-2 hover:bg-accent transition-colors cursor-pointer"
              onClick={() => navigate(`/event/${event._id}`)}
            >
              <h4 className="font-bold text-xs truncate">{event.name}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="truncate">{new Date(event.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full border-2 border-black dark:border-white font-bold"
        onClick={() => navigate("/events")}
      >
        VIEW ALL
      </Button>
    </div>
  );
}