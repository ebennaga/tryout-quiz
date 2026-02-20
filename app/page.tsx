import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-slate-800">
      <Navbar />
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Simulasi Ujian CPNS Berbasis CAT
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
          Latihan soal CPNS dengan sistem Computer Assisted Test (CAT) yang
          menyerupai ujian resmi. Dapatkan skor, peringkat nasional, dan
          analisis performa berbasis AI untuk meningkatkan peluang lolos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition">
            Mulai Simulasi Gratis
          </button>
          <button className="px-8 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-2xl shadow-sm transition">
            Lihat Paket Premium
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-50 p-8 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Simulasi Real CAT</h3>
            <p className="text-slate-600">
              Sistem ujian dengan timer, navigasi soal, dan tampilan yang
              menyerupai ujian resmi CPNS.
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Ranking Nasional</h3>
            <p className="text-slate-600">
              Bandingkan skor kamu dengan peserta lain dan lihat posisi kamu
              secara real-time di leaderboard.
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Analisis AI</h3>
            <p className="text-slate-600">
              Dapatkan evaluasi detail kekuatan dan kelemahan pada TWK, TIU, dan
              TKP beserta rekomendasi belajar.
            </p>
          </div>
        </div>
      </section>

      {/* Section Materi */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Materi yang Diujikan
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-2xl">
              <h4 className="font-semibold text-lg mb-2">TWK</h4>
              <p className="text-slate-600 text-sm">
                Tes Wawasan Kebangsaan meliputi Pancasila, UUD 1945, NKRI, dan
                Bhinneka Tunggal Ika.
              </p>
            </div>
            <div className="p-6 border rounded-2xl">
              <h4 className="font-semibold text-lg mb-2">TIU</h4>
              <p className="text-slate-600 text-sm">
                Tes Intelegensi Umum mencakup logika, numerik, dan verbal
                reasoning.
              </p>
            </div>
            <div className="p-6 border rounded-2xl">
              <h4 className="font-semibold text-lg mb-2">TKP</h4>
              <p className="text-slate-600 text-sm">
                Tes Karakteristik Pribadi untuk mengukur integritas, pelayanan
                publik, dan profesionalisme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Siap Lolos CPNS Tahun Ini?</h2>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          Tingkatkan peluangmu dengan latihan rutin, analisis performa, dan
          strategi belajar yang tepat.
        </p>
        <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-2xl shadow-lg transition">
          Mulai Sekarang
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 text-center text-sm">
        © {new Date().getFullYear()} Simulasi CPNS Platform. All rights
        reserved.
      </footer>
    </div>
  );
}
