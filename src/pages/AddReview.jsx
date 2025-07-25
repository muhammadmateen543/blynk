// src/pages/AddReview.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AddReview() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false); // 🟡 new state for loading

  const handleFileChange = (e) => setImages([...e.target.files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 🟡 start loading

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("userId", localStorage.getItem("uid"));
      formData.append("rating", rating);
      formData.append("comment", comment);
      images.forEach((file) => formData.append("images", file));

      const res = await fetch("/api/review-tokens/submit", {
        method: "POST",
        body: formData,
      });

      if (res.ok) navigate("/orders");
      else alert("Failed to submit review.");
    } catch (err) {
      console.error("Submit failed", err);
      alert("An error occurred.");
    } finally {
      setLoading(false); // 🟡 stop loading
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Submit Review</h2>

      {loading && (
        <div className="mb-4 text-center text-blue-600 font-semibold">
          Submitting your review...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-medium">Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="ml-2 border rounded p-1"
            disabled={loading}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Comment:</label>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded p-2"
            disabled={loading}
          />
        </div>

        <div>
          <label className="font-medium">Upload Images:</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="block mt-1"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={`bg-blue-600 text-white py-2 px-4 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
