"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup" | "forgot" | "reset";

const copy: Record<Mode, { title: string; cta: string }> = {
  login: { title: "Sign in to ProcurePath", cta: "Sign in" },
  signup: { title: "Create your workspace", cta: "Create account" },
  forgot: { title: "Reset your password", cta: "Send reset link" },
  reset: { title: "Choose a new password", cta: "Update password" },
};

export default function AuthForm({ mode, initialError }: { mode: Mode; initialError?: string }) {
  const [error, setError] = useState(initialError ?? "");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    const origin = window.location.origin;
    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign("/app");
      } else if (mode === "signup") {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { company: String(f.get("company") ?? "").trim() || "My company" }, emailRedirectTo: `${origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) window.location.assign("/app");
        else setInfo("Check your email to confirm your address, then sign in.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/reset-password` });
        if (error) throw error;
        setInfo("If that address has an account, a reset link is on its way.");
      } else {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        window.location.assign("/app");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-3xl font-light tracking-tight text-ink">{copy[mode].title}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <label className="block"><span className="lbl">Company</span>
            <input name="company" required maxLength={120} className="inp" autoComplete="organization" /></label>
        )}
        {mode !== "reset" && (
          <label className="block"><span className="lbl">Work email</span>
            <input name="email" type="email" required className="inp" autoComplete="email" /></label>
        )}
        {mode !== "forgot" && (
          <label className="block"><span className="lbl">{mode === "reset" ? "New password" : "Password"}</span>
            <input name="password" type="password" required minLength={8} className="inp" autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        )}
        {error && <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {info && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{info}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? "Please wait…" : copy[mode].cta}</button>
      </form>
      <div className="mt-6 space-y-2 text-sm text-muted">
        {mode === "login" && <>
          <p><Link href="/forgot-password" className="underline">Forgot password?</Link></p>
          <p>New here? <Link href="/signup" className="underline">Create a workspace</Link></p></>}
        {mode === "signup" && <p>Already have an account? <Link href="/login" className="underline">Sign in</Link></p>}
        {mode === "forgot" && <p><Link href="/login" className="underline">Back to sign in</Link></p>}
      </div>
    </div>
  );
}
