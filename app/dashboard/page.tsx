"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [simulasiList, setSimulasiList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // Ambil user
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      // Ambil tryout yang aktif + punya soal
      const { data, error } = await supabase
        .from("tryouts")
        .select(
          `
          id,
          title,
          description,
          duration_minutes,
          questions ( id )
        `,
        )
        .eq("is_active", true);

      if (error) {
        console.error(error);
        return;
      }

      // Filter hanya tryout yang punya minimal 1 soal
      const filtered = data.filter((tryout) => tryout.questions.length > 0);

      setSimulasiList(filtered);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Selamat datang kembali
              {user ? `, ${user.user_metadata.full_name}` : ""}.
            </p>
          </div>

          {/* 👇 Bungkus kedua button dalam satu div */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/results")}
              className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition"
            >
              Lihat Hasil Ujian
            </button>

            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Ringkasan Aktivitas */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-sm text-slate-500 mb-2">
              Total Tryout Tersedia
            </h3>
            <p className="text-3xl font-bold">{simulasiList.length}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-sm text-slate-500 mb-2">Skor Tertinggi</h3>
            <p className="text-3xl font-bold text-blue-600">410</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-sm text-slate-500 mb-2">Peringkat Nasional</h3>
            <p className="text-3xl font-bold text-green-600">#245</p>
          </div>
        </div>

        {/* Pilihan Simulasi */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Pilih Simulasi Tryout</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {simulasiList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>

                <p className="text-slate-600 mb-4">{item.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                    {item.duration_minutes} menit • {item.questions.length} soal
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

          {simulasiList.length === 0 && (
            <div className="mt-10 text-center text-slate-500">
              Belum ada tryout tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
