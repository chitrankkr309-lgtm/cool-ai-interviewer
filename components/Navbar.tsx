"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email);
      }
    }
    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setEmail(null);
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800 bg-black">
      <Link href="/">
        <h1 className="text-2xl font-bold text-cyan-400">COOL AI QUIZZ</h1>
      </Link>

      <div className="flex items-center gap-4">
        {email ? (
          <>
            <Link href="/dashboard">
              <span className="text-zinc-400 hover:text-cyan-400 transition font-medium cursor-pointer">Dashboard</span>
            </Link>
            <Link href="/history">
              <span className="text-zinc-400 hover:text-cyan-400 transition font-medium cursor-pointer">History</span>
            </Link>
            
            {/* User Profile Logo */}
            <div className="group relative flex items-center gap-3 ml-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold text-lg border-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)] cursor-pointer">
                {email.charAt(0).toUpperCase()}
              </div>
              
              {/* Dropdown for Logout */}
              <div className="absolute right-0 top-12 hidden group-hover:block bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-xl z-50 w-48">
                <p className="text-xs text-zinc-400 px-3 py-2 truncate border-b border-zinc-800">{email}</p>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 mt-1 text-red-400 hover:bg-zinc-800 rounded">
                  Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="px-5 py-2 rounded-lg border border-cyan-500 text-white hover:bg-cyan-500 hover:text-black transition">Login</button>
            </Link>
            <Link href="/signup">
              <button className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition">Signup</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}