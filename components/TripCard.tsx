import React from "react";
import Link from "next/link";
import { Trip } from "@/types/trip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Sparkles, Users, ArrowUpRight } from "lucide-react";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const membersList = Object.values(trip.members || {});
  const displayedMembers = membersList.slice(0, 3);
  const remainingCount = membersList.length - displayedMembers.length;

  const formatDateRange = (start: string, end: string) => {
    try {
      const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const e = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${s} – ${e}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  const getStatusBadge = (status: Trip["status"]) => {
    switch (status) {
      case "ongoing":
        return <Badge className="bg-nature text-white border-none font-medium">Active Trip</Badge>;
      case "completed":
        return <Badge className="bg-muted text-text-secondary border-none">Completed</Badge>;
      default:
        return <Badge className="bg-primary-light text-primary-dark border-primary/20 font-medium">Planning</Badge>;
    }
  };

  return (
    <Link href={`/trip/${trip.id}`} className="group block focus:outline-none">
      <Card className="overflow-hidden border border-border/80 bg-surface rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/40 group-hover:-translate-y-1">
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          {trip.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trip.coverImage}
              alt={trip.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 to-ocean/30 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          <div className="absolute top-3 left-3 flex gap-2 items-center">
            {getStatusBadge(trip.status)}
            {trip.aiGenerated && (
              <Badge className="bg-white/90 backdrop-blur text-ink border-none flex items-center gap-1 font-semibold text-xs shadow-sm">
                <Sparkles className="w-3 h-3 text-primary fill-primary" />
                AI Generated
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary-light transition-colors drop-shadow-sm">
              {trip.title}
            </h3>
            <p className="text-white/80 text-xs flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary-light" />
              {trip.destination}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-text-muted" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <div className="font-semibold text-ink">
              ${trip.totalBudget.toLocaleString()} <span className="text-text-muted font-normal">budget</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2 overflow-hidden">
                {displayedMembers.map((member) => (
                  <Avatar key={member.uid} className="w-7 h-7 border-2 border-surface inline-block">
                    {member.photoURL ? (
                      <AvatarImage src={member.photoURL} alt={member.displayName} />
                    ) : (
                      <AvatarFallback className="text-[10px] bg-cream text-ink font-bold">
                        {member.displayName?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ))}
                {remainingCount > 0 && (
                  <div className="w-7 h-7 rounded-full bg-muted border-2 border-surface flex items-center justify-center text-[10px] font-bold text-text-secondary">
                    +{remainingCount}
                  </div>
                )}
              </div>
              <span className="text-xs text-text-muted flex items-center gap-1 pl-1">
                <Users className="w-3 h-3" />
                {membersList.length} {membersList.length === 1 ? "traveler" : "travelers"}
              </span>
            </div>

            <span className="text-xs font-semibold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Open Trip
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
