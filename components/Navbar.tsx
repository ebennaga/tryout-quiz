"use client";

import { supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-200/70 border-b border-slate-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-slate-800">
          CPNS<span className="text-blue-600">Sim</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-600 font-medium">
                Halo, {user.user_metadata.full_name}
              </span>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login — text only style */}
              <button
                onClick={() => router.push("/auth/login")}
                className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Login
              </button>

              {/* Start for free — orange CTA */}
              <button
                onClick={handleLogin}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition"
                style={{ background: "#f97316" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#ea6c0a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f97316")
                }
              >
                Start for free
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
