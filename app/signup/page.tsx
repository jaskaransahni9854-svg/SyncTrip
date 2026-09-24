"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { signupSchema } from "@/schemas/auth";
import { Compass, Sparkles, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginDemo } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const result = signupSchema.safeParse({
      displayName,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await signup(displayName, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    router.push("/dashboard");
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
        <p className="text-sm text-text-secondary">
          Join thousands of friends planning effortless adventures
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-border/80 bg-surface">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-ink">Create your account</CardTitle>
          <CardDescription className="text-text-secondary text-sm">
            Start organizing group trips with AI and live sync
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink" htmlFor="displayName">
                Full Name
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="Alex Rivera"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={submitting}
                className={errors.displayName ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.displayName && (
                <p className="text-xs text-error font-medium">{errors.displayName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink" htmlFor="email">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className={errors.email ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.email && (
                <p className="text-xs text-error font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className={errors.password ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.password && (
                <p className="text-xs text-error font-medium">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className={errors.confirmPassword ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-error font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 shadow-sm mt-2 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating workspace...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-text-muted font-medium">Or instant demo</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full border-primary/30 text-ink hover:bg-primary-light/50 font-medium flex items-center justify-center gap-2 py-2.5"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Instant 1-Click Demo Login
          </Button>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-nature" />
            <span>No credit card required. Free group workspace.</span>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/50 py-4 bg-muted/20">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
