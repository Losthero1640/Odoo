import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await signup(email, password, fullName);
    if (res.success) {
      navigate("/browse");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8"
        style={{
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)", // greyish shadow
        }}
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Create Your ReWear Account
        </h2>

        {error && (
          <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded mb-4 border border-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name{" "}
              <span className="text-slate-400 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
