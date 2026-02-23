"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // 🔥 state baru
  const [result, setResult] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error.message);
        return;
      }
      setSession(data.session);
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/pdf-parse", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: formData,
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      setResult(data);
    } catch (err) {
      console.error("Bukan JSON:", text);
      alert("Server mengembalikan HTML error. Cek terminal.");
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true); // 🔥 mulai loading save

    try {
      const res = await fetch("/api/admin/save-tryout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(result),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan data");
      }

      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan");
      console.error(err);
    }

    setSaving(false); // 🔥 selesai loading save
  };

  return (
    <div className="space-y-4">
      {/* 🔴 Logout Button */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Parsing..." : "Upload & Parse"}
      </button>

      {result && (
        <div className="mt-6">
          <p className="font-semibold">Preview: {result.title}</p>
          <p>Total Soal: {result.questions?.length}</p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {saving ? "Menyimpan ke Database..." : "Simpan ke Database"}
          </button>
        </div>
      )}
    </div>
  );
}
