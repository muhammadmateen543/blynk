import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  StarIcon as SolidStar,
} from "@heroicons/react/24/solid";
import { StarIcon as OutlineStar } from "@heroicons/react/24/outline";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [editingComment, setEditingComment] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingCommentId, setSavingCommentId] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_B_URL}/api/reviews/all`, {
          credentials: "include",
        });
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleModerate = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_B_URL}/api/reviews/moderate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? updated.review : r))
        );
      }
    } catch (error) {
      console.error("Error moderating review:", error);
    }
  };

  const handleCommentSubmit = async (id) => {
    const comment = editingComment[id];
    if (!comment?.trim()) return;

    setSavingCommentId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_B_URL}/api/reviews/comment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminComment: comment }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? updated.review : r))
        );
        setEditingComment((prev) => ({ ...prev, [id]: "" }));
      }
    } catch (err) {
      console.error("Failed to add admin comment:", err);
    } finally {
      setSavingCommentId(null);
    }
  };

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) =>
        i < rating ? (
          <SolidStar key={i} className="w-5 h-5 text-yellow-500" />
        ) : (
          <OutlineStar key={i} className="w-5 h-5 text-gray-300" />
        )
      )}
    </div>
  );

  const renderStatusBadge = (status) => {
    const base =
      "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";
    if (status === "approved")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          <CheckCircleIcon className="w-4 h-4" /> Approved
        </span>
      );
    if (status === "rejected")
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          <XCircleIcon className="w-4 h-4" /> Rejected
        </span>
      );
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        <ClockIcon className="w-4 h-4" /> Pending
      </span>
    );
  };

  const openLightbox = (images, index = 0) => {
    setLightboxSlides(images.map((src) => ({ src })));
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-blue-600">
          <ClockIcon className="w-10 h-10 animate-spin mx-auto mb-3" />
          <p className="text-lg font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        📝 Manage Customer Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center">No reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white shadow rounded-xl border border-gray-200 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">
                    Reviewer:{" "}
                    <span className="text-indigo-700">
                      {r.userId?.name || r.reviewerName || "Unknown User"}
                    </span>
                  </h4>

                  {r.productId?.name && (
                    <p className="text-sm text-gray-500">
                      Product: {r.productId.name}
                    </p>
                  )}
                  <div className="mt-1">{renderStars(r.rating)}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                  {renderStatusBadge(r.status)}
                  {r.status !== "approved" && (
                    <button
                      onClick={() => handleModerate(r._id, "approved")}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => handleModerate(r._id, "rejected")}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-800 mb-4">{r.comment}</p>

              {r.adminReply && (
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded mb-3 text-sm text-indigo-800">
                  <strong>Admin:</strong> {r.adminReply}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add admin comment..."
                  value={editingComment[r._id] || ""}
                  onChange={(e) =>
                    setEditingComment((prev) => ({
                      ...prev,
                      [r._id]: e.target.value,
                    }))
                  }
                  className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm"
                />
                <button
                  onClick={() => handleCommentSubmit(r._id)}
                  disabled={
                    savingCommentId === r._id || !editingComment[r._id]?.trim()
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {savingCommentId === r._id ? "Saving..." : "Submit"}
                </button>
              </div>

              {r.images?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.images.map((url, i) =>
                    url.endsWith(".mp4") || url.endsWith(".webm") ? (
                      <video
                        key={i}
                        src={url}
                        controls
                        className="w-20 h-20 object-cover border"
                      />
                    ) : (
                      <img
                        key={i}
                        src={url}
                        alt={`Review media ${i}`}
                        onClick={() => openLightbox(r.images, i)}
                        className="w-20 h-20 object-cover border cursor-pointer hover:opacity-90 transition"
                      />
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Viewer */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        plugins={[Thumbnails]}
        thumbnails={{
          width: 60,
          height: 60,
          border: 0,
          padding: 4,
          vignette: false,
        }}
      />
    </div>
  );
}

export default ManageReviews;
