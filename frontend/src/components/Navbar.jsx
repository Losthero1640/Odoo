import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="relative bg-white shadow-md px-6 md:px-12 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between z-10 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-10 w-60 h-60 bg-rose-200 opacity-30 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
        <div className="absolute top-0 -right-10 w-60 h-60 bg-sky-200 opacity-30 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-violet-200 opacity-30 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>
      </div>

      <Link
        to="/"
        className="relative z-20 text-indigo-600 text-3xl font-bold tracking-tight hover:scale-105 transition-transform duration-300"
      >
        ItemSwap
      </Link>

      <div className="relative z-20 mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-base font-medium text-slate-700">
        <Link
          to="/browse"
          className="hover:text-rose-500 transition-colors duration-200 py-1 px-2 rounded hover:bg-slate-100"
        >
          Browse Items
        </Link>

        {user && (
          <>
            <Link
              to="/add-item"
              className="hover:text-rose-500 transition-colors duration-200 py-1 px-2 rounded hover:bg-slate-100"
            >
              List an Item
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-rose-500 transition-colors duration-200 py-1 px-2 rounded hover:bg-slate-100"
            >
              Dashboard
            </Link>
          </>
        )}

        {user?.isAdmin && (
          <Link
            to="/admin"
            className="hover:text-rose-500 transition-colors duration-200 py-1 px-2 rounded hover:bg-slate-100"
          >
            Admin
          </Link>
        )}

        {!user && (
          <>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-all duration-300 shadow hover:shadow-lg hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-full bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-all duration-300 shadow hover:shadow-lg hover:-translate-y-0.5"
            >
              Login
            </Link>
          </>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-slate-600 text-white font-semibold hover:bg-slate-700 transition-all duration-300 shadow hover:shadow-lg hover:-translate-y-0.5"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
