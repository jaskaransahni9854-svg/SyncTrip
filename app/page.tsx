import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Layers,
  Heart,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 text-ink">
      {/* Top Header */}
      <header className="px-6 h-18 flex items-center justify-between border-b border-border/80 bg-surface/80 backdrop-blur sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-ink leading-none">SyncTrip</span>
            <span className="text-[10px] text-text-muted font-medium mt-0.5 tracking-wider uppercase">
              AI Group Travel
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={buttonVariants({
              variant: "ghost",
              className: "font-medium text-sm text-text-secondary hover:text-ink",
            })}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({
              className:
                "bg-primary hover:bg-primary-dark text-white font-medium text-sm shadow-sm px-4 py-2",
            })}
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary/15 via-ocean/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream border border-primary/20 text-xs font-semibold text-primary mb-6 shadow-xs animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" />
          <span>Powered by Google Gemini 2.5 AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink max-w-4xl leading-[1.1] mb-6">
          One Trip Becomes One{" "}
          <span className="bg-gradient-to-r from-primary via-primary-dark to-ocean bg-clip-text text-transparent">
            Shared Workspace
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed mb-8">
          Stop getting lost in messy group chats and scattered spreadsheets. SyncTrip gives your entire travel crew collaborative itineraries, instant expense splitting, and AI-crafted daily plans.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-12">
          <Link
            href="/signup"
            className={buttonVariants({
              size: "lg",
              className:
                "w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-base font-semibold px-8 py-3.5 shadow-lg shadow-primary/25 flex items-center justify-center gap-2",
            })}
          >
            Create Your Trip Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className:
                "w-full sm:w-auto border-border bg-surface text-ink text-base font-medium px-6 py-3.5 hover:bg-muted/50",
            })}
          >
            Explore 1-Click Demo
          </Link>
        </div>

        {/* Feature Pill Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full text-left">
          {[
            {
              icon: Layers,
              title: "Live Day-by-Day",
              desc: "Collaborative itinerary with real-time updates and voting",
            },
            {
              icon: DollarSign,
              title: "Fair Expense Split",
              desc: "Automatic debt settlements: who owes who and receipt tracking",
            },
            {
              icon: Sparkles,
              title: "Gemini AI Planner",
              desc: "Custom personalized schedules based on group vibe and budget",
            },
            {
              icon: MapPin,
              title: "Route Visualizer",
              desc: "Geographical route pins and maps for every scheduled activity",
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs hover:border-primary/40 transition-all space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-pale text-primary flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-ink">{feat.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Trip Workspace Preview Showcase */}
      <section className="py-16 px-6 bg-cream/60 border-y border-border">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <Badge className="bg-primary-light text-primary-dark border-none font-bold text-xs uppercase">
              The Experience
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              Designed for effortless group travel
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Everything your travel crew needs in one clean, synchronized dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-border shadow-2xl bg-surface overflow-hidden">
            <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-error/40" />
              <div className="w-3 h-3 rounded-full bg-primary/40" />
              <div className="w-3 h-3 rounded-full bg-nature/40" />
              <span className="text-xs text-text-muted mx-auto font-mono">
                synctrip.com/trip/trip_kyoto_2026
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-ink">Kyoto Cherry Blossom Expedition</h3>
                    <Badge className="bg-nature text-white text-[10px]">Active Workspace</Badge>
                  </div>
                  <p className="text-xs text-text-secondary flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Apr 5 – Apr 12, 2026 • 4 Travelers • $4,200 Budget
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary bg-primary-pale px-3 py-1.5 rounded-lg border border-primary/20">
                    Live Real-Time Sync
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1">
                  <span className="text-xs font-bold text-text-muted uppercase">DAY 1 ITINERARY</span>
                  <h4 className="text-sm font-bold text-ink">Fushimi Inari Torii Gate Hike</h4>
                  <p className="text-xs text-text-secondary">09:30 AM • 3 Upvotes from crew</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1">
                  <span className="text-xs font-bold text-text-muted uppercase">EXPENSE LOGGED</span>
                  <h4 className="text-sm font-bold text-ink">Ryokan Villa (3 Nights)</h4>
                  <p className="text-xs text-text-secondary">$1,850 • Split equally among 4</p>
                </div>

                <div className="p-4 rounded-xl bg-primary-pale/60 border border-primary/30 space-y-1">
                  <span className="text-xs font-bold text-primary uppercase">SETTLEMENT CALC</span>
                  <h4 className="text-sm font-bold text-ink">Sarah Chen owes Alex Rivera</h4>
                  <p className="text-xs text-text-secondary">$165.00 • Calculated automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 px-6 bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <span className="font-bold text-ink">SyncTrip</span>
            <span>— AI-Powered Group Travel Planner</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-ink">Sign In</Link>
            <Link href="/signup" className="hover:text-ink">Create Workspace</Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-coral fill-coral" /> for travelers
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
