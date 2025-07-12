import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch("https://phoenix-rewear.onrender.com/api/items/featured")
      .then((res) => res.json())
      .then(setFeatured)
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero / Intro */}
      <section className="relative w-full overflow-hidden">
        {/* Decorative blob shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-rose-200 opacity-30 rounded-full mix-blend-multiply blur-3xl animate-blob" />
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-sky-200 opacity-30 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-violet-200 opacity-30 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center py-20 px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
            Welcome to <span className="text-indigo-600">ItemSwap</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8">
            Swap your pre‑loved items or redeem with points — join a community
            that keeps clothes in circulation and out of landfills.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/browse"
              className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Browse Items
            </Link>
            <Link
              to="/add-item"
              className="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              List an Item
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 rounded-full bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition"
            >
              Start Swapping
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
          Featured Items
        </h2>

        {featured.length === 0 ? (
          <p className="text-center text-slate-500">
            Loading featured items...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col"
              >
                {item.imagePaths.length > 0 && (
                  <img
                    src={`http://localhost:4000${item.imagePaths[0]}`}
                    alt={item.title}
                    className="w-full h-56 object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold text-slate-800 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 mb-3">{item.category}</p>
                <Link
                  to={`/items/${item._id}`}
                  className="mt-auto inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
