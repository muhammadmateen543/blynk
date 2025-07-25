import React, { useState } from "react";
import {
  FaStar,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaUpload,
} from "react-icons/fa";
import axios from "axios";

const MAX_IMAGES = 5;

export default function InlineReviewForm({
  productId,
  productName,
  userId,
  orderId,
  onSubmitted,
  reviewerName = "",
  reviewToken = null, // ✅ optional token passed
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const validImages = selected.filter((file) =>
      file.type.startsWith("image/")
    );
    if (validImages.length !== selected.length) {
      setError("Only image files are allowed.");
      return;
    }

    setImages(validImages);
    setImagePreviews(validImages.map((file) => URL.createObjectURL(file)));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!reviewerName || !comment) {
      setError("Please fill out all fields.");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("userId", userId);
    formData.append("rating", rating);
    formData.append("comment", comment);
    formData.append("reviewerName", reviewerName);
    formData.append("orderId", orderId);
    if (reviewToken) formData.append("token", reviewToken); // ✅ Add token if present
    images.forEach((img) => formData.append("images", img));

    try {
      const endpoint = reviewToken
        ? "/api/review-tokens/submit"
        : "/api/reviews/internal-submit";

      await axios.post(endpoint, formData);
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error(err);
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-green-600 text-sm flex items-center gap-2 mt-2">
        <FaCheckCircle />
        Thank you for your review!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="bg-gray-50 p-4 rounded border mt-2 space-y-4"
    >
      {error && (
        <div className="text-red-500 text-sm flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <FaStar
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(null)}
              className={`cursor-pointer text-xl ${
                (hoverRating || rating) >= s
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Comment</label>
        <textarea
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
          className="border w-full px-3 py-2 rounded resize-none text-sm"
          placeholder="Write your review..."
        />
      </div>

      <div>
        <label className="flex items-center gap-1 text-sm font-medium mb-1">
          <FaUpload />
          Upload Images (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full text-sm"
        />
        {imagePreviews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {imagePreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`preview-${idx}`}
                className="w-16 h-16 object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white px-4 py-2 rounded text-sm flex items-center gap-2"
      >
        {submitting ? (
          <>
            <FaSpinner className="animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
