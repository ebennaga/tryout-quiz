"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useParams, useRouter } from "next/navigation";

export default function PembahasanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiContent, setAiContent] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("results")
        .select(
          `id, raw_score, final_score, created_at, answers, ai_reviewed, ai_content, tryouts (title, duration_minutes)`,
        )
        .eq("id", id)
        .eq("user_id", userData.user.id)
        .single();

      if (error || !data) {
        router.push("/dashboard/results");
        return;
      }

      // Kalau belum di-review, redirect kembali
      if (!data.ai_reviewed) {
        router.push("/dashboard/results");
        return;
      }

      setResult(data);

      // Kalau sudah ada ai_content di DB, langsung pakai
      if (data.ai_content) {
        setAiContent(data.ai_content);
        setLoading(false);
        return;
      }

      // Kalau belum ada, generate ulang
      setLoading(false);
      generateAI(data);
    };

    fetchResult();
  }, [id]);

  const generateAI = async (data: any) => {
    setAiLoading(true);

    const answers = data.answers || [];
    const wrongAnswers = answers.filter((a: any) => !a.is_correct);
    const correctCount = answers.filter((a: any) => a.is_correct).length;

    const prompt = `Kamu adalah tutor CPNS yang membantu peserta memahami kesalahan mereka.

Data ujian:
- Tryout: ${data.tryouts?.title || "Tryout CPNS"}
- Skor: ${data.raw_score} / 550
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

Berikan pembahasan DETAIL untuk setiap soal yang salah:

Untuk soal TWK (Wawasan Kebangsaan — Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika):
- Jelaskan dasar hukum atau pasal yang relevan
- Jelaskan konteks sejarah atau makna yang terkandung
- Berikan fakta penting yang perlu diingat

Untuk soal TIU (Intelegensi Umum — deret angka, logika, verbal, matematika):
- Jelaskan LANGKAH DEMI LANGKAH cara menjawab
- Tunjukkan rumus atau pola yang digunakan
- Berikan contoh cara cepat menjawab

Untuk soal TKP (Karakteristik Pribadi):
- Jelaskan nilai atau prinsip yang diuji
- Jelaskan kenapa jawaban tersebut paling tepat dalam konteks ASN

Di akhir berikan:
- Analisis singkat kelemahan berdasarkan pola soal yang salah
- 3 rekomendasi belajar spesifik

Gunakan format rapi dengan nomor soal jelas. Gunakan emoji relevan. Bahasa Indonesia mudah dipahami.`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const json = await res.json();
      const text =
        json.choices?.[0]?.message?.content || "Gagal mendapatkan pembahasan.";

      // Simpan ke database
      await supabase.from("results").update({ ai_content: text }).eq("id", id);

      setAiContent(text);
    } catch (err) {
      setAiContent("Terjadi kesalahan. Silahkan coba lagi.");
    }

    setAiLoading(false);
  };

  const formatAIContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### "))
        return (
          <h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-2">
            {line.replace("### ", "")}
          </h3>
        );
      if (line.startsWith("## "))
        return (
          <h2 key={i} className="text-xl font-bold text-slate-800 mt-8 mb-3">
            {line.replace("## ", "")}
          </h2>
        );
      if (line.startsWith("**") && line.endsWith("**"))
        return (
          <p key={i} className="font-bold text-slate-800 mt-4 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      if (line.trim() === "") return <br key={i} />;
      return (
        <p
          key={i}
          className="text-sm text-slate-700 leading-relaxed mb-1"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center">
        <p className="text-slate-600">Memuat pembahasan...</p>
      </div>
    );
  }

  if (!result) return null;

  const wrongAnswers = (result.answers || []).filter((a: any) => !a.is_correct);
  const correctCount = (result.answers || []).filter(
    (a: any) => a.is_correct,
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Pembahasan AI</h1>
            <p className="text-slate-500 mt-1">
              {result.tryouts?.title || "Tryout CPNS"}
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/results")}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition text-sm"
          >
            ← Kembali
          </button>
        </div>

        {/* Ringkasan skor */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-md text-center">
            <p className="text-sm text-slate-500 mb-1">Skor Mentah</p>
            <p className="text-3xl font-bold text-blue-600">
              {result.raw_score}
            </p>
            <p className="text-xs text-slate-400">/ 550</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md text-center">
            <p className="text-sm text-slate-500 mb-1">Benar</p>
            <p className="text-3xl font-bold text-green-600">{correctCount}</p>
            <p className="text-xs text-slate-400">soal</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md text-center">
            <p className="text-sm text-slate-500 mb-1">Salah</p>
            <p className="text-3xl font-bold text-red-500">
              {wrongAnswers.length}
            </p>
            <p className="text-xs text-slate-400">soal</p>
          </div>
        </div>

        {/* Soal yang salah */}
        {wrongAnswers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-red-600 mb-4">
              ✗ Soal yang Salah ({wrongAnswers.length} soal)
            </h2>
            <div className="space-y-4">
              {wrongAnswers.map((w: any, i: number) => (
                <div
                  key={i}
                  className="bg-red-50 rounded-xl p-4 border border-red-100"
                >
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    {i + 1}. {w.question_text}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-red-500 font-medium">
                        Jawabanmu:{" "}
                      </span>
                      <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded">
                        {w.user_answer_text || "Tidak dijawab"}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-600 font-medium">
                        Jawaban benar:{" "}
                      </span>
                      <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        {w.correct_answer_text}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Pembahasan */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-violet-700 mb-6">
            ✦ Analisis & Pembahasan Detail dari AI
          </h2>

          {aiLoading ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-sm text-violet-600 font-medium animate-pulse">
                  Sedang menganalisis jawaban kamu, silahkan tunggu...
                </p>
              </div>
              <div className="space-y-3">
                {[100, 85, 92, 78, 95, 70, 88].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 bg-violet-100 rounded animate-pulse"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          ) : aiContent ? (
            <div className="prose prose-sm max-w-none">
              {formatAIContent(aiContent)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
