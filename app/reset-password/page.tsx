"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { resetPasswordSchema } from "@/schemas/auth";
import { Compass, AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid email");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset link.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-md mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-ink">SyncTrip</span>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg border-border/80 bg-surface">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-ink">Reset Password</CardTitle>
          <CardDescription className="text-text-secondary text-sm">
            Enter your email to receive instructions to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {success ? (
            <div className="p-4 rounded-lg bg-nature/10 border border-nature/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-nature mx-auto" />
              <h4 className="font-semibold text-ink text-base">Check your email</h4>
              <p className="text-sm text-text-secondary">
                If an account exists for <span className="font-medium text-ink">{email}</span>, we have sent password reset instructions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink" htmlFor="email">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 shadow-sm transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/50 py-4 bg-muted/20">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
