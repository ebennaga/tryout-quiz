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

const BANK_INFO = {
  bank: "BCA",
  norek: "73902214",
  nama: "Benski",
  whatsapp: "+6281314180047",
};

type Step = "list" | "detail" | "confirm";

export default function CreditsPage() {
  const [balance, setBalance] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [step, setStep] = useState<Step>("list");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
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
    setStep("detail");
  };

  const handleSendWA = () => {
    if (!selectedPkg || !user) return;
    const total = selectedPkg.credits + selectedPkg.bonus;
    const message = encodeURIComponent(
      `Halo Admin, saya ingin membeli kredit CPNS Tryout.\n\n` +
        `📦 Paket: ${selectedPkg.name}\n` +
        `💎 Kredit: ${selectedPkg.credits} + ${selectedPkg.bonus} bonus = ${total} kredit\n` +
        `💰 Nominal: ${formatPrice(selectedPkg.price)}\n` +
        `📧 Email: ${user?.email}\n\n` +
        `Terlampir bukti transfer saya.`,
    );
    window.open(
      `https://wa.me/${BANK_INFO.whatsapp}?text=${message}`,
      "_blank",
    );
    setStep("confirm");
  };

  const handleCopyRek = () => {
    navigator.clipboard.writeText(BANK_INFO.norek);
    alert("Nomor rekening disalin!");
  };

  if (step === "detail" && selectedPkg) {
    const total = selectedPkg.credits + selectedPkg.bonus;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setStep("list")}
            className="text-slate-500 hover:text-slate-700 text-sm mb-6 flex items-center gap-1 transition"
          >
            ← Kembali pilih paket
          </button>

          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-1">Detail Pembayaran</h2>
            <p className="text-slate-500 text-sm mb-8">
              Paket {selectedPkg.name} — {total} kredit
            </p>

            {/* Ringkasan paket */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Paket</span>
                <span className="font-semibold">
                  {selectedPkg.emoji} {selectedPkg.name}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Kredit</span>
                <span className="font-semibold text-violet-600">
                  {selectedPkg.credits} + {selectedPkg.bonus} bonus
                </span>
              </div>
              <div className="border-t border-violet-100 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">
                  Total Transfer
                </span>
                <span className="text-xl font-bold text-violet-600">
                  {formatPrice(selectedPkg.price)}
                </span>
              </div>
            </div>

            {/* Info rekening */}
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Transfer ke Rekening:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 text-white font-bold text-sm px-3 py-1 rounded-lg">
                  BCA
                </div>
                <span className="text-slate-500 text-sm">
                  Bank Central Asia
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">No. Rekening</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-wider">
                    {BANK_INFO.norek}
                  </span>
                  <button
                    onClick={handleCopyRek}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded-lg transition"
                  >
                    Salin
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Atas Nama</span>
                <span className="font-semibold">{BANK_INFO.nama}</span>
              </div>
            </div>

            {/* Langkah */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-700 mb-3">
                📋 Langkah Pembayaran:
              </p>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li>
                  Transfer tepat{" "}
                  <span className="font-bold">
                    {formatPrice(selectedPkg.price)}
                  </span>{" "}
                  ke rekening BCA di atas
                </li>
                <li>Simpan bukti transfer (screenshot/foto)</li>
                <li>Klik tombol di bawah untuk kirim bukti via WhatsApp</li>
                <li>
                  Kredit akan ditambahkan dalam{" "}
                  <span className="font-bold">1x24 jam</span>
                </li>
              </ol>
            </div>

            {/* Tombol WA */}
            <button
              onClick={handleSendWA}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Kirim Bukti Transfer via WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Bukti Terkirim!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Terima kasih! Kredit kamu akan ditambahkan dalam{" "}
            <span className="font-semibold text-violet-600">1x24 jam</span>{" "}
            setelah admin mengkonfirmasi pembayaran.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Paket</span>
              <span className="font-medium">{selectedPkg?.name}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Total Kredit</span>
              <span className="font-medium text-violet-600">
                {selectedPkg ? selectedPkg.credits + selectedPkg.bonus : 0}{" "}
                kredit
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Nominal Transfer</span>
              <span className="font-medium">
                {selectedPkg ? formatPrice(selectedPkg.price) : ""}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Beli Kredit</h1>
            <p className="text-slate-600 mt-2">
              1 kredit = 1 akses tryout atau 1 pembahasan AI
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              onClick={() => router.push("/dashboard")}
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
            <p className="font-semibold text-slate-700">Cara Pembayaran</p>
            <p className="text-sm text-slate-500">
              Pilih paket → Transfer ke BCA {BANK_INFO.norek} a.n{" "}
              {BANK_INFO.nama} → Kirim bukti via WhatsApp → Kredit aktif dalam
              1x24 jam
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
                className={`bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition relative cursor-pointer ${pkg.best ? "ring-2 ring-violet-500" : ""}`}
                onClick={() => handleSelect(pkg)}
              >
                {pkg.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    ★ Terlaris
                  </div>
                )}

                <div className="text-3xl mb-3">{pkg.emoji}</div>
                <h3 className="text-xl font-semibold mb-1">{pkg.name}</h3>
                <p className="text-sm text-slate-500 mb-5">{pkg.desc}</p>

                <p className="text-4xl font-bold text-violet-600 mb-1">
                  {pkg.credits}
                </p>
                <p className="text-sm text-slate-500 mb-4">kredit utama</p>

                <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 mb-5 flex justify-between items-center">
                  <span className="text-sm text-violet-600 font-medium">
                    + {pkg.bonus} Bonus
                  </span>
                  <span className="text-xs text-slate-400">Total {total}</span>
                </div>

                <p className="text-2xl font-bold text-slate-800 mb-1">
                  {formatPrice(pkg.price)}
                </p>
                <p className="text-xs text-slate-400 mb-5">
                  ~{formatPrice(perCredit)}/kredit
                </p>

                <button
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition ${
                    pkg.best
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Pilih Paket →
                </button>

                <p className="text-center text-xs text-slate-400 mt-3">
                  🔒 Pembayaran Aman
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
