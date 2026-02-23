"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/");
        return;
      }

      const userId = sessionData.session.user.id;

      // Ambil role dari profiles
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || profile?.role !== "admin") {
        router.push("/");
        return;
      }

      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-end p-4 border-b bg-white shadow-sm">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}
