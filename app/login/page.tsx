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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSent(true); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Lead Invest" className="h-16 w-auto mb-3" />
          <p className="text-xs text-gray-400 tracking-widest uppercase">Investor Portal</p>
        </div>
        {!sent ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in to your account</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your registered email and we&apos;ll send you a secure login link.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent transition" />
              </div>
              {error && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading || !email}
                className="w-full py-2.5 px-4 bg-[#8B1A1A] hover:bg-[#6f1515] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B1A1A]">
                {loading ? "Sending..." : "Send login link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-1">We sent a login link to</p>
            <p className="text-sm font-medium text-gray-900 mb-4">{email}</p>
            <p className="text-xs text-gray-400">The link expires in 1 hour. Check your spam folder if you don&apos;t see it.</p>
            <button onClick={() => { setSent(false); setEmail(""); }} className="mt-6 text-sm text-[#8B1A1A] hover:underline">
              Use a different email
            </button>
          </div>
        )}
      </div>
      <p className="mt-6 text-xs text-gray-400 text-center">
        Access is restricted to registered Lead Invest LPs only.<br />
        Contact <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">kushagra@leadinvest.in</a> for help.
      </p>
    </div>
  );
}
