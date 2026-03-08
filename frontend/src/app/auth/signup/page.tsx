"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Signup failed");
      }

      router.push("/auth/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Start creating amazing presentations</p>
        </div>

        <form onSubmit={handleSignup} className="bg-[#11111a] border border-gray-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0c0c13] border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/30 outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0c0c13] border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/30 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0c0c13] border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/30 outline-none"
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
