// ✅ frontend/components/ReviewList.jsx
import React, { useEffect, useState } from "react";

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_B_URL}/api/reviews/product/${productId}`)
      .then((res) => res.json())
      .then(setReviews)
      .catch((err) => console.error("Failed to fetch reviews:", err));
  }, [productId]);

  return (
    <div className="mt-6 space-y-4">
      {reviews.map((r) => (
        <div key={r._id} className="bg-gray-50 border rounded p-3">
          <div className="flex items-center gap-2 text-yellow-500">
            {Array(r.rating).fill("★").map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
          <p className="text-sm text-gray-700 mt-1">{r.text}</p>

          {r.images?.length > 0 && (
            <img
              src={r.images[0]}
              alt="review-img"
              className="h-32 mt-2 rounded object-cover"
            />
          )}

          {r.adminComment && (
            <p className="text-xs text-indigo-600 mt-2">
              <strong>Admin:</strong> {r.adminComment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
