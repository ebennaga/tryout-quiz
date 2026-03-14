"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!email) {
      setError("Email harus diisi.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });

    if (error) {
      setError("Gagal mengirim email. Pastikan email sudah terdaftar.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Cek Email Kamu!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Link reset password sudah dikirim ke{" "}
            <span className="font-semibold text-slate-700">{email}</span>. Klik
            link tersebut untuk membuat password baru.
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Tidak menerima email? Cek folder spam atau coba lagi.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-sm font-semibold transition mr-4"
            style={{ color: "#f97316" }}
          >
            Kirim Ulang
          </button>
          <button
            onClick={() => router.push("/auth/login")}
            className="text-sm text-slate-500 hover:text-slate-700 transition"
          >
            ← Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-slate-800">
            Forgot Password?
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Masukkan email kamu dan kami akan mengirimkan link untuk reset
            password.
          </p>
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4 bg-white"
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition disabled:opacity-50"
          style={{ background: "#f97316" }}
          onMouseEnter={(e) =>
            !loading && (e.currentTarget.style.background = "#ea6c0a")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f97316")}
        >
          {loading ? "Mengirim..." : "Send Reset Link"}
        </button>

        {/* Back to login */}
        <p className="text-center text-sm text-slate-500 mt-5">
          Ingat password kamu?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="font-semibold transition"
            style={{ color: "#f97316" }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
