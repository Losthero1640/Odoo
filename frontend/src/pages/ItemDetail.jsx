import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:4000/api/items";

export default function ItemDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [swapStatus, setSwapStatus] = useState(null);
  const [redeemStatus, setRedeemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to load item");
        }
        return res.json();
      })
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const requestSwap = async () => {
    setSwapStatus(null);
    setRedeemStatus(null);
    if (!user) {
      setSwapStatus("Please login to request a swap.");
      return;
    }
    const res = await fetch(`${API_URL}/${id}/swap-request`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setSwapStatus("Swap request submitted.");
    else setSwapStatus(data.message || "Error requesting swap.");
  };

  const redeemItem = async () => {
    setSwapStatus(null);
    setRedeemStatus(null);
    if (!user) {
      setRedeemStatus("Please login to redeem items.");
      return;
    }
    const res = await fetch(`${API_URL}/${id}/redeem`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setRedeemStatus("Item redeemed successfully!");
    else setRedeemStatus(data.message || "Error redeeming item.");
  };

  if (loading)
    return <p className="text-center mt-8 text-slate-500">Loading item...</p>;
  if (error) return <p className="alert text-red-600">{error}</p>;
  if (!item) return null;

  const uploaderName =
    item.uploader &&
    (item.uploader.profileDetails?.fullName || item.uploader.email);

  return (
    <div className="flex justify-center px-4 py-8 bg-slate-50">
      <div
        className="w-full max-w-3xl bg-white p-6 rounded-xl border border-slate-200"
        style={{
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        }}
      >
        <h2 className="text-3xl font-bold mb-4 text-slate-800">
          {item.title}{" "}
          <span className="text-base text-slate-500">({item.category})</span>
        </h2>

        {/* Image Gallery */}
        {item.imagePaths.length > 0 && (
          <div className="image-gallery mb-6">
            <img
              src={`http://localhost:4000${item.imagePaths[activeImageIndex]}`}
              alt={`Image ${activeImageIndex + 1}`}
              className="w-full h-72 object-cover rounded"
            />
            <div className="flex gap-2 mt-3">
              {item.imagePaths.map((p, idx) => (
                <img
                  key={p}
                  src={`http://localhost:4000${p}`}
                  alt={`Thumb ${idx + 1}`}
                  className={`w-16 h-16 object-cover rounded cursor-pointer ${
                    activeImageIndex === idx ? "ring-2 ring-indigo-500" : ""
                  }`}
                  onClick={() => setActiveImageIndex(idx)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Item Details */}
        <div className="space-y-2 text-slate-700 text-sm mb-6">
          <p>
            <strong>Description:</strong>{" "}
            {item.description || "No description provided."}
          </p>
          <p>
            <strong>Type:</strong> {item.type || "-"}
          </p>
          <p>
            <strong>Size:</strong> {item.size || "-"}
          </p>
          <p>
            <strong>Condition:</strong> {item.condition || "-"}
          </p>
          <p>
            <strong>Tags:</strong>{" "}
            {item.tags.length > 0 ? item.tags.join(", ") : "-"}
          </p>
          <p>
            <strong>Availability:</strong> {item.availability}
          </p>
          <p>
            <strong>Uploaded by:</strong> {uploaderName || "Unknown"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          {item.availability === "available" &&
            user &&
            user.id !== item.uploader._id && (
              <>
                <button
                  onClick={requestSwap}
                  className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  Swap Request
                </button>
                <button
                  onClick={redeemItem}
                  className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Redeem via Points
                </button>
              </>
            )}
          {!user && (
            <p className="text-slate-500">
              Login to request a swap or redeem this item.
            </p>
          )}
        </div>

        {/* Status Messages */}
        {swapStatus && (
          <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
            {swapStatus}
          </p>
        )}
        {redeemStatus && (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
            {redeemStatus}
          </p>
        )}
      </div>
    </div>
  );
}
