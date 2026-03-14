"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [simulasiList, setSimulasiList] = useState<any[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTryout, setSelectedTryout] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [deducting, setDeducting] = useState(false);
  const router = useRouter();

  const TRYOUT_COST = 2;

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      setUserId(userData.user?.id || null);

      if (userData.user) {
        const { data: creditData } = await supabase
          .from("user_credits")
          .select("balance")
          .eq("user_id", userData.user.id)
          .single();
        setCredits(creditData?.balance || 0);
      }

      const { data, error } = await supabase
        .from("tryouts")
        .select(`id, title, description, duration_minutes, questions ( id )`)
        .eq("is_active", true);

      if (error) {
        console.error(error);
        return;
      }

      const filtered = data.filter((tryout) => tryout.questions.length > 0);
      setSimulasiList(filtered);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleMulaiClick = (item: any) => {
    setSelectedTryout(item);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!userId || !selectedTryout) return;

    if (credits < TRYOUT_COST) {
      setShowModal(false);
      router.push("/dashboard/credits");
      return;
    }

    setDeducting(true);

    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        balance: credits - TRYOUT_COST,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      alert("Gagal memotong kredit. Coba lagi.");
      setDeducting(false);
      return;
    }

    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -TRYOUT_COST,
      type: "debit",
      description: `Akses Tryout: ${selectedTryout.title}`,
    });

    setCredits((prev) => prev - TRYOUT_COST);
    setDeducting(false);
    setShowModal(false);
    router.push(`/tryout/${selectedTryout.id}`);
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

          <div className="flex items-center gap-3">
            <div
              className="bg-white px-4 py-2 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition text-center"
              onClick={() => router.push("/dashboard/credits")}
            >
              <p className="text-xs text-slate-500">Kredit</p>
              <p className="font-bold text-violet-600">{credits} kredit</p>
            </div>

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

        {/* Ringkasan */}
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                      {item.duration_minutes} menit • {item.questions.length}{" "}
                      soal
                    </span>
                    <span className="text-sm px-3 py-1 bg-violet-100 text-violet-600 rounded-full">
                      {TRYOUT_COST} kredit
                    </span>
                  </div>
                  <button
                    onClick={() => handleMulaiClick(item)}
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

      {/* Modal Konfirmasi */}
      {showModal && selectedTryout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-1">Mulai Tryout</h2>
            <p className="text-slate-500 text-sm mb-6">
              {selectedTryout.title}
            </p>

            {/* Info tryout */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Durasi</span>
                <span className="font-medium">
                  {selectedTryout.duration_minutes} menit
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jumlah Soal</span>
                <span className="font-medium">
                  {selectedTryout.questions.length} soal
                </span>
              </div>
            </div>

            {/* Info kredit */}
            <div
              className={`rounded-xl p-4 mb-6 border ${credits >= TRYOUT_COST ? "bg-violet-50 border-violet-100" : "bg-red-50 border-red-100"}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Biaya Kredit
                </span>
                <span className="font-bold text-violet-600">
                  {TRYOUT_COST} kredit
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Saldo kamu</span>
                <span
                  className={`font-bold ${credits >= TRYOUT_COST ? "text-green-600" : "text-red-500"}`}
                >
                  {credits} kredit
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Sisa setelah</span>
                <span className="text-sm font-medium text-slate-600">
                  {Math.max(credits - TRYOUT_COST, 0)} kredit
                </span>
              </div>
              {credits < TRYOUT_COST && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ Kredit tidak cukup. Minimal {TRYOUT_COST} kredit untuk
                  mulai tryout.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-sm transition"
              >
                Batal
              </button>

              {credits >= TRYOUT_COST ? (
                <button
                  onClick={handleConfirm}
                  disabled={deducting}
                  className="flex-[2] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition disabled:opacity-50"
                >
                  {deducting
                    ? "Memproses..."
                    : `✓ Mulai — ${TRYOUT_COST} Kredit`}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowModal(false);
                    router.push("/dashboard/credits");
                  }}
                  className="flex-[2] py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition"
                >
                  💳 Beli Kredit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
