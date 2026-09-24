"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getInvitationById, acceptInvitation } from "@/lib/invitations";
import { TripInvitation } from "@/types/trip";
import { Compass, MapPin, Users, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export default function InviteAcceptPage({
  params,
}: {
  params: Promise<{ inviteId: string }>;
}) {
  const { inviteId } = use(params);
  const router = useRouter();
  const { user, loginDemo } = useAuth();
  const [invite, setInvite] = useState<TripInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const inv = await getInvitationById(inviteId);
        setInvite(inv);
      } catch (e) {
        console.error("Failed to load invite", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [inviteId]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      // If user isn't logged in yet, sign in as a guest collaborator
      const activeUser = user || {
        uid: "guest_" + Date.now().toString(36),
        email: invite?.invitedEmail || "traveler@synctrip.com",
        displayName: "Fellow Explorer",
        createdAt: new Date().toISOString(),
      };

      if (!user) {
        loginDemo(activeUser);
      }

      const res = await acceptInvitation(inviteId, activeUser);
      router.push(`/trip/${res.tripId}`);
    } catch (e) {
      console.error("Failed to accept invite", e);
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-text-secondary mt-3">Loading invitation...</p>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-bold text-ink">Invitation Expired or Invalid</h2>
          <p className="text-sm text-text-secondary mt-2 mb-6">
            This invitation link is no longer valid or has already expired.
          </p>
          <Link
            href="/dashboard"
            className={buttonVariants({ className: "w-full" })}
          >
            Return to Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/25">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-ink">SyncTrip</span>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-xl border border-border/80 bg-surface overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-primary to-ocean" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3">
            <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-md">
              {invite.invitedBy.photoURL ? (
                <AvatarImage src={invite.invitedBy.photoURL} alt={invite.invitedBy.displayName} />
              ) : (
                <AvatarFallback className="bg-primary text-white text-lg font-bold">
                  {invite.invitedBy.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <CardTitle className="text-xl font-bold text-ink">
            {invite.invitedBy.displayName} invited you!
          </CardTitle>
          <CardDescription className="text-text-secondary text-sm">
            Join the collaborative workspace for this upcoming group trip
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-cream border border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase font-bold tracking-wider">
                Trip Invitation
              </span>
              <Badge className="bg-primary-light text-primary-dark border-none font-semibold text-[10px]">
                {invite.role} Access
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-ink">{invite.tripTitle}</h3>
            <p className="text-xs text-text-secondary flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {invite.destination}
            </p>
          </div>

          <div className="space-y-2 text-xs text-text-secondary bg-surface p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-ink font-medium">
              <Users className="w-4 h-4 text-primary" />
              <span>What you can do in this workspace:</span>
            </div>
            <ul className="pl-6 list-disc space-y-1 text-text-secondary">
              <li>Add and vote on daily itinerary activities</li>
              <li>Track and split group expenses</li>
              <li>View interactive routes and destination maps</li>
              <li>Collaborate in real time with all travelers</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 pb-6">
          <Button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 shadow-md shadow-primary/20 text-base"
          >
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining Workspace...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accept & Join Workspace
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-text-muted hover:text-ink text-xs"
          >
            Decline Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
