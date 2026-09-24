"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TripCard } from "@/components/TripCard";
import { useAuth } from "@/hooks/useAuth";
import { getUserTrips } from "@/lib/trips";
import { Trip } from "@/types/trip";
import {
  Map,
  Plus,
  LogOut,
  Compass,
  Search,
  SlidersHorizontal,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    let isMounted = true;
    async function loadTrips() {
      if (!user) return;
      setLoading(true);
      try {
        const fetched = await getUserTrips(user.uid);
        if (isMounted) {
          setTrips(fetched);
        }
      } catch (err) {
        console.error("Failed to load trips", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadTrips();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredTrips = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return trips.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === "upcoming") {
        return t.endDate >= today;
      }
      if (activeTab === "past") {
        return t.endDate < today;
      }
      return true;
    });
  }, [trips, searchQuery, activeTab]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Navigation Bar */}
        <header className="px-6 h-16 flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/25 transition-transform group-hover:scale-105">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-ink">SyncTrip</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-border text-ink">
              <Avatar className="w-7 h-7 border border-border">
                {user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                ) : (
                  <AvatarFallback className="bg-primary-light text-primary font-bold text-xs">
                    {user?.displayName ? (
                      user.displayName.substring(0, 2).toUpperCase()
                    ) : (
                      <UserIcon className="w-3.5 h-3.5" />
                    )}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-ink line-clamp-1 leading-none">
                  {user?.displayName || "Traveler"}
                </span>
                <span className="text-[10px] text-text-muted leading-tight mt-0.5">
                  {user?.email || "wanderer@synctrip"}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-text-secondary hover:text-error hover:bg-error/10 flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-1">
          {/* Header & New Trip Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-ink">Your Trips</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-light text-primary-dark">
                  {trips.length}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Collaborative itineraries, shared budgets, and group planning in one workspace
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/trip/new"
                className={buttonVariants({
                  className:
                    "bg-primary hover:bg-primary-dark text-white shadow-sm flex items-center gap-2 font-medium px-5 py-2.5 transition-all",
                })}
              >
                <Plus className="w-4 h-4" />
                Create New Trip
              </Link>
            </div>
          </div>

          {/* Search & Tabs Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-surface p-2.5 rounded-2xl border border-border shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search by trip name or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 border-none bg-muted/30 focus-visible:bg-surface focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "all"
                    ? "bg-surface text-ink shadow-xs"
                    : "text-text-secondary hover:text-ink"
                }`}
              >
                All Trips
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "upcoming"
                    ? "bg-surface text-ink shadow-xs"
                    : "text-text-secondary hover:text-ink"
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("past")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "past"
                    ? "bg-surface text-ink shadow-xs"
                    : "text-text-secondary hover:text-ink"
                }`}
              >
                Past
              </button>
            </div>
          </div>

          {/* Trip Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-2xl bg-muted/40 border border-border animate-pulse flex flex-col p-4 justify-between"
                >
                  <div className="w-full h-44 bg-muted/60 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/70 rounded w-3/4" />
                    <div className="h-3 bg-muted/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={searchQuery ? SlidersHorizontal : Map}
              title={searchQuery ? "No trips match your search" : "No trips yet"}
              description={
                searchQuery
                  ? "Try changing your search terms or view all trips."
                  : "Create your first group trip to start planning the perfect getaway with friends."
              }
              actionLabel={searchQuery ? "Clear Search" : "Create a Trip"}
              onAction={
                searchQuery
                  ? () => setSearchQuery("")
                  : () => router.push("/trip/new")
              }
            />
          )}

          {/* Quick AI Suggestion Promo Banner */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary-pale via-surface to-ocean-light border border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">
                  Want Gemini to build a custom itinerary in 10 seconds?
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Pick your destination, style, and travel companions. SyncTrip generates day-by-day routes and expense estimations automatically.
                </p>
              </div>
            </div>
            <Link
              href="/trip/new?ai=true"
              className={buttonVariants({
                variant: "outline",
                className:
                  "border-primary text-primary hover:bg-primary hover:text-white shrink-0 font-medium px-4 py-2",
              })}
            >
              Try AI Trip Builder
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
