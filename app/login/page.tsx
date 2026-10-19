"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: check is_registered_lp server-side before sending any OTP
      const checkRes = await fetch("/api/check-lp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!checkRes.ok) {
        throw new Error("Unable to verify registration status.");
      }

      const { registered } = await checkRes.json();

      // Step 2: only send the magic link if the LP is registered
      if (registered) {
        const supabase = createClient();
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (otpError) {
          setError(otpError.message);
          setLoading(false);
          return;
        }
      }

      // Step 3: show the same success message regardless of registration status
      // (do not reveal whether the email exists in the system)
      setSent(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Lead Invest"
            width={140}
            height={48}
            priority
          />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
          LP Portal
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Sign in to your investor account
        </p>

        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500">
              If your email address is registered, you will receive a login link shortly.
            </p>
          </div>
        ) : (
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
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#8B1A1A] text-white text-sm font-medium rounded-md hover:bg-[#7a1616] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Checking..." : "Send login link"}
            </button>
          </form>
        )}

        <p className="mt-8 text-xs text-gray-400 text-center">
          Access is restricted to registered Lead Invest LPs only.
        </p>
      </div>
    </div>
  );
}
