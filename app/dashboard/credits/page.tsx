"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    emoji: "⚡",
    credits: 10,
    bonus: 2,
    price: 15000,
    desc: "Coba pembahasan AI untuk pertama kali",
  },
  {
    id: "basic",
    name: "Basic",
    emoji: "⭐",
    credits: 30,
    bonus: 5,
    price: 35000,
    best: true,
    desc: "Paling populer untuk persiapan intensif",
  },
  {
    id: "pro",
    name: "Pro",
    emoji: "💎",
    credits: 75,
    bonus: 15,
    price: 75000,
    desc: "Untuk kamu yang serius lulus CPNS",
  },
  {
    id: "ultimate",
    name: "Ultimate",
    emoji: "🚀",
    credits: 150,
    bonus: 35,
    price: 130000,
    desc: "Latihan tak terbatas, skor tertinggi",
  },
];

export default function CreditsPage() {
  const [balance, setBalance] = useState<number>(0);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data } = await supabase
          .from("user_credits")
          .select("balance")
          .eq("user_id", userData.user.id)
          .single();
        setBalance(data?.balance || 0);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const handleSelect = (pkg: any) => {
    setSelectedPkg(pkg);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Beli Kredit</h1>
            <p className="text-slate-600 mt-2">
              1 kredit = 1 pembahasan soal lengkap oleh AI
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Saldo */}
            <div className="bg-white px-5 py-3 rounded-2xl shadow-md text-center">
              <p className="text-sm text-slate-500">Saldo Kredit</p>
              <p className="text-2xl font-bold text-violet-600">
                {balance}{" "}
                <span className="text-sm font-normal text-slate-400">
                  kredit
                </span>
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/results")}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              ← Kembali
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-10 flex items-center gap-4">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-slate-700">
              Preview Gratis Tersedia
            </p>
            <p className="text-sm text-slate-500">
              Kamu bisa melihat 2-3 kalimat pertama pembahasan AI secara gratis.
              Beli kredit untuk membaca analisis lengkap.
            </p>
          </div>
        </div>

        {/* Paket */}
        <h2 className="text-2xl font-semibold mb-6">Pilih Paket Kredit</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => {
            const total = pkg.credits + pkg.bonus;
            const perCredit = Math.round(pkg.price / total);

            return (
              <div
                key={pkg.id}
                className={`bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition relative ${pkg.best ? "ring-2 ring-violet-500" : ""}`}
              >
                {pkg.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    ★ Terlaris
                  </div>
                )}

                {/* Icon + name */}
                <div className="text-3xl mb-3">{pkg.emoji}</div>
                <h3 className="text-xl font-semibold mb-1">{pkg.name}</h3>
                <p className="text-sm text-slate-500 mb-5">{pkg.desc}</p>

                {/* Kredit */}
                <p className="text-4xl font-bold text-violet-600 mb-1">
                  {pkg.credits}
                </p>
                <p className="text-sm text-slate-500 mb-4">kredit utama</p>

                {/* Bonus */}
                <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 mb-5 flex justify-between items-center">
                  <span className="text-sm text-violet-600 font-medium">
                    + {pkg.bonus} Bonus
                  </span>
                  <span className="text-xs text-slate-400">Total {total}</span>
                </div>

                {/* Harga */}
                <p className="text-2xl font-bold text-slate-800 mb-1">
                  {formatPrice(pkg.price)}
                </p>
                <p className="text-xs text-slate-400 mb-5">
                  ~{formatPrice(perCredit)}/kredit
                </p>

                <button
                  onClick={() => handleSelect(pkg)}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition ${
                    pkg.best
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  💳 Pilih Paket
                </button>

                <p className="text-center text-xs text-slate-400 mt-3">
                  🔒 Pembayaran Aman
                </p>
              </div>
            );
          })}
        </div>

        {/* Riwayat transaksi hint */}
        <div className="mt-10 bg-white p-6 rounded-2xl shadow-md">
          <p className="font-semibold text-slate-700 mb-2">
            📋 Cara Pembayaran
          </p>
          <ol className="text-sm text-slate-500 space-y-1 list-decimal list-inside">
            <li>Pilih paket kredit yang kamu inginkan</li>
            <li>Transfer sesuai nominal ke rekening admin</li>
            <li>Kirim bukti transfer ke admin via WhatsApp/Email</li>
            <li>Kredit akan ditambahkan dalam 1x24 jam</li>
          </ol>
        </div>
      </div>

      {/* Modal konfirmasi */}
      {showModal && selectedPkg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-1">
              Paket {selectedPkg.name}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Total {selectedPkg.credits + selectedPkg.bonus} kredit (
              {selectedPkg.credits} + {selectedPkg.bonus} bonus)
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-500 mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold text-violet-600">
                {formatPrice(selectedPkg.price)}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700">
                📋 Setelah melakukan pembayaran, kirim bukti transfer ke admin.
                Kredit akan ditambahkan dalam 1x24 jam.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-sm transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  alert(
                    "Silakan transfer ke rekening admin dan kirim bukti pembayaran.",
                  );
                }}
                className="flex-2 flex-grow-[2] py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition"
              >
                💳 Lanjutkan Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
