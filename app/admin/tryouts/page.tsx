"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function AdminTryouts() {
  const [tryouts, setTryouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTryouts = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("tryouts")
      .select(
        `
      *,
      questions ( id )
    `,
      )
      .order("created_at", { ascending: false });

    setTryouts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTryouts();
  }, []);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin/tryouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    await fetchTryouts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin mau delete tryout ini?")) return;

    await fetch(`/api/admin/tryouts/${id}`, {
      method: "DELETE",
    });

    fetchTryouts();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Daftar Tryout</h1>

      {tryouts.map((item) => (
        <div
          key={item.id}
          className="border p-4 rounded flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-lg">{item.title}</p>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                📅 Dibuat:{" "}
                {new Date(item.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <p>
                📊 Total Soal:{" "}
                <span className="font-semibold">
                  {item.questions?.length || 0}
                </span>
              </p>

              <p>
                Status:{" "}
                <span
                  className={
                    item.is_active ? "text-green-600" : "text-gray-500"
                  }
                >
                  {item.is_active ? "Published" : "Draft"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {item.is_active ? (
              <button
                onClick={() => handleAction(item.id, "unpublish")}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => handleAction(item.id, "publish")}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Publish
              </button>
            )}

            <button
              onClick={() => handleDelete(item.id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
