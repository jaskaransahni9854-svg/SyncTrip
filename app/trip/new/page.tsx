"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { createTrip } from "@/lib/trips";
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  Check,
  CheckCircle2,
  Loader2,
  X,
  Palmtree,
  Mountain,
  Utensils,
  Camera,
} from "lucide-react";

const POPULAR_DESTINATIONS = [
  {
    name: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    lat: 35.0116,
    lng: 135.7681,
  },
  {
    name: "Amalfi Coast, Italy",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    lat: 40.6333,
    lng: 14.6029,
  },
  {
    name: "Barcelona, Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    lat: 41.3879,
    lng: 2.16992,
  },
  {
    name: "Banff, Alberta, Canada",
    image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80",
    lat: 51.1784,
    lng: -115.5708,
  },
  {
    name: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    lat: -8.4095,
    lng: 115.1889,
  },
  {
    name: "Reykjavik & Golden Circle, Iceland",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80",
    lat: 64.1466,
    lng: -21.9426,
  },
];

function CreateTripWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAI = searchParams.get("ai") === "true";
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState("");
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState(POPULAR_DESTINATIONS[0].image);
  const [startDate, setStartDate] = useState("2026-06-10");
  const [endDate, setEndDate] = useState("2026-06-17");
  const [totalBudget, setTotalBudget] = useState("3500");
  const [currency, setCurrency] = useState("USD");
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [enableAI, setEnableAI] = useState(initialAI);
  const [travelStyle, setTravelStyle] = useState<string>("balanced");
  const [submitting, setSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: POPULAR_DESTINATIONS[0].lat,
    lng: POPULAR_DESTINATIONS[0].lng,
  });

  const handleSelectDestination = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setDestination(dest.name);
    setCoverImage(dest.image);
    setCoordinates({ lat: dest.lat, lng: dest.lng });
    if (!title) {
      setTitle(`${dest.name.split(",")[0]} Group Getaway`);
    }
  };

  const handleAddEmail = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = currentEmail.trim().toLowerCase();
    if (trimmed && trimmed.includes("@") && !inviteEmails.includes(trimmed)) {
      setInviteEmails([...inviteEmails, trimmed]);
      setCurrentEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInviteEmails(inviteEmails.filter((em) => em !== emailToRemove));
  };

  const handleCreateTrip = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const finalTitle = title.trim() || `${destination.split(",")[0]} Trip`;
      const budgetNum = parseFloat(totalBudget) || 2500;

      // Construct members map with current user as OWNER
      const membersMap: Record<string, {
        uid: string;
        email: string;
        displayName: string;
        photoURL?: string;
        role: "OWNER";
        joinedAt: string;
      }> = {
        [user.uid]: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "OWNER",
          joinedAt: new Date().toISOString(),
        },
      };

      const newTrip = await createTrip({
        title: finalTitle,
        destination: destination || "Uncharted Adventure",
        coverImage,
        coordinates,
        startDate,
        endDate,
        totalBudget: budgetNum,
        currency,
        ownerId: user.uid,
        memberIds: [user.uid],
        members: membersMap,
        status: "planning",
        aiGenerated: enableAI,
        description: `${travelStyle.toUpperCase()} group exploration with ${inviteEmails.length + 1} friends.`,
      });

      router.push(`/trip/${newTrip.id}`);
    } catch (err) {
      console.error("Error creating trip:", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/25">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-ink">SyncTrip</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-text-secondary hover:text-ink flex items-center gap-1"
        >
          Cancel
        </Link>
      </header>

      <main className="max-w-3xl w-full mx-auto p-6 md:p-10 flex-1">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-xs font-semibold text-text-secondary">
            <span>Step {step} of 4</span>
            <span>
              {step === 1 && "Destination & Vibe"}
              {step === 2 && "Dates & Trip Name"}
              {step === 3 && "Budget & Crew"}
              {step === 4 && "AI & Final Review"}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Destination */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-ink">Where are you heading?</h2>
              <p className="text-sm text-text-secondary mt-1">
                Enter your destination or choose from popular trending spots.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink" htmlFor="destination-input">
                Destination City or Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  id="destination-input"
                  placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10 h-11 text-base bg-surface"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-3">
                Trending Destinations
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => handleSelectDestination(dest)}
                    className={`relative rounded-xl overflow-hidden h-28 border text-left p-3 flex flex-col justify-end transition-all ${
                      destination === dest.name
                        ? "border-primary ring-2 ring-primary/30 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {destination === dest.name && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <span className="relative z-10 text-xs font-bold text-white leading-tight">
                      {dest.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                disabled={!destination.trim()}
                onClick={() => {
                  if (!title) setTitle(`${destination.split(",")[0]} Trip`);
                  setStep(2);
                }}
                className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 flex items-center gap-2"
              >
                Next: Dates
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Dates & Title */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-ink">When is the trip?</h2>
              <p className="text-sm text-text-secondary mt-1">
                Set travel dates and give your shared workspace a name.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink" htmlFor="trip-title">
                Trip Name
              </label>
              <Input
                id="trip-title"
                placeholder="e.g. Kyoto Cherry Blossom Tour"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 bg-surface text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink flex items-center gap-1.5" htmlFor="start-date">
                  <Calendar className="w-4 h-4 text-primary" />
                  Departure Date
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 bg-surface"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink flex items-center gap-1.5" htmlFor="end-date">
                  <Calendar className="w-4 h-4 text-primary" />
                  Return Date
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 bg-surface"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                disabled={!title.trim() || !startDate || !endDate}
                onClick={() => setStep(3)}
                className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 flex items-center gap-2"
              >
                Next: Budget & Crew
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Budget & Friends */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-ink">Budget & Travel Crew</h2>
              <p className="text-sm text-text-secondary mt-1">
                Estimate your group target budget and invite friends to collaborate.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold text-ink flex items-center gap-1.5" htmlFor="total-budget">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Total Target Budget
                </label>
                <Input
                  id="total-budget"
                  type="number"
                  placeholder="3500"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="h-11 bg-surface text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink" htmlFor="currency-select">
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-11 bg-surface border border-border rounded-lg px-3 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                Invite Friends (Email Addresses)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="friend@example.com"
                  type="email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  onKeyDown={handleAddEmail}
                  className="h-11 bg-surface"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddEmail}
                  className="h-11 px-4 border-primary/30 text-primary hover:bg-primary-light"
                >
                  Add
                </Button>
              </div>

              {inviteEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {inviteEmails.map((em) => (
                    <Badge
                      key={em}
                      variant="secondary"
                      className="px-2.5 py-1 text-xs bg-cream border border-border flex items-center gap-1.5 text-ink"
                    >
                      {em}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(em)}
                        className="hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 flex items-center gap-2"
              >
                Next: AI & Review
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: AI & Review */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-ink">AI Assistant & Final Review</h2>
              <p className="text-sm text-text-secondary mt-1">
                Choose how your itinerary is created and launch your shared workspace.
              </p>
            </div>

            {/* AI Toggle Card */}
            <Card
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                enableAI
                  ? "border-primary bg-primary-pale/40 ring-2 ring-primary/20"
                  : "border-border bg-surface"
              }`}
              onClick={() => setEnableAI(!enableAI)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      enableAI ? "bg-primary text-white" : "bg-muted text-text-secondary"
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink flex items-center gap-2">
                      Generate Itinerary with Google Gemini AI
                      <Badge className="bg-primary-light text-primary-dark border-none text-[10px]">
                        Recommended
                      </Badge>
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 max-w-md">
                      Gemini will craft a day-by-day itinerary tailored to your group size, budget, and travel preferences. You can edit any activity later.
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${
                    enableAI
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface"
                  }`}
                >
                  {enableAI && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {enableAI && (
                <div className="mt-5 pt-4 border-t border-primary/20 space-y-3" onClick={(e) => e.stopPropagation()}>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Travel Vibe & Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "balanced", label: "Balanced", icon: Palmtree },
                      { id: "adventure", label: "Adventure", icon: Mountain },
                      { id: "foodie", label: "Culinary", icon: Utensils },
                      { id: "sightseeing", label: "Culture", icon: Camera },
                    ].map((style) => {
                      const Icon = style.icon;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setTravelStyle(style.id)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            travelStyle === style.id
                              ? "bg-primary text-white border-primary"
                              : "bg-surface text-ink border-border hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Trip Summary Card */}
            <Card className="p-5 rounded-2xl bg-surface border border-border space-y-3">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                Workspace Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block">Destination</span>
                  <span className="font-semibold text-ink text-sm">{destination}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Dates</span>
                  <span className="font-semibold text-ink text-sm">{startDate} to {endDate}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Group Budget</span>
                  <span className="font-semibold text-ink text-sm">${totalBudget} {currency}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Crew</span>
                  <span className="font-semibold text-ink text-sm">
                    {inviteEmails.length + 1} travelers
                  </span>
                </div>
              </div>
            </Card>

            <div className="pt-4 flex justify-between">
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => setStep(3)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                disabled={submitting}
                onClick={handleCreateTrip}
                className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 flex items-center gap-2 shadow-md shadow-primary/20 text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Launching Workspace...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Create Trip Workspace
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function NewTripPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <CreateTripWizard />
      </Suspense>
    </ProtectedRoute>
  );
}
