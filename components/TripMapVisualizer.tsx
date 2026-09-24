"use client";

import React, { useState } from "react";
import { ItineraryItem } from "@/types/itinerary";
import { Trip } from "@/types/trip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Layers,
  Utensils,
  Camera,
  Compass,
  Bus,
} from "lucide-react";

interface TripMapVisualizerProps {
  trip: Trip;
  items: ItineraryItem[];
}

export function TripMapVisualizer({ trip, items }: TripMapVisualizerProps) {
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [activeItem, setActiveItem] = useState<ItineraryItem | null>(null);

  const filteredItems = items.filter((item) => {
    if (selectedDay === "all") return true;
    return item.dayNumber === selectedDay;
  });

  const availableDays = Array.from(new Set(items.map((i) => i.dayNumber))).sort((a, b) => a - b);

  // Compute center coordinate
  const centerLat = trip.coordinates?.lat || 35.0116;
  const centerLng = trip.coordinates?.lng || 135.7681;

  // OpenStreetMap embed URL
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.1}%2C${centerLat - 0.08}%2C${centerLng + 0.1}%2C${centerLat + 0.08}&layer=mapnik&marker=${centerLat}%2C${centerLng}`;

  const getCategoryIcon = (category: ItineraryItem["category"]) => {
    switch (category) {
      case "food":
        return <Utensils className="w-3.5 h-3.5 text-coral" />;
      case "transport":
        return <Bus className="w-3.5 h-3.5 text-ocean" />;
      case "sightseeing":
        return <Camera className="w-3.5 h-3.5 text-primary" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-nature" />;
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
      {/* Top Filter Bar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-ink">Route & Place Visualizer</span>
          <Badge variant="secondary" className="text-xs bg-cream text-ink">
            {filteredItems.length} locations
          </Badge>
        </div>

        {/* Day Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedDay("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              selectedDay === "all"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:text-ink border border-border"
            }`}
          >
            All Days
          </button>
          {availableDays.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                selectedDay === d
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:text-ink border border-border"
              }`}
            >
              Day {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[460px]">
        {/* Left Side: Places list */}
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-border max-h-[500px] overflow-y-auto space-y-2.5">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            Stops on Route ({filteredItems.length})
          </h4>

          {filteredItems.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-8">
              No itinerary items found for this day.
            </p>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  activeItem?.id === item.id
                    ? "border-primary bg-primary-pale/40 shadow-xs"
                    : "border-border/70 hover:border-primary/40 bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-light text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-ink line-clamp-1">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {getCategoryIcon(item.category)}
                    {item.time && (
                      <span className="text-[10px] font-medium text-text-muted">
                        {item.time}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1 line-clamp-1">
                  <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                  {item.locationName}
                </p>

                {item.estimatedCost > 0 && (
                  <span className="text-[10px] font-semibold text-primary mt-1.5 block">
                    Est. ${item.estimatedCost}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right Side: Map Display */}
        <div className="lg:col-span-2 relative h-[380px] lg:h-auto min-h-[400px] bg-muted/20">
          <iframe
            title="Interactive Destination Map"
            src={mapSrc}
            className="w-full h-full border-none"
            loading="lazy"
          />

          {/* Active Item Overlay */}
          {activeItem && (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm bg-surface/95 backdrop-blur-md p-4 rounded-xl border border-border shadow-xl space-y-2 z-10 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1 capitalize">
                    {activeItem.category} • Day {activeItem.dayNumber}
                  </Badge>
                  <h4 className="text-sm font-bold text-ink">{activeItem.title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="text-text-muted hover:text-ink text-xs font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-text-secondary flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                {activeItem.locationName}
              </p>

              {activeItem.description && (
                <p className="text-xs text-text-muted line-clamp-2">
                  {activeItem.description}
                </p>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-border/60">
                <span className="text-xs font-bold text-ink">
                  {activeItem.estimatedCost > 0 ? `$${activeItem.estimatedCost}` : "Free"}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary-light"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${activeItem.title} ${activeItem.locationName} ${trip.destination}`
                      )}`,
                      "_blank"
                    );
                  }}
                >
                  <Navigation className="w-3 h-3" />
                  Google Maps
                  <ExternalLink className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
