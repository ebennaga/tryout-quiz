"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useParams } from "next/navigation";

export default function TryoutPage() {
  const { id } = useParams();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(90);

  // ================= FETCH TRYOUT + QUESTIONS =================
  useEffect(() => {
    if (!id) return; // ⛔ jangan jalan kalau id belum ada

    const fetchData = async () => {
      const { data: tryoutData } = await supabase
        .from("tryouts")
        .select("duration_minutes")
        .eq("id", id)
        .single();

      const durasi = tryoutData?.duration_minutes || 90;
      setDuration(durasi);

      // 🔥 Ambil end time berdasarkan id yang VALID
      const storageKey = `tryout_end_${id}`;
      const savedEndTime = localStorage.getItem(storageKey);

      if (savedEndTime) {
        const remaining = Math.floor(
          (Number(savedEndTime) - Date.now()) / 1000,
        );

        if (remaining > 0) {
          setTimeLeft(remaining);
        } else {
          setTimeLeft(0);
          localStorage.removeItem(storageKey);
        }
      } else {
        // HANYA dibuat kalau memang belum ada
        const endTime = Date.now() + durasi * 60 * 1000;
        localStorage.setItem(storageKey, endTime.toString());
        setTimeLeft(durasi * 60);
      }

      // Fetch soal
      const { data } = await supabase
        .from("questions")
        .select(
          `
        id,
        question_text,
        options (
          id,
          option_text,
          label
        )
      `,
        )
        .eq("tryout_id", id)
        .order("created_at", { ascending: true });

      if (data) setQuestions(data);
    };

    fetchData();
  }, [id]);

  // ================= TIMER =================
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const unansweredCount = totalQuestions - answeredCount;

  if (questions.length === 0) {
    return <div className="p-10">Loading soal...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-gray-200">
      {/* HEADER */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Simulasi Ujian CPNS</h1>
          {/* <p className="text-sm text-gray-500">Badan Kepegawaian Negara</p> */}
        </div>

        <div className="flex gap-6 items-center">
          <div className="text-sm">
            <p>Batas Waktu</p>
            <p className="font-bold">{duration} menit</p>
          </div>

          <div className="text-sm">
            <p>Jumlah Soal</p>
            <p className="font-bold">{totalQuestions}</p>
          </div>

          <div className="text-sm text-green-600">
            <p>Soal Dijawab</p>
            <p className="font-bold">{answeredCount}</p>
          </div>

          <div className="text-sm text-red-600">
            <p>Belum Dijawab</p>
            <p className="font-bold">{unansweredCount}</p>
          </div>

          <button
            className="bg-black text-white px-4 py-2"
            onClick={() => {
              localStorage.removeItem(`tryout_end_${id}`);
              alert("Ujian selesai!");
            }}
          >
            Selesai Ujian
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto mt-8 bg-white p-6 shadow">
        <p className="font-bold mb-4">Soal No. {currentQuestion + 1}</p>

        <p className="mb-6">{questions[currentQuestion].question_text}</p>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((opt: any) => (
            <label key={opt.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={`question-${questions[currentQuestion].id}`}
                value={opt.id}
                checked={answers[questions[currentQuestion].id] === opt.id}
                onChange={() =>
                  setAnswers({
                    ...answers,
                    [questions[currentQuestion].id]: opt.id,
                  })
                }
              />
              {opt.label}. {opt.option_text}
            </label>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2"
            onClick={() =>
              setCurrentQuestion((prev) =>
                prev < totalQuestions - 1 ? prev + 1 : prev,
              )
            }
          >
            Simpan dan Lanjutkan
          </button>

          <button
            className="bg-gray-400 text-white px-4 py-2"
            onClick={() =>
              setCurrentQuestion((prev) =>
                prev < totalQuestions - 1 ? prev + 1 : prev,
              )
            }
          >
            Lewatkan soal ini
          </button>
        </div>
      </div>

      {/* NAVIGASI NOMOR */}
      <div className="mt-8 flex justify-center gap-2 flex-wrap">
        {questions.map((q, index) => {
          const isAnswered = answers[q.id];
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 text-sm text-white ${
                isAnswered ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* TIMER FIXED */}
      <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 text-2xl font-mono shadow-lg">
        {formatTime()}
      </div>
    </div>
  );
}
