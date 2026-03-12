"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResponses, setAiResponses] = useState<{
    [key: string]: { preview: string; full: string; unlocked: boolean };
  }>({});
  const [credits, setCredits] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      setUserId(uid || null);

      if (!uid) return;

      // Fetch credits
      const { data: creditData } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", uid)
        .single();
      setCredits(creditData?.balance || 0);

      // Fetch results
      const { data, error } = await supabase
        .from("results")
        .select(
          `id, raw_score, final_score, created_at, answers, tryout_id, tryouts (title, duration_minutes)`,
        )
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }
      setResults(data || []);
      setLoading(false);
    };

    fetchData();
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

  const generateAI = async (item: any): Promise<string> => {
    const answers = item.answers || [];
    const wrongAnswers = answers.filter((a: any) => !a.is_correct);
    const correctCount = answers.filter((a: any) => a.is_correct).length;

    const prompt = `Kamu adalah tutor CPNS yang membantu peserta memahami kesalahan mereka.

Data ujian:
- Tryout: ${item.tryouts?.title || "Tryout CPNS"}
- Skor: ${item.raw_score} / 550
- Benar: ${correctCount} dari ${answers.length} soal

Soal yang dijawab salah:
${wrongAnswers
  .map(
    (w: any, i: number) => `
${i + 1}. Soal: ${w.question_text}
   Jawaban user: ${w.user_answer_text || "Tidak dijawab"}
   Jawaban benar: ${w.correct_answer_text}
`,
  )
  .join("")}

Berikan:
1. Analisis singkat kelemahan berdasarkan soal yang salah
2. Pembahasan singkat tiap soal yang salah (kenapa jawaban benar itu benar)
3. 3 tips spesifik untuk meningkatkan skor

Gunakan bahasa Indonesia yang mudah dipahami. Gunakan emoji yang relevan.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content || "Gagal mendapatkan pembahasan."
    );
  };

  const handlePreview = async (item: any) => {
    // Toggle tutup
    if (expandedId === item.id && aiResponses[item.id]) {
      setExpandedId(null);
      return;
    }

    setExpandedId(item.id);

    // Sudah ada response sebelumnya
    if (aiResponses[item.id]) return;

    setAiLoading(item.id);

    try {
      const fullText = await generateAI(item);

      // Ambil 2-3 kalimat pertama sebagai preview
      const sentences = fullText.split(/(?<=[.!?])\s+/);
      const previewText = sentences.slice(0, 3).join(" ");

      setAiResponses((prev) => ({
        ...prev,
        [item.id]: { preview: previewText, full: fullText, unlocked: false },
      }));
    } catch (err) {
      setAiResponses((prev) => ({
        ...prev,
        [item.id]: {
          preview: "Gagal memuat preview.",
          full: "",
          unlocked: false,
        },
      }));
    }

    setAiLoading(null);
  };

  const handleUnlock = async (item: any) => {
    if (credits < 1) {
      router.push("/dashboard/credits");
      return;
    }

    if (!userId) return;

    // Potong 1 kredit
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ balance: credits - 1, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (updateError) {
      alert("Gagal memotong kredit. Coba lagi.");
      return;
    }

    // Catat transaksi
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -1,
      type: "debit",
      description: `Pembahasan AI: ${item.tryouts?.title || "Tryout"}`,
    });

    setCredits((prev) => prev - 1);

    // Unlock full response
    setAiResponses((prev) => ({
      ...prev,
      [item.id]: { ...prev[item.id], unlocked: true },
    }));
  };

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
          <div className="flex items-center gap-3">
            {/* Saldo kredit */}
            <div
              className="px-4 py-2 rounded-xl border border-violet-200 bg-violet-50 cursor-pointer hover:bg-violet-100 transition"
              onClick={() => router.push("/dashboard/credits")}
            >
              <p className="text-xs text-violet-500">Kredit</p>
              <p className="font-bold text-violet-700">{credits} kredit</p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              ← Kembali ke Dashboard
            </button>
          </div>
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
            {results.map((item) => {
              const wrongAnswers = (item.answers || []).filter(
                (a: any) => !a.is_correct,
              );
              const correctCount = (item.answers || []).filter(
                (a: any) => a.is_correct,
              ).length;
              const isExpanded = expandedId === item.id;
              const isAiLoading = aiLoading === item.id;
              const aiData = aiResponses[item.id];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  {/* Row utama */}
                  <div className="p-6 flex justify-between items-center">
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

                    <div className="flex items-center gap-6">
                      {/* Benar / Salah */}
                      <div className="text-center border-l border-slate-100 pl-6">
                        <p className="text-sm text-slate-500 mb-1">
                          Benar / Salah
                        </p>
                        <p className="text-xl font-bold">
                          <span className="text-green-600">{correctCount}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-red-500">
                            {wrongAnswers.length}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          dari {(item.answers || []).length} soal
                        </p>
                      </div>

                      {/* Score */}
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

                      {/* Tombol pembahasan AI */}
                      <button
                        onClick={() => handlePreview(item)}
                        disabled={isAiLoading}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 hover:bg-violet-100"
                        style={{
                          background: isExpanded ? "#ede9fe" : "#f5f3ff",
                          color: "#7c3aed",
                          border: "1px solid #ddd6fe",
                        }}
                      >
                        {isAiLoading
                          ? "⏳ Memuat..."
                          : isExpanded
                            ? "✦ Tutup"
                            : "✦ Pembahasan AI"}
                      </button>
                    </div>
                  </div>

                  {/* Panel pembahasan */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {/* Soal yang salah */}
                      {wrongAnswers.length > 0 && (
                        <div className="p-6 border-b border-slate-100 bg-red-50">
                          <p className="text-sm font-semibold text-red-600 mb-4">
                            ✗ Soal yang Salah ({wrongAnswers.length} soal)
                          </p>
                          <div className="space-y-3">
                            {wrongAnswers.map((w: any, i: number) => (
                              <div
                                key={i}
                                className="bg-white rounded-xl p-4 border border-red-100"
                              >
                                <p className="text-sm text-slate-700 mb-3 font-medium">
                                  {i + 1}. {w.question_text}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div>
                                    <span className="text-red-500 font-medium">
                                      Jawabanmu:{" "}
                                    </span>
                                    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                      {w.user_answer_text || "Tidak dijawab"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-green-600 font-medium">
                                      Jawaban benar:{" "}
                                    </span>
                                    <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded">
                                      {w.correct_answer_text}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Response */}
                      <div className="p-6 bg-violet-50">
                        <p className="text-sm font-semibold text-violet-700 mb-4">
                          ✦ Analisis & Tips dari AI
                        </p>

                        {isAiLoading ? (
                          <div className="space-y-2">
                            {[100, 80, 90, 70].map((w, i) => (
                              <div
                                key={i}
                                className="h-4 bg-violet-100 rounded animate-pulse"
                                style={{ width: `${w}%` }}
                              />
                            ))}
                          </div>
                        ) : aiData ? (
                          <div>
                            {/* Preview text */}
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {aiData.unlocked ? aiData.full : aiData.preview}
                            </p>

                            {/* Blur overlay + unlock button */}
                            {!aiData.unlocked && (
                              <div className="mt-4">
                                {/* Blur teaser */}
                                <div
                                  style={{
                                    filter: "blur(4px)",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                    opacity: 0.5,
                                  }}
                                  className="text-sm text-slate-700 leading-relaxed"
                                >
                                  Lorem ipsum dolor sit amet consectetur
                                  adipisicing elit. Quisquam voluptates, quod,
                                  quia, voluptatem quae voluptas quidem natus
                                  consequatur fugiat doloribus reprehenderit.
                                  Quisquam voluptates, quod. Pembahasan soal
                                  nomor 2 memerlukan pemahaman mendalam tentang
                                  konsep dasar Pancasila sebagai pandangan hidup
                                  bangsa yang mencakup seluruh aspek kehidupan
                                  berbangsa dan bernegara.
                                </div>

                                {/* Unlock card */}
                                <div className="mt-4 bg-white rounded-xl border border-violet-200 p-5 text-center shadow-sm">
                                  <p className="text-2xl mb-2">🔒</p>
                                  <p className="font-semibold text-slate-800 mb-1">
                                    Lihat Analisis Lengkap
                                  </p>
                                  <p className="text-sm text-slate-500 mb-4">
                                    Gunakan{" "}
                                    <span className="font-semibold text-violet-600">
                                      1 kredit
                                    </span>{" "}
                                    untuk membaca pembahasan lengkap + tips
                                    belajar dari AI
                                  </p>

                                  {credits >= 1 ? (
                                    <button
                                      onClick={() => handleUnlock(item)}
                                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition"
                                    >
                                      🔓 Buka Sekarang — 1 Kredit
                                    </button>
                                  ) : (
                                    <div>
                                      <p className="text-sm text-red-500 mb-3">
                                        Kredit kamu habis!
                                      </p>
                                      <button
                                        onClick={() =>
                                          router.push("/dashboard/credits")
                                        }
                                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium text-sm transition"
                                      >
                                        💳 Beli Kredit Sekarang
                                      </button>
                                    </div>
                                  )}

                                  <p className="text-xs text-slate-400 mt-3">
                                    Saldo saat ini: {credits} kredit
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
