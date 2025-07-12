import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const API_URL = "https://phoenix-rewear.onrender.com/api/users/dashboard";

export default function Dashboard() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.message || "Failed to load dashboard");
        }
        return res.json();
      })
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading)
    return <p className="text-center text-slate-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!dashboardData) return null;

  const { user, uploadedItems, swapsRequested } = dashboardData;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-8 text-slate-800">Your Dashboard</h2>

      {/* Profile Info */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-10">
        <h3 className="text-xl font-semibold mb-4 text-slate-700">
          Profile Information
        </h3>
        <p className="text-slate-600">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-slate-600">
          <strong>Full Name:</strong>{" "}
          {user.profileDetails?.fullName || "Not set"}
        </p>
        <p className="text-slate-600">
          <strong>Points Balance:</strong>{" "}
          <span className="font-bold text-green-600">{user.points}</span>
        </p>
      </section>

      {/* Uploaded Items */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">
          Your Uploaded Items
        </h3>
        {uploadedItems.length === 0 ? (
          <p className="text-slate-500">You haven't uploaded any items yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {uploadedItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-slate-200 rounded-lg shadow p-4 hover:shadow-md transition"
              >
                {item.imagePaths.length > 0 && (
                  <img
                    src={`http://localhost:4000${item.imagePaths[0]}`}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                )}
                <h4 className="text-lg font-semibold text-slate-800 mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-600 mb-1">
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      item.approved ? "text-green-600" : "text-yellow-600"
                    }
                  >
                    {item.approved ? "Approved" : "Pending Approval"}
                  </span>
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  <strong>Availability:</strong>{" "}
                  <span
                    className={
                      item.availability === "Available"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {item.availability}
                  </span>
                </p>
                <Link
                  to={`/items/${item._id}`}
                  className="inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                  View Item
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Swap Requests */}
      <section>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">
          Your Swap Requests
        </h3>
        {swapsRequested.length === 0 ? (
          <p className="text-slate-500">You haven't requested any swaps yet.</p>
        ) : (
          <ul className="space-y-4">
            {swapsRequested.map((swap) => (
              <li
                key={swap._id}
                className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div>
                  <Link
                    to={`/items/${swap.item._id}`}
                    className="text-indigo-600 hover:underline font-medium text-base"
                  >
                    {swap.item.title}
                  </Link>
                  <p className="text-sm text-slate-600 mt-1">
                    Status:{" "}
                    <span className="font-medium text-indigo-700">
                      {swap.status}
                    </span>{" "}
                    | Availability:{" "}
                    <span
                      className={
                        swap.item.availability === "Available"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {swap.item.availability}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
