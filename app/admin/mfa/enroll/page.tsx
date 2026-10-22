"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminMfaEnrollPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const enroll = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Lead Invest",
        friendlyName: "Lead Invest Admin",
      });
      if (error || !data) {
        setError("Could not start enrollment. Please sign in again.");
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    };
    enroll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError || !challenge) {
        setError("Challenge failed. Please try again.");
        setLoading(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.replace(/\s/g, ""),
      });

      if (verifyError) {
        setError("Incorrect code. Please check your authenticator and try again.");
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-white font-semibold text-lg">Lead Invest</p>
          <p className="text-[10px] tracking-widest text-[#c0392b] uppercase font-bold mt-0.5">
            Admin Panel
          </p>
        </div>

        <h1 className="text-white text-sm font-medium mb-1 text-center">
          Set up two-factor authentication
        </h1>
        <p className="text-gray-400 text-xs text-center mb-6">
          Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code to confirm.
        </p>

        {qrCode ? (
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="TOTP QR code" width={160} height={160} />
            </div>
          </div>
        ) : (
          <div className="h-[184px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#8B1A1A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {secret && (
          <div className="mb-6 text-center">
            <p className="text-gray-500 text-[10px] mb-1">
              Or enter this code manually:
            </p>
            <p className="text-gray-300 text-xs font-mono select-all break-all">
              {secret}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            required
            className="w-full bg-gray-900 border border-gray-700 text-white text-center text-xl tracking-widest rounded-lg px-3 py-3 focus:outline-none focus:border-[#8B1A1A] transition"
          />

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length !== 6 || !factorId}
            className="w-full bg-[#8B1A1A] hover:bg-[#7a1717] text-white text-sm font-medium rounded-lg py-2.5 transition disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Activate and continue"}
          </button>
        </form>

        <button
          onClick={handleSignOut}
          className="w-full mt-3 text-gray-600 hover:text-gray-400 text-xs transition"
        >
          Cancel and sign out
        </button>
      </div>
    </div>
  );
}
