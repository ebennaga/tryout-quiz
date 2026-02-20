"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/parse-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!result) return;

    await fetch("/api/admin/save-tryout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });

    alert("Berhasil disimpan!");
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
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Parsing..." : "Upload & Parse"}
      </button>

      {result && (
        <div className="mt-6">
          <p className="font-semibold">Preview: {result.title}</p>
          <p>Total Soal: {result.questions?.length}</p>

          <button
            onClick={handleSave}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
          >
            Simpan ke Database
          </button>
        </div>
      )}
    </div>
  );
}
