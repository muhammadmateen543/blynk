import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaSpinner, FaTimesCircle } from "react-icons/fa";

const MAX_IMAGES = 5;

export default function SubmitReviewPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    setError("");
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + images.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const allImages = selectedFiles.filter((file) => file.type.startsWith("image/"));
    if (allImages.length !== selectedFiles.length) {
      setError("Only image files are allowed.");
      return;
    }

    setImages((prev) => [...prev, ...allImages]);
    setImagePreviews((prev) => [
      ...prev,
      ...allImages.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!comment.trim()) {
      setError("Please enter your comment.");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("productId", productId);
    form.append("rating", rating);
    form.append("comment", comment);
    images.forEach((img) => form.append("images", img));

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (data.success) {
        alert("Review submitted for approval!");
        navigate("/orders");
      } else {
        setError("Failed to submit review.");
      }
    } catch (err) {
      setError("An error occurred while submitting review.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Write a Review</h2>

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 p-3 rounded flex items-center gap-2">
          <FaTimesCircle />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Star Rating */}
        <div className="flex flex-col items-center">
          <label className="mb-2 text-gray-700 font-semibold select-none">Rating:</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={36}
                className={`cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                role="button"
                tabIndex={0}
                aria-label={`${star} Star`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setRating(star);
                }}
              />
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block mb-1 font-semibold text-gray-700">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700 select-none">
            Upload Images (max {MAX_IMAGES})
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
            disabled={images.length >= MAX_IMAGES}
          />
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <img src={src} alt={`Preview ${idx}`} className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-80 transition"
                    aria-label="Remove image"
                  >
                    <FaTimesCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading && <FaSpinner className="animate-spin" />}
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
