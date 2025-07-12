import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "https://phoenix-rewear.onrender.com/api";

export default function AdminPanel() {
  const { token } = useAuth();
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/items/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.message || "Failed to load pending items");
        }
        return res.json();
      })
      .then((data) => {
        setPendingItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const approveItem = async (itemId) => {
    setActionStatus(null);
    const res = await fetch(`${API_URL}/admin/items/${itemId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setActionStatus("✅ Item approved.");
      fetchPendingItems();
    } else {
      setActionStatus(data.message || "❌ Error approving item.");
    }
  };

  const rejectItem = async (itemId) => {
    if (
      !window.confirm("Are you sure you want to reject and delete this item?")
    )
      return;
    setActionStatus(null);
    const res = await fetch(`${API_URL}/admin/items/${itemId}/reject`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setActionStatus("🗑️ Item rejected and deleted.");
      fetchPendingItems();
    } else {
      setActionStatus(data.message || "❌ Error rejecting item.");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-slate-500 mt-12 text-lg">
        Loading admin panel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-rose-600 text-center font-medium mt-10">{error}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">
        Admin Panel – Moderate Listings
      </h2>

      {actionStatus && (
        <div className="mb-6 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-center text-sm font-medium">
          {actionStatus}
        </div>
      )}

      {pendingItems.length === 0 ? (
        <p className="text-center text-slate-500">
          No pending items for approval.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingItems.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-slate-200 rounded-xl shadow-md p-4 flex flex-col"
            >
              {item.imagePaths.length > 0 && (
                <img
                  src={`http://localhost:4000${item.imagePaths[0]}`}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}

              <h4 className="text-lg font-semibold text-slate-800">
                {item.title}
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                <span className="font-medium">Uploader:</span>{" "}
                {item.uploader.profileDetails?.fullName || item.uploader.email}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Category:</span> {item.category}
              </p>
              <p className="text-sm text-slate-600 line-clamp-3">
                <span className="font-medium">Description:</span>{" "}
                {item.description}
              </p>

              <div className="mt-4 flex justify-between gap-3">
                <button
                  onClick={() => approveItem(item._id)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-md text-sm font-semibold transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectItem(item._id)}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-md text-sm font-semibold transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
