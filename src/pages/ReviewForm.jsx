import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaShoppingBag,
  FaSmileBeam,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaUpload,
  FaTimesCircle,
} from "react-icons/fa";

import toast, { Toaster } from "react-hot-toast";

const MAX_IMAGES = 5;

const ReviewForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState("");
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  // Disable form inputs while submitting or after submission
  const isFormDisabled = submitting || submitted;

  useEffect(() => {
    if (!token) {
      setError("Missing review token.");
      setLoading(false);
      return;
    }

    axios
      .get(`/api/review-tokens/verify?token=${token}`)
      .then((res) => {
        const { productName, productId, userId } = res.data;
        setProductName(productName);
        setProductId(productId);
        setUserId(userId);
        setTokenValid(true);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Invalid or expired token.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleImageChange = (e) => {
    if (isFormDisabled) return; // Prevent if disabled

    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + images.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const allImages = selectedFiles.filter((file) => file.type.startsWith("image/"));
    if (allImages.length !== selectedFiles.length) {
      toast.error("Only image files (jpg, png, etc.) are allowed.");
      return;
    }

    setImages((prev) => [...prev, ...allImages]);
    setImagePreviews((prev) => [
      ...prev,
      ...allImages.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index) => {
    if (isFormDisabled) return; // Prevent if disabled

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isFormDisabled) return; // prevent double submission

    if (!reviewerName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please provide a valid rating.");
      return;
    }

    if (images.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("comment", comment);
    formData.append("rating", rating);
    formData.append("token", token);
    formData.append("reviewerName", reviewerName);
    formData.append("userId", userId);
    images.forEach((img) => formData.append("images", img));

    try {
      await axios.post("/api/review-tokens/submit", formData);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main
        className="flex justify-center items-center h-screen text-gray-600 text-lg select-none"
        role="status"
        aria-live="polite"
      >
        <FaSpinner className="animate-spin mr-2 text-3xl" aria-hidden="true" />
        Verifying token...
      </main>
    );
  }

  if (error && !submitted) {
    return (
      <main
        className="flex flex-col justify-center items-center h-screen text-red-600 px-6 text-center select-none"
        role="alert"
        aria-live="assertive"
      >
        <FaExclamationTriangle className="text-5xl mb-4 animate-pulse" aria-hidden="true" />
        <p className="text-xl font-semibold">{error}</p>
      </main>
    );
  }

  if (!tokenValid) return null;

  if (submitted) {
    return (
      <main
        className="flex flex-col items-center justify-center text-center py-20 px-6 select-none bg-gradient-to-tr from-indigo-50 via-white to-pink-50 min-h-screen"
        role="alert"
        aria-live="polite"
      >
        <FaCheckCircle
          className="text-green-500 text-7xl mb-6 animate-bounce drop-shadow-lg"
          aria-hidden="true"
        />
        <h2 className="text-4xl font-extrabold mb-3 tracking-wide text-gray-900">
          Thank you for reviewing!
        </h2>
        <p className="text-gray-700 max-w-md mb-4 text-lg">
          Your thoughts on <strong>{productName}</strong> help others and make us better.
        </p>
        <p className="text-indigo-700 font-extrabold text-3xl mb-8 select-none drop-shadow-md">
          BLYNK
        </p>
        <button
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-3 shadow-lg transition-transform active:scale-95 select-none"
          onClick={() => navigate("/")}
        >
          <FaShoppingBag className="text-xl" aria-hidden="true" />
          Back to Shop
        </button>
      </main>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <main
        className="min-h-screen bg-gradient-to-tr from-indigo-50 via-white to-pink-50 flex items-center justify-center px-6 py-12"
        role="main"
      >
        <section
          className="bg-white max-w-xl w-full rounded-3xl shadow-2xl p-10 sm:p-14 border border-gray-200"
          aria-label="Review submission form"
        >
          <header className="text-center mb-10 select-none">
            <FaSmileBeam
              className="text-yellow-400 text-6xl mx-auto mb-5 drop-shadow-lg"
              aria-hidden="true"
            />
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              How was your <span className="text-indigo-700">BLYNK</span> product?
            </h1>
            <p className="text-gray-500 mt-3 text-base sm:text-lg max-w-lg mx-auto">
              Share your thoughts on <strong>{productName}</strong> below.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-8"
            noValidate
          >
            {/* Reviewer Name */}
            <div>
              <label
                htmlFor="reviewerName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reviewerName"
                name="reviewerName"
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 px-5 py-3 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-indigo-300 focus:outline-none transition"
                autoComplete="name"
                required
                aria-required="true"
                disabled={isFormDisabled}
              />
            </div>

            {/* Star Rating */}
            <div className="text-center">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Rating <span className="text-red-500">*</span>
              </label>
              <div
                className="flex justify-center space-x-3"
                role="radiogroup"
                aria-label="Star rating"
                aria-disabled={isFormDisabled}
                style={{ pointerEvents: isFormDisabled ? "none" : "auto" }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={36}
                    onClick={() => !isFormDisabled && setRating(star)}
                    onMouseEnter={() => !isFormDisabled && setHoverRating(star)}
                    onMouseLeave={() => !isFormDisabled && setHoverRating(null)}
                    className={`cursor-pointer transition-transform duration-150 hover:scale-110 ${
                      (hoverRating || rating) >= star
                        ? "text-yellow-400 drop-shadow-lg"
                        : "text-gray-300"
                    }`}
                    aria-checked={rating === star}
                    role="radio"
                    tabIndex={isFormDisabled ? -1 : 0}
                    aria-label={`${star} star`}
                    onKeyDown={(e) => {
                      if (!isFormDisabled && (e.key === "Enter" || e.key === " ")) setRating(star);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Comment (optional)
              </label>
              <textarea
                id="comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="5"
                placeholder="Tell us what you think..."
                className="w-full rounded-xl border border-gray-300 px-5 py-3 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-indigo-300 focus:outline-none resize-none transition"
                aria-multiline="true"
                readOnly={isFormDisabled}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label
                htmlFor="imageUploadInput"
                className={`flex items-center gap-3 text-sm font-semibold text-gray-700 mb-2 cursor-pointer select-none ${
                  images.length >= MAX_IMAGES || isFormDisabled ? "cursor-not-allowed" : ""
                }`}
              >
                <FaUpload className="text-indigo-600 text-xl" />
                <span>Upload Images (max {MAX_IMAGES})</span>
                <span className="text-xs text-gray-400">(Only images allowed, no videos)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="imageUploadInput"
                disabled={images.length >= MAX_IMAGES || isFormDisabled}
                aria-disabled={images.length >= MAX_IMAGES || isFormDisabled}
              />

              {/* Dashed upload box */}
              <label
                htmlFor="imageUploadInput"
                className={`mt-2 block w-full rounded-xl border-2 border-dashed py-6 text-center text-indigo-600 font-semibold transition ${
                  images.length >= MAX_IMAGES || isFormDisabled
                    ? "border-gray-300 cursor-not-allowed bg-gray-50"
                    : "border-indigo-500 cursor-pointer hover:border-indigo-700 bg-white"
                }`}
                aria-disabled={images.length >= MAX_IMAGES || isFormDisabled}
              >
                {images.length < MAX_IMAGES && !isFormDisabled
                  ? "Click or drag files here to upload"
                  : "Maximum images uploaded or upload disabled"}
              </label>

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6 sm:grid-cols-5">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden shadow-md border border-gray-200 group"
                    >
                      <img
                        src={src}
                        alt={`preview-${idx + 1}`}
                        className="w-full h-24 object-cover"
                        loading="lazy"
                      />
                      {!isFormDisabled && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          <FaTimesCircle size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting || submitted}
                className={`inline-flex justify-center items-center gap-3 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl px-10 py-4 shadow-lg transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed select-none`}
                aria-busy={submitting}
              >
                {submitting && <FaSpinner className="animate-spin text-lg" aria-hidden="true" />}
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default ReviewForm;
