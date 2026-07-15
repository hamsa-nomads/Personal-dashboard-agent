"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: form.get("code") }) });
    const payload = await response.json() as { error?: string };
    if (response.ok) window.location.href = "/";
    else setError(payload.error ?? "Could not sign in.");
    setLoading(false);
  }

  return <main className="login-screen"><section className="login-card"><div className="login-mark">D</div><span className="login-icon"><LockKeyhole /></span><h1>Dayframe</h1><p>Private workspace for Leah and Moshe.</p><form onSubmit={login}><label>Shared access code<input type="password" name="code" autoComplete="current-password" autoFocus required /></label>{error && <div className="login-error">{error}</div>}<button className="primary" disabled={loading}>{loading ? "Opening…" : "Open dashboard"}</button></form><small>The code is verified on the server and stored only as a secure session cookie.</small></section></main>;
}
