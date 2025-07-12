import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

export default function Browse() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const tags = searchParams.get("tags") || "";

  useEffect(() => {
    setLoading(true);

    let url = `${API_URL}/items?page=${page}&limit=12`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (tags) url += `&tags=${encodeURIComponent(tags)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setPages(data.pages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, category, tags]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Browse Items</h2>

      {loading && (
        <div className="text-center text-slate-500 text-sm">
          Loading items...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center text-slate-500 text-base mt-10 bg-slate-100 p-6 rounded-md border border-slate-200">
          No items found.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md p-4 transition"
          >
            {item.imagePaths.length > 0 && (
              <img
                src={`http://localhost:4000${item.imagePaths[0]}`}
                alt={item.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="text-lg font-semibold text-slate-800">
              {item.title}
            </h3>
            <p className="text-sm text-slate-500 mb-3">{item.category}</p>
            <Link
              to={`/items/${item._id}`}
              className="inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-slate-600 text-sm">
            Page <strong>{page}</strong> of <strong>{pages}</strong>
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pages}
            className="px-4 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
