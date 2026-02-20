"use client";

import { useRouter } from "next/navigation";

export default function TryoutPage() {
  const router = useRouter();

  const simulasiList = [
    {
      id: 1,
      title: "Simulasi SKD Lengkap #1",
      description: "110 soal (TWK, TIU, TKP) dengan waktu 110 menit.",
      difficulty: "Standar Nasional",
    },
    {
      id: 2,
      title: "Simulasi SKD Lengkap #2",
      description: "110 soal set terbaru dengan tingkat kesulitan tinggi.",
      difficulty: "Sulit",
    },
    {
      id: 3,
      title: "Latihan TWK",
      description: "30 soal khusus Tes Wawasan Kebangsaan.",
      difficulty: "Menengah",
    },
    {
      id: 4,
      title: "Latihan TIU",
      description: "35 soal logika, numerik, dan verbal reasoning.",
      difficulty: "Menengah",
    },
    {
      id: 5,
      title: "Latihan TKP",
      description: "45 soal karakteristik pribadi dan studi kasus.",
      difficulty: "Standar",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Pilih Simulasi Tryout</h1>
          <p className="text-slate-600 mt-2">
            Pilih jenis latihan yang ingin kamu kerjakan hari ini.
          </p>
        </div>

        {/* List Simulasi */}
        <div className="grid md:grid-cols-2 gap-6">
          {simulasiList.map((item) => (
            <div
              key={item.id}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>

              <p className="text-slate-600 mb-4">{item.description}</p>

              <div className="flex justify-between items-center">
                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                  {item.difficulty}
                </span>

                <button
                  onClick={() => router.push(`/tryout/${item.id}`)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                >
                  Mulai
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
