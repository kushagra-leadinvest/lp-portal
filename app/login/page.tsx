"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F1F3D] px-4">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C] mb-4">
          <span className="text-2xl font-bold text-[#0F1F3D]">LI</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Lead Invest
        </h1>
        <p className="text-sm text-blue-200 mt-1">Investor Portal</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        {!sent ? (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Sign in
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email and we&apos;ll send you a secure login link. No
              password needed.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 px-4 bg-[#0F1F3D] hover:bg-[#1A3060] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F1F3D]"
              >
                {loading ? "Sending..." : "Send login link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              We sent a login link to
            </p>
            <p className="text-sm font-medium text-gray-900 mb-4">{email}</p>
            <p className="text-xs text-gray-400">
              The link expires in 1 hour. Check your spam folder if you
              don&apos;t see it.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-6 text-sm text-[#0F1F3D] hover:underline"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-blue-300 text-center">
        Access is restricted to registered Lead Invest LPs only.
        <br />
        Contact{" "}
        <a
          href="mailto:kushagra@leadinvest.in"
          className="underline hover:text-white"
        >
          kushagra@leadinvest.in
        </a>{" "}
        for help.
      </p>
    </div>
  );
}
