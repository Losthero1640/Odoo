import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api/items";

export default function AddItem() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (images.length === 0) {
      setError("One or more images are required");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("type", type);
    formData.append("size", size);
    formData.append("condition", condition);
    formData.append("tags", tags);

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    try {
      const res = await fetch(API_URL + "/create", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(
          "Item submitted for approval. Redirecting to dashboard..."
        );
        setTimeout(() => navigate("/"), 3000);
      } else {
        setError(data.message || "Failed to submit item");
      }
    } catch (e) {
      setError("Error submitting item");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Add New Item</h2>

      {error && (
        <div className="mb-4 px-4 py-2 text-rose-700 bg-rose-100 border border-rose-300 rounded-md text-sm font-medium">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 px-4 py-2 text-green-700 bg-green-100 border border-green-300 rounded-md text-sm font-medium">
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Title*
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {[
          {
            label: "Category",
            state: category,
            setter: setCategory,
            placeholder: "e.g. Clothing",
          },
          {
            label: "Type",
            state: type,
            setter: setType,
            placeholder: "e.g. T-Shirt, Jeans",
          },
          {
            label: "Size",
            state: size,
            setter: setSize,
            placeholder: "e.g. M, L, XL",
          },
          {
            label: "Condition",
            state: condition,
            setter: setCondition,
            placeholder: "e.g. New, Gently Used",
          },
          {
            label: "Tags",
            state: tags,
            setter: setTags,
            placeholder: "e.g. casual, summer, cotton",
          },
        ].map(({ label, state, setter, placeholder }, i) => (
          <div key={i} className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              {label}
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
              className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Upload Images* (max 5)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
