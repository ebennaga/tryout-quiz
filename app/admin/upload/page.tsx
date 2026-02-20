import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import UploadForm from "./UploadForm";

export default async function AdminUploadPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  // 🔐 1️⃣ Cek login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/"); // belum login → ke home
  }

  console.log("USER:", user);
  console.log("USER ID:", user?.id);
  // 🔐 2️⃣ Cek role admin
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  console.log("profile", profile);
  console.log("error", error);

  if (profile?.role !== "admin") {
    redirect("/"); // bukan admin → ke home
  }

  // ✅ Kalau lolos semua
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Upload Soal PDF (Admin Only)</h1>

      <UploadForm />
    </div>
  );
}
