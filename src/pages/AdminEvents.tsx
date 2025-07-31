import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminEvents() {
  const events = useQuery(api.events.getAllEventsWithDetails);

  if (events === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-8 font-mono">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tighter">ADMIN EVENTS</h1>
        <p className="text-muted-foreground mt-2">Centralized dashboard for all events.</p>
      </header>
    </div>
  );
}