"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "set-password">("login");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (type === "recovery" && accessToken) {
        const supabase = createClient();
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? "",
        }).then(() => {
          setMode("set-password");
        });
      }
    }
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo.png"
            alt="Lead Invest"
            width={120}
            height={64}
            className="h-16 w-auto mb-3"
          />
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Investor Portal
          </p>
        </div>

        {mode === "set-password" ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Set your password</h2>
            <p className="text-sm text-gray-500 mb-5">Choose a password for your account.</p>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent transition"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || password.length < 8}
                className="w-full py-2.5 px-4 bg-[#8B1A1A] hover:bg-[#7a1717] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
              >
                {loading ? "Saving..." : "Set password & sign in"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in to your account</h2>
            <p className="text-sm text-gray-500 mb-5">Enter your registered email and password.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent transition"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-2.5 px-4 bg-[#8B1A1A] hover:bg-[#7a1717] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Access is restricted to registered Lead Invest LPs only.
        <br />
        Contact{" "}
        <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">
          kushagra@leadinvest.in
        </a>{" "}
        for help.
      </p>
    </div>
  );
}
