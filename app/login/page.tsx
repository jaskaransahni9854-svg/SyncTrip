"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/schemas/auth";
import { Compass, Sparkles, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
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
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log in. Please check your credentials.";
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
          One shared workspace for your entire travel crew
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-border/80 bg-surface">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-ink">Welcome back</CardTitle>
          <CardDescription className="text-text-secondary text-sm">
            Sign in to access your shared group itineraries
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className={errors.email ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.email && (
                <p className="text-xs text-error font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-ink" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className={errors.password ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.password && (
                <p className="text-xs text-error font-medium">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 shadow-sm transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
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
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/50 py-4 bg-muted/20">
          <p className="text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
