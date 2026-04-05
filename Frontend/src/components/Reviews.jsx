import React, { useEffect, useState, useContext, useCallback } from "react";
import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

/* ---------- SMALL UI PARTS ---------- */

const StarRating = ({ value, onChange, interactive = false }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange(star)}
        className={`text-lg transition ${
          star <= value ? "text-yellow-500" : "text-gray-300"
        } ${interactive ? "hover:scale-110" : ""}`}
      >
        ★
      </button>
    ))}
  </div>
);

const ReviewCard = ({ review, isOwner, onDelete }) => (
  <div className="p-4 rounded-xl border bg-white hover:shadow-md transition">
    <div className="flex justify-between">
      <div>
        <p className="font-medium text-gray-800">{review.userName}</p>
        <p className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>

      {isOwner && (
        <button
          onClick={() => onDelete(review._id)}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Delete
        </button>
      )}
    </div>

    <div className="mt-2">
      <StarRating value={review.rating} />
    </div>

    <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
  </div>
);

/* ---------- MAIN COMPONENT ---------- */

const Reviews = ({ listingId }) => {
  const { user } = useContext(AuthContext);

  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setStatus("loading");
      const { data } = await api.get(`/reviews/${listingId}`);
      setReviews(data.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [listingId]);

  useEffect(() => {
    if (listingId) fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating || !form.comment.trim()) return;

    try {
      setSubmitting(true);
      await api.post("/reviews", { listingId, ...form });
      setForm({ rating: 0, comment: "" });
      fetchReviews();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    await api.delete(`/reviews/${id}`);
    fetchReviews();
  };

  if (status === "loading") {
    return <p className="text-sm text-gray-400">Loading reviews...</p>;
  }

  if (status === "error") {
    return <p className="text-sm text-red-500">Failed to load reviews</p>;
  }

  const avg =
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold">Reviews ({reviews.length})</h2>

        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <StarRating value={Math.round(avg)} />
            <span className="text-xs text-gray-500">{avg.toFixed(1)} avg</span>
          </div>
        )}
      </div>

      {/* FORM */}
      {user && (
        <form
          onSubmit={handleSubmit}
          className="border rounded-xl p-4 bg-gray-50 space-y-3"
        >
          <StarRating
            value={form.rating}
            onChange={(rating) => setForm((p) => ({ ...p, rating }))}
            interactive
          />

          <textarea
            value={form.comment}
            onChange={(e) =>
              setForm((p) => ({ ...p, comment: e.target.value }))
            }
            placeholder="Write your experience..."
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />

          <button
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Review"}
          </button>
        </form>
      )}

      {/* LIST */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard
              key={r._id}
              review={r}
              isOwner={user?._id === r.userId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
