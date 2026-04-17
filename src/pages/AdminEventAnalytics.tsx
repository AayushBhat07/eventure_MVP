import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminNavBar } from "@/components/admin/admin-navbar";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-items";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useNavigate } from "react-router";
import { getAdminSession, isAdminRole } from "@/hooks/use-admin-session";
import {
  Home,
  Calendar,
  Users,
  Settings,
  Ticket,
  ScanLine,
  BarChart3,
  UserCheck,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Mail,
  Plus,
  Trash2,
  Loader2,
  Award,
  Image as ImageIcon,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    completed: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    cancelled: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  };
  return (
    <Badge variant="outline" className={`text-xs font-bold uppercase ${colors[status] || ""}`}>
      {status}
    </Badge>
  );
}

function ParticipantRow({ participant, index }: { participant: { user: { name?: string; email?: string; rollNo?: string; branch?: string } | null; status: string; attendedAt?: number; checkInCode?: string }; index: number }) {
  const checkedIn = !!participant.attendedAt;
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-center justify-between py-2.5 px-3 border-b border-foreground/5 last:border-b-0 hover:bg-muted/20 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${checkedIn ? "bg-green-500/15" : "bg-muted/40"}`}>
          {checkedIn ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground/50" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{participant.user?.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground truncate">{participant.user?.email || "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {participant.checkInCode && (
          <Badge variant="outline" className="text-[10px] font-mono hidden sm:inline-flex">
            {participant.checkInCode}
          </Badge>
        )}
        <Badge variant={checkedIn ? "default" : "secondary"} className="text-[10px] font-bold">
          {checkedIn ? "CHECKED IN" : "NOT YET"}
        </Badge>
      </div>
    </motion.div>
  );
}

function WinnerCard({ winner, isAdmin, onDelete }: { winner: { _id: string; rank: string; winnerName: string; photoUrl?: string; description?: string }; isAdmin: boolean; onDelete: () => void }) {
  const rankColors: Record<string, string> = {
    "1st": "from-yellow-400 to-amber-500",
    "2nd": "from-gray-300 to-gray-400",
    "3rd": "from-amber-600 to-orange-700",
  };
  const gradient = rankColors[winner.rank] || "from-indigo-400 to-purple-500";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-2 border-foreground/10 rounded-xl overflow-hidden bg-background"
    >
      {winner.photoUrl ? (
        <div className="aspect-square bg-muted/20 overflow-hidden">
          <img src={winner.photoUrl} alt={winner.winnerName} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Trophy className="h-12 w-12 text-white/80" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="text-xs font-black">{winner.rank}</Badge>
        </div>
        <p className="text-sm font-bold truncate">{winner.winnerName}</p>
        {winner.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{winner.description}</p>
        )}
        {isAdmin && (
          <Button variant="ghost" size="sm" className="mt-2 text-xs text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3 mr-1" /> Remove
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminEventAnalytics() {
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [showAddWinner, setShowAddWinner] = useState(false);
  const [winnerForm, setWinnerForm] = useState({ rank: "1st", winnerName: "", photoUrl: "", description: "" });
  const [sendingEmails, setSendingEmails] = useState(false);

  const adminSession = getAdminSession();
  const isAdmin = isAdminRole();

  const events = useQuery(api.events.list);
  const eventId = selectedEventId ? (selectedEventId as Id<"events">) : undefined;
  const event = useQuery(api.events.getById, eventId ? { id: eventId } : "skip");
  const participants = useQuery(api.events.getEventParticipants, eventId ? { eventId } : "skip");
  const stats = useQuery(api.events.getEventAttendanceStats, eventId ? { eventId } : "skip");
  const winners = useQuery(api.events.getEventWinners, eventId ? { eventId } : "skip");

  const updateEvent = useMutation(api.events.updateEventAsAdmin);
  const addWinner = useMutation(api.events.addWinner);
  const deleteWinner = useMutation(api.events.deleteWinner);
  const sendCheckInEmails = useMutation(api.events.sendCheckInEmailsForEvent);

  const handleMenuItemClick = (itemName: string) => {
    const routes: Record<string, string> = {
      Dashboard: "/admin-dashboard",
      Events: "/admin-events",
      "Check-In": "/admin-checkin",
      Analytics: "/admin-event-analytics",
      Tickets: "/admin-tickets",
      Team: "/admin-team",
      Settings: "/admin-settings",
    };
    if (routes[itemName]) navigate(routes[itemName]);
  };

  const handleToggleStatus = async () => {
    if (!eventId || !event) return;
    const newStatus = event.status === "active" ? "completed" : "active";
    try {
      await updateEvent({ id: eventId, status: newStatus });
      toast.success(`Event marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAddWinner = async () => {
    if (!eventId || !winnerForm.winnerName.trim()) return;
    try {
      const result = await addWinner({
        eventId,
        rank: winnerForm.rank,
        winnerName: winnerForm.winnerName.trim(),
        photoUrl: winnerForm.photoUrl.trim() || undefined,
        description: winnerForm.description.trim() || undefined,
      });
      if (result.success) {
        toast.success("Winner added!");
        setWinnerForm({ rank: "1st", winnerName: "", photoUrl: "", description: "" });
        setShowAddWinner(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to add winner");
    }
  };

  const handleDeleteWinner = async (winnerId: string) => {
    try {
      await deleteWinner({ winnerId: winnerId as Id<"event_winners"> });
      toast.success("Winner removed");
    } catch {
      toast.error("Failed to remove winner");
    }
  };

  const handleSendCheckInEmails = async () => {
    if (!eventId) return;
    setSendingEmails(true);
    try {
      const result = await sendCheckInEmails({ eventId });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to send emails");
    } finally {
      setSendingEmails(false);
    }
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundPaths title="" />
      </div>

      <AdminNavBar items={ADMIN_NAV_ITEMS} />

      <div className="relative z-10 pt-20 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6"
        >
          Event Analytics
        </motion.h1>

        {/* Event Selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full md:w-96 border-2 border-foreground/20 bg-background text-base font-semibold">
              <SelectValue placeholder="Select an event..." />
            </SelectTrigger>
            <SelectContent>
              {(events || []).map((ev: { _id: string; name: string; status: string }) => (
                <SelectItem key={ev._id} value={ev._id}>
                  <span className="flex items-center gap-2">
                    {ev.name}
                    <span className={`text-[10px] font-bold uppercase ${ev.status === "active" ? "text-green-600" : ev.status === "completed" ? "text-blue-600" : "text-red-600"}`}>
                      ({ev.status})
                    </span>
                  </span>
                </SelectItem>
              ))}
              {(!events || events.length === 0) && (
                <SelectItem value="__none" disabled>No events</SelectItem>
              )}
            </SelectContent>
          </Select>
        </motion.div>

        {selectedEventId && event && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-8">
            {/* Event Details Card */}
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{event.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.startDate)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(event.startDate)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={event.status} />
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold uppercase"
                        onClick={handleToggleStatus}
                      >
                        Mark as {event.status === "active" ? "Completed" : "Active"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 border-foreground/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Registered</p>
                    <p className="text-2xl font-black">{stats?.totalRegistered ?? "—"}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-foreground/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Attended</p>
                    <p className="text-2xl font-black">{stats?.totalAttended ?? "—"}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-foreground/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Rate</p>
                    <p className="text-2xl font-black">
                      {stats && stats.totalRegistered > 0
                        ? `${Math.round((stats.totalAttended / stats.totalRegistered) * 100)}%`
                        : "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-foreground/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Winners</p>
                    <p className="text-2xl font-black">{winners?.length ?? "—"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Row (Admin only) */}
            {isAdmin && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSendCheckInEmails}
                  disabled={sendingEmails}
                  className="gap-2 font-bold uppercase text-xs"
                >
                  {sendingEmails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {sendingEmails ? "Sending..." : "Send Check-In Emails"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddWinner(true)}
                  className="gap-2 font-bold uppercase text-xs"
                >
                  <Award className="h-4 w-4" /> Add Winner
                </Button>
              </motion.div>
            )}

            {/* Participants List */}
            <Card className="border-2 border-foreground/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Registered Participants ({participants?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants && participants.length > 0 ? (
                  <div className="max-h-[500px] overflow-y-auto">
                    {participants.map((p: any, idx: number) => (
                      <ParticipantRow key={p._id} participant={p} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No participants registered</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Winners Section */}
            <Card className="border-2 border-foreground/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                {winners && winners.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {winners.map((w: any) => (
                      <WinnerCard
                        key={w._id}
                        winner={w}
                        isAdmin={isAdmin}
                        onDelete={() => handleDeleteWinner(w._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No winners added yet</p>
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="mt-3 text-xs font-bold" onClick={() => setShowAddWinner(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Winner
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!selectedEventId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold">Select an event to view analytics</p>
            <p className="text-sm mt-1">Choose an event from the dropdown above</p>
          </motion.div>
        )}
      </div>

      {/* Add Winner Dialog */}
      <Dialog open={showAddWinner} onOpenChange={setShowAddWinner}>
        <DialogContent className="max-w-md border-2 border-foreground/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Add Winner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase">Rank</Label>
              <Select value={winnerForm.rank} onValueChange={(val: string) => setWinnerForm((p) => ({ ...p, rank: val }))}>
                <SelectTrigger className="border-2 border-foreground/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">🥇 1st Place</SelectItem>
                  <SelectItem value="2nd">🥈 2nd Place</SelectItem>
                  <SelectItem value="3rd">🥉 3rd Place</SelectItem>
                  <SelectItem value="Honorable Mention">⭐ Honorable Mention</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Winner Name</Label>
              <Input
                value={winnerForm.winnerName}
                onChange={(e) => setWinnerForm((p) => ({ ...p, winnerName: e.target.value }))}
                placeholder="Enter winner name"
                className="border-2 border-foreground/20"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Photo URL (optional)</Label>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  value={winnerForm.photoUrl}
                  onChange={(e) => setWinnerForm((p) => ({ ...p, photoUrl: e.target.value }))}
                  placeholder="https://example.com/photo.jpg"
                  className="border-2 border-foreground/20"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Description (optional)</Label>
              <Input
                value={winnerForm.description}
                onChange={(e) => setWinnerForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description or achievement"
                className="border-2 border-foreground/20"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddWinner} disabled={!winnerForm.winnerName.trim()} className="flex-1 font-bold uppercase">
                Add Winner
              </Button>
              <Button variant="outline" onClick={() => setShowAddWinner(false)} className="flex-1 font-bold uppercase">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}