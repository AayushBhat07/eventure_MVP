import React, { useState, useRef } from "react";
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
  Upload,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-400 text-black border-black",
    completed: "bg-blue-400 text-black border-black",
    cancelled: "bg-red-400 text-black border-black",
  };
  return (
    <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 ${colors[status] || "bg-gray-200 text-black border-black"}`}>
      {status}
    </span>
  );
}

function ParticipantRow({ participant, index }: { participant: { user: { name?: string; email?: string; rollNo?: string; branch?: string } | null; status: string; attendedAt?: number; checkInCode?: string }; index: number }) {
  const checkedIn = !!participant.attendedAt;
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`flex items-center justify-between py-3 px-4 border-b-2 border-black dark:border-white last:border-b-0 ${checkedIn ? "bg-green-50 dark:bg-green-900/20" : ""}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-8 w-8 border-2 border-black dark:border-white flex items-center justify-center flex-shrink-0 font-black text-xs ${checkedIn ? "bg-green-400 text-black" : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"}`}>
          {checkedIn ? "✓" : "✗"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black uppercase truncate">{participant.user?.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground truncate font-mono">{participant.user?.email || "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {participant.checkInCode && (
          <span className="text-[10px] font-mono font-bold border-2 border-black dark:border-white px-2 py-0.5 hidden sm:inline-block">
            {participant.checkInCode}
          </span>
        )}
        <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 border-black dark:border-white ${checkedIn ? "bg-green-400 text-black" : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"}`}>
          {checkedIn ? "CHECKED IN" : "NOT YET"}
        </span>
      </div>
    </motion.div>
  );
}

function WinnerCard({ winner, isAdmin, onDelete }: { winner: { _id: string; rank: string; winnerName: string; photoUrl?: string; description?: string }; isAdmin: boolean; onDelete: () => void }) {
  const rankColors: Record<string, string> = {
    "1st": "bg-yellow-400",
    "2nd": "bg-gray-300",
    "3rd": "bg-amber-600",
  };
  const rankBg = rankColors[winner.rank] || "bg-blue-400";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-4 border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] overflow-hidden bg-white dark:bg-neutral-900"
    >
      {winner.photoUrl ? (
        <div className="aspect-square overflow-hidden border-b-4 border-black dark:border-white">
          <img src={winner.photoUrl} alt={winner.winnerName} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`aspect-square ${rankBg} flex items-center justify-center border-b-4 border-black dark:border-white`}>
          <Trophy className="h-12 w-12 text-black" />
        </div>
      )}
      <div className="p-3">
        <div className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black dark:border-white mb-2 ${rankBg} text-black`}>
          {winner.rank}
        </div>
        <p className="text-sm font-black uppercase truncate">{winner.winnerName}</p>
        {winner.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-mono">{winner.description}</p>
        )}
        {isAdmin && (
          <button
            onClick={onDelete}
            className="mt-2 text-[10px] font-black uppercase text-red-600 border-2 border-red-600 px-2 py-1 hover:bg-red-600 hover:text-white transition-colors"
          >
            REMOVE
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminEventAnalytics() {
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [showAddWinner, setShowAddWinner] = useState(false);
  const [winnerForm, setWinnerForm] = useState({ rank: "1st", winnerName: "", description: "" });
  const [winnerPhotoFile, setWinnerPhotoFile] = useState<File | null>(null);
  const [winnerPhotoPreview, setWinnerPhotoPreview] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const generateUploadUrl = useMutation(api.events.generateUploadUrl);

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

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWinnerPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setWinnerPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const handleAddWinner = async () => {
    if (!eventId || !winnerForm.winnerName.trim()) return;
    setUploadingPhoto(true);
    try {
      let photoUrl: string | undefined;

      if (winnerPhotoFile) {
        // Upload to Convex storage
        const uploadUrl = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": winnerPhotoFile.type },
          body: winnerPhotoFile,
        });
        if (!uploadResponse.ok) throw new Error("Upload failed");
        const { storageId } = await uploadResponse.json();
        // Get the public URL for the storage ID
        photoUrl = storageId;
      }

      const result = await addWinner({
        eventId,
        rank: winnerForm.rank,
        winnerName: winnerForm.winnerName.trim(),
        photoUrl,
        description: winnerForm.description.trim() || undefined,
      });
      if (result.success) {
        toast.success("Winner added!");
        setWinnerForm({ rank: "1st", winnerName: "", description: "" });
        setWinnerPhotoFile(null);
        setWinnerPhotoPreview("");
        setShowAddWinner(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to add winner");
    } finally {
      setUploadingPhoto(false);
    }
  };

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
          className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8"
        >
          EVENT ANALYTICS
        </motion.h1>

        {/* Event Selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full md:w-96 border-4 border-black dark:border-white bg-background text-base font-black rounded-none shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
              <SelectValue placeholder="SELECT AN EVENT..." />
            </SelectTrigger>
            <SelectContent className="border-4 border-black dark:border-white rounded-none">
              {(events || []).map((ev: { _id: string; name: string; status: string }) => (
                <SelectItem key={ev._id} value={ev._id} className="font-bold uppercase">
                  <span className="flex items-center gap-2">
                    {ev.name}
                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 border border-black ${ev.status === "active" ? "bg-green-400 text-black" : ev.status === "completed" ? "bg-blue-400 text-black" : "bg-red-400 text-black"}`}>
                      {ev.status}
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
            <div className="bg-card/80 backdrop-blur-sm border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{event.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 border-2 border-black dark:border-white px-3 py-1.5 bg-yellow-400 text-black">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-black uppercase">{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 border-2 border-black dark:border-white px-3 py-1.5 bg-blue-400 text-black">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-black uppercase">{formatTime(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 border-2 border-black dark:border-white px-3 py-1.5 bg-white dark:bg-neutral-800 text-black dark:text-white">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-black uppercase">{event.venue}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={event.status} />
                  {isAdmin && (
                    <button
                      onClick={handleToggleStatus}
                      className="text-xs font-black uppercase border-4 border-black dark:border-white px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-[4px_4px_0px_#555] dark:shadow-[4px_4px_0px_#aaa] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#555] transition-all"
                    >
                      MARK AS {event.status === "active" ? "COMPLETED" : "ACTIVE"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "REGISTERED", value: stats?.totalRegistered ?? "—", icon: Users, color: "bg-blue-400" },
                { title: "ATTENDED", value: stats?.totalAttended ?? "—", icon: UserCheck, color: "bg-green-400" },
                { title: "ATTEND RATE", value: stats && stats.totalRegistered > 0 ? `${Math.round((stats.totalAttended / stats.totalRegistered) * 100)}%` : "—", icon: BarChart3, color: "bg-yellow-400" },
                { title: "WINNERS", value: winners?.length ?? "—", icon: Trophy, color: "bg-red-400" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`${stat.color} text-black p-6 border-4 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] hover:shadow-[12px_12px_0px_#000] dark:hover:shadow-[12px_12px_0px_#fff] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200`}
                >
                  <div className="flex flex-col items-center text-center">
                    <stat.icon className="h-10 w-10 mb-3 stroke-[3px]" />
                    <p className="text-[10px] font-black tracking-tighter uppercase mb-2 leading-tight">{stat.title}</p>
                    <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions Row (Admin only) */}
            {isAdmin && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3">
                <button
                  onClick={handleSendCheckInEmails}
                  disabled={sendingEmails}
                  className="flex items-center gap-2 border-4 border-black dark:border-white px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs shadow-[4px_4px_0px_#555] dark:shadow-[4px_4px_0px_#aaa] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#555] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {sendingEmails ? "SENDING..." : "SEND CHECK-IN EMAILS"}
                </button>
                <button
                  onClick={() => setShowAddWinner(true)}
                  className="flex items-center gap-2 border-4 border-black dark:border-white px-6 py-3 bg-yellow-400 text-black font-black uppercase text-xs shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
                >
                  <Award className="h-4 w-4" /> ADD WINNER
                </button>
              </motion.div>
            )}

            {/* Participants List */}
            <div className="border-4 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] bg-card/80 backdrop-blur-sm">
              <div className="border-b-4 border-black dark:border-white p-4 bg-black dark:bg-white">
                <h3 className="text-lg font-black uppercase text-white dark:text-black flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  REGISTERED PARTICIPANTS ({participants?.length ?? 0})
                </h3>
              </div>
              <div>
                {participants && participants.length > 0 ? (
                  <div className="max-h-[500px] overflow-y-auto">
                    {participants.map((p: any, idx: number) => (
                      <ParticipantRow key={p._id} participant={p} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-black uppercase text-muted-foreground">NO PARTICIPANTS REGISTERED</p>
                  </div>
                )}
              </div>
            </div>

            {/* Winners Section */}
            <div className="border-4 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] bg-card/80 backdrop-blur-sm">
              <div className="border-b-4 border-black dark:border-white p-4 bg-yellow-400">
                <h3 className="text-lg font-black uppercase text-black flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  WINNERS ({winners?.length ?? 0})
                </h3>
              </div>
              <div className="p-6">
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
                  <div className="text-center py-10">
                    <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-black uppercase text-muted-foreground">NO WINNERS ADDED YET</p>
                    {isAdmin && (
                      <button
                        onClick={() => setShowAddWinner(true)}
                        className="mt-4 border-4 border-black dark:border-white px-6 py-2 bg-yellow-400 text-black font-black uppercase text-xs shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
                      >
                        + ADD WINNER
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!selectedEventId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="border-4 border-black dark:border-white p-12 inline-block shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-black uppercase">SELECT AN EVENT</p>
              <p className="text-sm font-bold uppercase text-muted-foreground mt-2">CHOOSE AN EVENT FROM THE DROPDOWN ABOVE</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Winner Dialog */}
      <Dialog open={showAddWinner} onOpenChange={setShowAddWinner}>
        <DialogContent className="max-w-md border-4 border-black dark:border-white rounded-none shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase">ADD WINNER</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-black uppercase">RANK</Label>
              <Select value={winnerForm.rank} onValueChange={(val: string) => setWinnerForm((p) => ({ ...p, rank: val }))}>
                <SelectTrigger className="border-4 border-black dark:border-white rounded-none mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-4 border-black dark:border-white rounded-none">
                  <SelectItem value="1st">🥇 1st Place</SelectItem>
                  <SelectItem value="2nd">🥈 2nd Place</SelectItem>
                  <SelectItem value="3rd">🥉 3rd Place</SelectItem>
                  <SelectItem value="Honorable Mention">⭐ Honorable Mention</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-black uppercase">WINNER NAME</Label>
              <Input
                value={winnerForm.winnerName}
                onChange={(e) => setWinnerForm((p) => ({ ...p, winnerName: e.target.value }))}
                placeholder="Enter winner name"
                className="border-4 border-black dark:border-white rounded-none mt-1 font-bold"
              />
            </div>
            <div>
              <Label className="text-xs font-black uppercase">PHOTO (OPTIONAL)</Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setWinnerPhotoFile(file);
                      setWinnerPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {winnerPhotoPreview ? (
                  <div className="relative border-4 border-black dark:border-white">
                    <img src={winnerPhotoPreview} alt="Preview" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setWinnerPhotoFile(null); setWinnerPhotoPreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-1 right-1 bg-red-600 text-white border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase"
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-4 border-dashed border-black dark:border-white py-6 flex flex-col items-center gap-2 hover:bg-muted/20 transition-colors"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-xs font-black uppercase">CLICK TO UPLOAD PHOTO</span>
                  </button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs font-black uppercase">DESCRIPTION (OPTIONAL)</Label>
              <Input
                value={winnerForm.description}
                onChange={(e) => setWinnerForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description or achievement"
                className="border-4 border-black dark:border-white rounded-none mt-1 font-bold"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddWinner}
                disabled={!winnerForm.winnerName.trim()}
                className="flex-1 border-4 border-black dark:border-white py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-sm shadow-[4px_4px_0px_#555] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#555] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ADD WINNER
              </button>
              <button
                onClick={() => setShowAddWinner(false)}
                className="flex-1 border-4 border-black dark:border-white py-3 bg-white dark:bg-neutral-900 text-black dark:text-white font-black uppercase text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}