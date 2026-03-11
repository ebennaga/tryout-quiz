"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from("results")
        .select(
          `
          id,
          raw_score,
          final_score,
          created_at,
          tryout_id,
          tryouts (
            title,
            duration_minutes
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal fetch results:", error.message);
        return;
      }

      setResults(data || []);
      setLoading(false);
    };

    fetchResults();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    return "text-red-500";
  };

  const highestScore =
    results.length > 0 ? Math.max(...results.map((r) => r.raw_score)) : 0;

  const averageScore =
    results.length > 0
      ? (results.reduce((a, b) => a + b.raw_score, 0) / results.length).toFixed(
          0,
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center">
        <p className="text-slate-600">Loading hasil ujian...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Hasil Ujian</h1>
            <p className="text-slate-600 mt-2">
              Riwayat semua hasil tryout kamu
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            ← Kembali ke Dashboard
          </button>
        </div>

        {/* Ringkasan */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-sm text-slate-500 mb-2">Total Ujian</h3>
            <p className="text-3xl font-bold">{results.length}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-sm text-slate-500 mb-2">Skor Tertinggi</h3>
            <p className="text-3xl font-bold text-green-600">{highestScore}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-sm text-slate-500 mb-2">Rata-rata Skor</h3>
            <p className="text-3xl font-bold text-blue-600">{averageScore}</p>
          </div>
        </div>

        {/* List Hasil */}
        {results.length === 0 ? (
          <div className="text-center text-slate-500 mt-20">
            <p className="text-xl">Belum ada hasil ujian.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Mulai Tryout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((item, index) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {item.tryouts?.title || "Tryout"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    📅{" "}
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Skor Mentah</p>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(item.raw_score)}`}
                  >
                    {item.raw_score}
                    <span className="text-sm text-slate-400 font-normal">
                      {" "}
                      / 550
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Nilai SKD:{" "}
                    <span className="font-semibold text-slate-700">
                      {item.final_score}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
