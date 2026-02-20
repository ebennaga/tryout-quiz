"use client";

import { supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState<any>(null);

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
    }
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
              <span className="text-sm font-medium">
                Halo, {user.user_metadata.full_name}
              </span>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl bg-red-500 text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="px-5 py-2 rounded-xl bg-white border"
            >
              Masuk dengan Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
