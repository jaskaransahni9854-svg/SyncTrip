"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TripMapVisualizer } from "@/components/TripMapVisualizer";
import { useAuth } from "@/hooks/useAuth";
import { getTripById, updateTrip, deleteTrip, removeTripMember } from "@/lib/trips";
import {
  getItineraryItems,
  createItineraryItem,
  deleteItineraryItem,
  voteItineraryItem,
  batchSetItinerary,
} from "@/lib/itinerary";
import {
  getTripExpenses,
  createExpense,
  deleteExpense,
  calculateTripBalances,
} from "@/lib/expenses";
import { createTripInvitation } from "@/lib/invitations";
import { Trip, TripRole } from "@/types/trip";
import { ItineraryItem, ActivityCategory } from "@/types/itinerary";
import { Expense, ExpenseCategory } from "@/types/expense";
import {
  Compass,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Sparkles,
  Plus,
  Trash2,
  ThumbsUp,
  Share2,
  Clock,
  Layers,
  Utensils,
  Camera,
  Car,
  Home as HomeIcon,
  ShoppingBag,
  Film,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  ArrowRight,
  Settings as SettingsIcon,
} from "lucide-react";

export default function TripWorkspacePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "map" | "budget" | "members" | "settings"
  >("overview");

  // Core Data
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Activity Form State
  const [newActivityDay, setNewActivityDay] = useState(1);
  const [newActivityTime, setNewActivityTime] = useState("10:00");
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityLocation, setNewActivityLocation] = useState("");
  const [newActivityCategory, setNewActivityCategory] = useState<ActivityCategory>("sightseeing");
  const [newActivityCost, setNewActivityCost] = useState("0");
  const [newActivityNotes, setNewActivityNotes] = useState("");
  const [addingActivity, setAddingActivity] = useState(false);

  // Add Expense Form State
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("food");
  const [expenseDate, setExpenseDate] = useState("");
  const [addingExpense, setAddingExpense] = useState(false);

  // Invite Modal State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TripRole>("EDITOR");
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [sendingInvite, setSendingInvite] = useState(false);

  // AI Modal State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<ItineraryItem[] | null>(null);

  // Load Trip Data
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [tripData, itData, expData] = await Promise.all([
          getTripById(tripId),
          getItineraryItems(tripId),
          getTripExpenses(tripId),
        ]);
        if (mounted) {
          setTrip(tripData);
          setItinerary(itData);
          setExpenses(expData);
        }
      } catch (err) {
        console.error("Failed to load trip workspace:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [tripId]);

  // Derived Values
  const balances = trip ? calculateTripBalances(trip, expenses) : null;
  const isOwner = user && trip && trip.ownerId === user.uid;
  const memberList = trip ? Object.values(trip.members || {}) : [];

  // Group itinerary by dayNumber
  const groupedItinerary = itinerary.reduce((acc, item) => {
    const day = item.dayNumber;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  const dayNumbers = Object.keys(groupedItinerary)
    .map(Number)
    .sort((a, b) => a - b);

  // Handlers
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !user || !newActivityTitle.trim()) return;
    setAddingActivity(true);

    try {
      const s = new Date(trip.startDate);
      const activityDate = new Date(s.getTime() + (newActivityDay - 1) * 86400000)
        .toISOString()
        .split("T")[0];

      const item = await createItineraryItem(trip.id, {
        dayNumber: newActivityDay,
        date: activityDate,
        time: newActivityTime,
        title: newActivityTitle.trim(),
        locationName: newActivityLocation.trim() || trip.destination,
        category: newActivityCategory,
        estimatedCost: parseFloat(newActivityCost) || 0,
        currency: trip.currency,
        notes: newActivityNotes.trim(),
        addedByUid: user.uid,
        addedByName: user.displayName,
        votes: { [user.uid]: "up" },
      });

      setItinerary([...itinerary, item]);
      setNewActivityTitle("");
      setNewActivityLocation("");
      setNewActivityNotes("");
      setShowAddActivity(false);
    } catch (err) {
      console.error("Error creating activity:", err);
    } finally {
      setAddingActivity(false);
    }
  };

  const handleDeleteActivity = async (itemId: string) => {
    if (!trip) return;
    try {
      await deleteItineraryItem(trip.id, itemId);
      setItinerary(itinerary.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  const handleVote = async (itemId: string, vote: "up" | "down") => {
    if (!trip || !user) return;
    try {
      await voteItineraryItem(trip.id, itemId, user.uid, vote);
      setItinerary(
        itinerary.map((item) => {
          if (item.id === itemId) {
            const v = { ...(item.votes || {}) };
            if (v[user.uid] === vote) {
              delete v[user.uid];
            } else {
              v[user.uid] = vote;
            }
            return { ...item, votes: v };
          }
          return item;
        })
      );
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !user || !expenseTitle.trim()) return;
    setAddingExpense(true);

    try {
      const amountNum = parseFloat(expenseAmount) || 0;
      const newExp = await createExpense(trip.id, {
        tripId: trip.id,
        title: expenseTitle.trim(),
        amount: amountNum,
        currency: trip.currency,
        category: expenseCategory,
        paidByUid: user.uid,
        paidByName: user.displayName,
        splitWithMemberUids: trip.memberIds,
        date: expenseDate || new Date().toISOString().split("T")[0],
      });

      setExpenses([newExp, ...expenses]);
      setExpenseTitle("");
      setExpenseAmount("");
      setShowAddExpense(false);
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!trip) return;
    try {
      await deleteExpense(trip.id, expenseId);
      setExpenses(expenses.filter((e) => e.id !== expenseId));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !user) return;
    setSendingInvite(true);

    try {
      const invite = await createTripInvitation(
        trip.id,
        inviteEmail.trim() || "friend@synctrip.com",
        inviteRole,
        user
      );
      const url = `${window.location.origin}/invite/${invite.id}`;
      setCreatedInviteLink(url);
    } catch (err) {
      console.error("Error generating invite:", err);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!trip) return;
    setAiGenerating(true);

    try {
      const res = await fetch("/api/ai/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.totalBudget,
          groupSize: trip.memberIds.length,
        }),
      });

      const data = await res.json();
      if (data.success && data.activities) {
        setAiPreview(data.activities);
      }
    } catch (err) {
      console.error("Error generating AI itinerary:", err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAI = async (mode: "replace" | "append") => {
    if (!trip || !aiPreview) return;
    const combined = mode === "replace" ? aiPreview : [...itinerary, ...aiPreview];
    await batchSetItinerary(trip.id, combined);
    setItinerary(combined);
    setAiPreview(null);
    setShowAIModal(false);
    setActiveTab("itinerary");
  };

  const handleDeleteTrip = async () => {
    if (!trip) return;
    if (confirm("Are you sure you want to delete this trip workspace? This cannot be undone.")) {
      await deleteTrip(trip.id);
      router.push("/dashboard");
    }
  };

  const handleLeaveTrip = async () => {
    if (!trip || !user) return;
    if (confirm("Are you sure you want to leave this trip?")) {
      await removeTripMember(trip.id, user.uid);
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-text-secondary mt-3 font-medium">
          Loading group trip workspace...
        </p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
          <h2 className="text-xl font-bold text-ink">Trip Not Found</h2>
          <p className="text-sm text-text-secondary mt-2 mb-6">
            The trip workspace you requested does not exist or has been removed.
          </p>
          <Link
            href="/dashboard"
            className={buttonVariants({ className: "w-full" })}
          >
            Back to Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Workspace Top Bar */}
        <header className="px-6 h-16 flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-ink hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-ink truncate max-w-xs sm:max-w-md">
                {trip.title}
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-text-muted">
                {trip.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              className="text-xs font-semibold flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary-light"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invite Friends</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setShowAIModal(true)}
              className="text-xs font-semibold bg-primary hover:bg-primary-dark text-white flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Planner</span>
            </Button>
          </div>
        </header>

        {/* Hero Banner Section */}
        <div className="relative h-56 sm:h-72 w-full bg-ink overflow-hidden">
          {trip.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trip.coverImage}
              alt={trip.title}
              className="w-full h-full object-cover opacity-85"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-dark to-ocean-dark opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 backdrop-blur text-white border-white/30 text-xs">
                  <MapPin className="w-3 h-3 mr-1 text-primary-light" />
                  {trip.destination}
                </Badge>
                {trip.aiGenerated && (
                  <Badge className="bg-primary/90 text-white border-none text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Planned
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
                {trip.title}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary-light" />
                  {trip.startDate} – {trip.endDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary-light" />
                  {memberList.length} {memberList.length === 1 ? "traveler" : "travelers"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-primary-light" />
                  ${trip.totalBudget.toLocaleString()} {trip.currency}
                </span>
              </p>
            </div>

            {/* Member Avatars */}
            <div className="flex items-center -space-x-2 shrink-0">
              {memberList.map((m) => (
                <Avatar key={m.uid} className="w-9 h-9 border-2 border-white shadow-sm">
                  {m.photoURL ? (
                    <AvatarImage src={m.photoURL} alt={m.displayName} />
                  ) : (
                    <AvatarFallback className="bg-primary-light text-primary font-bold text-xs">
                      {m.displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border bg-surface sticky top-16 z-30 shadow-xs">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: Compass },
              { id: "itinerary", label: "Itinerary", icon: Layers, count: itinerary.length },
              { id: "map", label: "Interactive Map", icon: MapPin },
              { id: "budget", label: "Budget & Split", icon: DollarSign, count: expenses.length },
              { id: "members", label: "Travel Crew", icon: Users, count: memberList.length },
              { id: "settings", label: "Settings", icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-4 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:text-ink hover:border-border"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-primary-light text-primary-dark"
                          : "bg-muted text-text-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content View Container */}
        <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-surface border border-border rounded-xl">
                  <span className="text-xs text-text-muted font-medium block">Total Target Budget</span>
                  <div className="text-2xl font-bold text-ink mt-1">
                    ${trip.totalBudget.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-text-secondary mt-1 flex items-center justify-between">
                    <span>Spent: ${balances?.totalSpent.toLocaleString()}</span>
                    <span className="font-semibold text-nature">
                      ${balances?.remainingBudget.toLocaleString()} left
                    </span>
                  </div>
                </Card>

                <Card className="p-4 bg-surface border border-border rounded-xl">
                  <span className="text-xs text-text-muted font-medium block">Planned Activities</span>
                  <div className="text-2xl font-bold text-ink mt-1">
                    {itinerary.length} Stops
                  </div>
                  <div className="text-[11px] text-text-secondary mt-1">
                    Across {dayNumbers.length} travel days
                  </div>
                </Card>

                <Card className="p-4 bg-surface border border-border rounded-xl">
                  <span className="text-xs text-text-muted font-medium block">Travel Crew</span>
                  <div className="text-2xl font-bold text-ink mt-1">
                    {memberList.length} Friends
                  </div>
                  <div className="text-[11px] text-text-secondary mt-1">
                    {memberList.filter((m) => m.role === "OWNER" || m.role === "EDITOR").length} editors
                  </div>
                </Card>

                <Card className="p-4 bg-surface border border-border rounded-xl">
                  <span className="text-xs text-text-muted font-medium block">Workspace Status</span>
                  <div className="text-2xl font-bold text-primary mt-1 capitalize">
                    {trip.status}
                  </div>
                  <div className="text-[11px] text-text-secondary mt-1">
                    Live real-time collaboration
                  </div>
                </Card>
              </div>

              {/* Trip Description */}
              {trip.description && (
                <div className="p-5 rounded-2xl bg-cream border border-border/80">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    Trip Vibe & Vision
                  </h3>
                  <p className="text-sm text-text-main leading-relaxed">
                    {trip.description}
                  </p>
                </div>
              )}

              {/* Itinerary Preview & Next Stops */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-ink">Upcoming Daily Itinerary</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("itinerary")}
                    className="text-xs text-primary"
                  >
                    View All {itinerary.length} Activities →
                  </Button>
                </div>

                {itinerary.length === 0 ? (
                  <Card className="p-8 text-center bg-surface border border-dashed border-border rounded-2xl">
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-bold text-ink">No activities added yet</h4>
                    <p className="text-xs text-text-secondary mt-1 mb-4">
                      Let Gemini generate a day-by-day plan or add activities manually.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => setShowAIModal(true)}
                        className="bg-primary text-white text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Generate with AI
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("itinerary");
                          setShowAddActivity(true);
                        }}
                        className="text-xs"
                      >
                        Add Activity Manually
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {itinerary.slice(0, 4).map((item) => (
                      <Card key={item.id} className="p-4 bg-surface border border-border rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-primary">
                            Day {item.dayNumber} {item.time && `• ${item.time}`}
                          </span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {item.category}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-ink">{item.title}</h4>
                        <p className="text-xs text-text-secondary flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3 h-3 text-text-muted" />
                          {item.locationName}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ITINERARY */}
          {activeTab === "itinerary" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-ink">Shared Day-by-Day Schedule</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Collaborate on activities, vote on recommendations, and coordinate arrival times.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIModal(true)}
                    className="text-xs font-semibold flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary-light"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Regenerate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowAddActivity(true)}
                    className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Activity
                  </Button>
                </div>
              </div>

              {/* Itinerary Day Groups */}
              {dayNumbers.length === 0 ? (
                <Card className="p-12 text-center bg-surface border border-dashed border-border rounded-2xl">
                  <Layers className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-ink">Your itinerary is empty</h3>
                  <p className="text-xs text-text-secondary mt-1 mb-6 max-w-sm mx-auto">
                    Start by clicking &quot;Add Activity&quot; or let Google Gemini automatically create daily routes.
                  </p>
                  <Button onClick={() => setShowAddActivity(true)} className="bg-primary text-white">
                    Add First Activity
                  </Button>
                </Card>
              ) : (
                dayNumbers.map((dayNum) => (
                  <div key={dayNum} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-ink text-white font-bold text-xs tracking-wide">
                        DAY {dayNum}
                      </span>
                      <span className="text-xs text-text-muted">
                        {groupedItinerary[dayNum][0]?.date || ""}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="space-y-3">
                      {groupedItinerary[dayNum].map((item) => {
                        const upvotes = Object.values(item.votes || {}).filter((v) => v === "up").length;
                        const userVoted = user && item.votes?.[user.uid] === "up";

                        return (
                          <Card
                            key={item.id}
                            className="p-4 bg-surface border border-border/80 rounded-2xl shadow-xs hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3.5 flex-1">
                              <div className="w-10 h-10 rounded-xl bg-primary-pale text-primary flex items-center justify-center shrink-0 mt-0.5">
                                {item.category === "food" && <Utensils className="w-5 h-5 text-coral" />}
                                {item.category === "sightseeing" && <Camera className="w-5 h-5 text-primary" />}
                                {item.category === "transport" && <Car className="w-5 h-5 text-ocean" />}
                                {item.category === "lodging" && <HomeIcon className="w-5 h-5 text-nature" />}
                                {item.category === "shopping" && <ShoppingBag className="w-5 h-5 text-primary" />}
                                {item.category === "entertainment" && <Film className="w-5 h-5 text-ocean" />}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {item.time && (
                                    <span className="text-xs font-bold text-ink flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-text-muted" />
                                      {item.time}
                                    </span>
                                  )}
                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {item.category}
                                  </Badge>
                                </div>
                                <h4 className="text-sm sm:text-base font-bold text-ink">{item.title}</h4>
                                <p className="text-xs text-text-secondary flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                                  {item.locationName}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-text-muted italic bg-muted/30 p-2 rounded-lg mt-1">
                                    &ldquo;{item.notes}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                              {item.estimatedCost > 0 && (
                                <span className="text-xs font-bold text-ink bg-cream px-2.5 py-1 rounded-lg border border-border/60">
                                  ${item.estimatedCost}
                                </span>
                              )}

                              {/* Voting Pill */}
                              <button
                                type="button"
                                onClick={() => handleVote(item.id, "up")}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                                  userVoted
                                    ? "bg-primary text-white border-primary"
                                    : "bg-surface text-text-secondary border-border hover:border-primary/50"
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{upvotes}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteActivity(item.id)}
                                className="text-text-muted hover:text-error p-1 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: MAP */}
          {activeTab === "map" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-ink">Trip Map & Route Visualizer</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Explore geographical locations of your scheduled activities and plan walking or transit routes.
                </p>
              </div>
              <TripMapVisualizer trip={trip} items={itinerary} />
            </div>
          )}

          {/* TAB 4: BUDGET & SPLITTING */}
          {activeTab === "budget" && balances && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-ink">Group Budget & Expense Splitter</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Record receipts, automatically calculate fair shares, and settle balances without hassle.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddExpense(true)}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Shared Expense
                </Button>
              </div>

              {/* Budget Overview Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-surface border border-border rounded-2xl space-y-2">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    Total Spent
                  </span>
                  <div className="text-3xl font-extrabold text-ink">
                    ${balances.totalSpent.toLocaleString()}
                  </div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{
                        width: `${Math.min(100, (balances.totalSpent / trip.totalBudget) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-text-secondary block">
                    {Math.round((balances.totalSpent / trip.totalBudget) * 100)}% of $
                    {trip.totalBudget.toLocaleString()} target budget
                  </span>
                </Card>

                <Card className="p-5 bg-surface border border-border rounded-2xl space-y-2">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    Remaining Budget
                  </span>
                  <div className="text-3xl font-extrabold text-nature">
                    ${balances.remainingBudget.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-text-secondary block">
                    Available for upcoming activities and meals
                  </span>
                </Card>

                <Card className="p-5 bg-surface border border-border rounded-2xl space-y-2">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    Category Breakdown
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-muted block">Lodging</span>
                      <span className="font-bold text-ink">${balances.categoryTotals.lodging || 0}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Transport</span>
                      <span className="font-bold text-ink">${balances.categoryTotals.transport || 0}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Food & Drinks</span>
                      <span className="font-bold text-ink">${balances.categoryTotals.food || 0}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Activities</span>
                      <span className="font-bold text-ink">${balances.categoryTotals.activities || 0}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Debt Settlement Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Who Owes Who (Settlements)
                </h3>

                {balances.settlements.length === 0 ? (
                  <p className="text-xs text-text-muted italic bg-muted/20 p-4 rounded-xl">
                    All balances are currently even! No debts to settle.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {balances.settlements.map((s, idx) => (
                      <Card key={idx} className="p-4 bg-cream border border-border/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-error">{s.fromName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-xs font-bold text-nature">{s.toName}</span>
                        </div>
                        <div className="text-xl font-bold text-ink">
                          ${s.amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-text-muted block">
                          Transfers required to balance group expenses
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Member Individual Balances */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-ink">Member Balances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {balances.balances.map((b) => (
                    <Card key={b.memberUid} className="p-3.5 bg-surface border border-border rounded-xl space-y-1">
                      <span className="text-xs font-bold text-ink block">{b.displayName}</span>
                      <div className="text-xs text-text-secondary flex justify-between">
                        <span>Paid:</span>
                        <span className="font-medium text-ink">${b.totalPaid}</span>
                      </div>
                      <div className="text-xs text-text-secondary flex justify-between">
                        <span>Share:</span>
                        <span className="font-medium text-ink">${b.totalShare}</span>
                      </div>
                      <div className="pt-1.5 border-t border-border flex justify-between items-center text-xs font-bold">
                        <span>Net:</span>
                        <span className={b.netBalance >= 0 ? "text-nature" : "text-error"}>
                          {b.netBalance >= 0 ? `+$${b.netBalance}` : `-$${Math.abs(b.netBalance)}`}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Expense History List */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-ink">Expense Log ({expenses.length})</h3>
                {expenses.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No expenses logged yet.</p>
                ) : (
                  expenses.map((exp) => (
                    <Card key={exp.id} className="p-3.5 bg-surface border border-border rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-ink">{exp.title}</h4>
                        <p className="text-xs text-text-secondary">
                          Paid by <span className="font-semibold text-ink">{exp.paidByName}</span> on {exp.date} • <span className="capitalize">{exp.category}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-ink">
                          ${exp.amount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-text-muted hover:text-error p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MEMBERS & INVITATIONS */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-ink">Travel Crew ({memberList.length})</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Manage roles, permissions, and group invitations.
                  </p>
                </div>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Invite New Member
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {memberList.map((m) => (
                  <Card key={m.uid} className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border">
                        {m.photoURL ? (
                          <AvatarImage src={m.photoURL} alt={m.displayName} />
                        ) : (
                          <AvatarFallback className="bg-primary text-white font-bold text-xs">
                            {m.displayName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-bold text-ink">{m.displayName}</h4>
                        <span className="text-xs text-text-muted">{m.email}</span>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold ${
                        m.role === "OWNER"
                          ? "bg-primary text-white"
                          : "bg-muted text-text-secondary"
                      }`}
                    >
                      {m.role}
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-ink">Trip Settings</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Update trip parameters or leave workspace.
                </p>
              </div>

              <Card className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Trip Title</label>
                  <Input
                    defaultValue={trip.title}
                    onBlur={async (e) => {
                      if (e.target.value.trim() && e.target.value !== trip.title) {
                        await updateTrip(trip.id, { title: e.target.value.trim() });
                        setTrip({ ...trip, title: e.target.value.trim() });
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Target Budget ({trip.currency})</label>
                  <Input
                    type="number"
                    defaultValue={trip.totalBudget}
                    onBlur={async (e) => {
                      const val = parseFloat(e.target.value);
                      if (val && val !== trip.totalBudget) {
                        await updateTrip(trip.id, { totalBudget: val });
                        setTrip({ ...trip, totalBudget: val });
                      }
                    }}
                  />
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 bg-error/5 border border-error/20 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-error uppercase tracking-wider">
                  Danger Zone
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-semibold text-ink block">Leave Trip</span>
                    <span className="text-xs text-text-secondary">
                      Remove yourself from this shared group workspace.
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLeaveTrip}
                    className="border-error text-error hover:bg-error/10 text-xs shrink-0"
                  >
                    Leave Trip
                  </Button>
                </div>

                {isOwner && (
                  <div className="pt-4 border-t border-error/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-semibold text-error block">Delete Entire Trip</span>
                      <span className="text-xs text-text-secondary">
                        Permanently remove all itineraries, maps, expenses, and member records.
                      </span>
                    </div>
                    <Button
                      onClick={handleDeleteTrip}
                      className="bg-error hover:bg-error/90 text-white text-xs shrink-0"
                    >
                      Delete Trip
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
        </main>

        {/* MODAL 1: ADD ACTIVITY */}
        {showAddActivity && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 bg-surface border border-border shadow-2xl rounded-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-ink">Add Itinerary Activity</h3>
                <button
                  type="button"
                  onClick={() => setShowAddActivity(false)}
                  className="text-text-muted hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddActivity} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Day Number</label>
                    <Input
                      type="number"
                      min={1}
                      value={newActivityDay}
                      onChange={(e) => setNewActivityDay(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Time</label>
                    <Input
                      type="time"
                      value={newActivityTime}
                      onChange={(e) => setNewActivityTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Activity Name</label>
                  <Input
                    placeholder="e.g. Sunset Boat Cruise"
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Location / Landmark</label>
                  <Input
                    placeholder="e.g. Kyoto Pier"
                    value={newActivityLocation}
                    onChange={(e) => setNewActivityLocation(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Category</label>
                    <select
                      value={newActivityCategory}
                      onChange={(e) => setNewActivityCategory(e.target.value as ActivityCategory)}
                      className="w-full h-10 border border-border rounded-lg bg-surface px-2.5 text-xs text-ink"
                    >
                      <option value="sightseeing">Sightseeing</option>
                      <option value="food">Food & Drink</option>
                      <option value="transport">Transport</option>
                      <option value="lodging">Lodging</option>
                      <option value="shopping">Shopping</option>
                      <option value="entertainment">Entertainment</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Est. Cost ($)</label>
                    <Input
                      type="number"
                      value={newActivityCost}
                      onChange={(e) => setNewActivityCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Notes / Tips</label>
                  <Input
                    placeholder="e.g. Bring hats, tickets booked online"
                    value={newActivityNotes}
                    onChange={(e) => setNewActivityNotes(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddActivity(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addingActivity}
                    className="bg-primary text-white"
                  >
                    {addingActivity ? "Saving..." : "Save Activity"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* MODAL 2: ADD EXPENSE */}
        {showAddExpense && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 bg-surface border border-border shadow-2xl rounded-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-ink">Add Group Expense</h3>
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="text-text-muted hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Expense Title</label>
                  <Input
                    placeholder="e.g. Train passes, Dinner at Izakaya"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Amount ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="120.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Category</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                      className="w-full h-10 border border-border rounded-lg bg-surface px-2.5 text-xs text-ink"
                    >
                      <option value="food">Food</option>
                      <option value="transport">Transport</option>
                      <option value="lodging">Lodging</option>
                      <option value="activities">Activities</option>
                      <option value="shopping">Shopping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Date</label>
                  <Input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddExpense(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addingExpense}
                    className="bg-primary text-white"
                  >
                    {addingExpense ? "Saving..." : "Add Expense"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* MODAL 3: INVITE FRIENDS */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 bg-surface border border-border shadow-2xl rounded-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-ink">Invite to Workspace</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setCreatedInviteLink(null);
                  }}
                  className="text-text-muted hover:text-ink"
                >
                  ✕
                </button>
              </div>

              {createdInviteLink ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-nature/10 border border-nature/20 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-nature mx-auto" />
                    <h4 className="font-bold text-ink">Invitation Link Created!</h4>
                    <p className="text-xs text-text-secondary">
                      Anyone with this link can join this trip workspace.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={createdInviteLink}
                      className="text-xs bg-muted/30"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(createdInviteLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="bg-primary text-white shrink-0"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateInvite} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Friend&apos;s Email</label>
                    <Input
                      type="email"
                      placeholder="traveler@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Access Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TripRole)}
                      className="w-full h-10 border border-border rounded-lg bg-surface px-2.5 text-xs text-ink"
                    >
                      <option value="EDITOR">Editor (Can add & edit itineraries/expenses)</option>
                      <option value="VIEWER">Viewer (Read-only view)</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={sendingInvite}
                    className="w-full bg-primary text-white font-medium"
                  >
                    {sendingInvite ? "Generating Link..." : "Create Shareable Link"}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        )}

        {/* MODAL 4: GEMINI AI ITINERARY GENERATOR */}
        {showAIModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full p-6 bg-surface border border-border shadow-2xl rounded-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-ink">Google Gemini AI Trip Planner</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="text-text-muted hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {!aiPreview && !aiGenerating && (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary-pale text-primary mx-auto flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-ink">
                      Generate Day-by-Day Itinerary for {trip.destination}
                    </h4>
                    <p className="text-xs text-text-secondary max-w-md mx-auto">
                      Gemini will craft structured morning, afternoon, and evening stops including locations, estimated expenses, and local recommendations.
                    </p>
                    <Button
                      onClick={handleGenerateAI}
                      className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Itinerary Now
                    </Button>
                  </div>
                )}

                {aiGenerating && (
                  <div className="text-center py-12 space-y-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <h4 className="text-sm font-bold text-ink">
                      Gemini is researching {trip.destination}...
                    </h4>
                    <p className="text-xs text-text-muted">
                      Optimizing routes, activities, and group budget allocations.
                    </p>
                  </div>
                )}

                {aiPreview && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink uppercase tracking-wider">
                        Generated Preview ({aiPreview.length} Stops)
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleGenerateAI}
                        className="text-xs text-primary"
                      >
                        Regenerate
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {aiPreview.map((item, idx) => (
                        <Card key={idx} className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-primary">Day {item.dayNumber} • {item.time}</span>
                            <span className="font-semibold text-ink">${item.estimatedCost}</span>
                          </div>
                          <h5 className="text-sm font-bold text-ink">{item.title}</h5>
                          <p className="text-xs text-text-secondary">{item.description}</p>
                        </Card>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleApplyAI("append")}
                        className="text-xs"
                      >
                        Append to Existing
                      </Button>
                      <Button
                        onClick={() => handleApplyAI("replace")}
                        className="bg-primary text-white text-xs font-semibold"
                      >
                        Replace Itinerary
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
