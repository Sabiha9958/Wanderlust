import React, { useEffect, useState, useContext, useCallback } from "react";
import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

/* ---------- HELPERS ---------- */

const normalizeReviews = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.reviews)) return res.reviews;
  return [];
};

/* ---------- UI ---------- */

const StarRating = ({ value, onChange, interactive }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange(s)}
        className={`text-lg transition ${
          s <= value ? "text-yellow-500" : "text-gray-300"
        } ${interactive ? "hover:scale-110 cursor-pointer" : ""}`}
      >
        ★
      </button>
    ))}
  </div>
);

const Skeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 border rounded-xl">
        <div className="h-4 w-1/3 bg-gray-200 mb-2 rounded"></div>
        <div className="h-3 w-1/4 bg-gray-200 mb-3 rounded"></div>
        <div className="h-3 w-full bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

/* ---------- MAIN ---------- */

const Reviews = ({ listingId }) => {
  const { user } = useContext(AuthContext);

  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");

  const [form, setForm] = useState({ rating: 0, comment: "" });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- FETCH ---------- */

  const fetchReviews = useCallback(async () => {
    try {
      setStatus("loading");

      const { data } = await api.get(`/reviews/listing/${listingId}`);

      setReviews(data?.data || []);
      setStatus("success");
    } catch (err) {
      console.error("Fetch reviews error:", err.response?.data);
      setStatus("error");
    }
  }, [listingId]);

  useEffect(() => {
    if (listingId) fetchReviews();
  }, [fetchReviews]);

  /* ---------- LOGIC ---------- */

  const userReview = reviews.find((r) => user?._id === (r.user?._id || r.user));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.rating || !form.comment.trim()) return;

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/reviews/${editingId}`, form);
      } else {
        if (userReview) {
          return alert("You already reviewed this listing");
        }

        await api.post("/reviews", {
          listing: listingId,
          rating: form.rating,
          comment: form.comment,
        });
      }

      setForm({ rating: 0, comment: "" });
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      console.error("Submit error:", err.response?.data);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (r) => {
    setEditingId(r._id);
    setForm({ rating: r.rating, comment: r.comment });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete review?")) return;

    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* ---------- STATS ---------- */

  const total = reviews.length;

  const avg = total ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      percent: total ? (count / total) * 100 : 0,
    };
  });

  /* ---------- STATES ---------- */

  if (status === "loading") return <Skeleton />;

  if (status === "error")
    return (
      <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
        Failed to load reviews
      </div>
    );

  /* ---------- UI ---------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex gap-6 items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {avg.toFixed(1)} ⭐
          </h2>
          <p className="text-sm text-gray-500">{total} reviews</p>
        </div>

        {/* BREAKDOWN */}
        <div className="flex-1 space-y-1">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-2">
              <span className="text-xs w-6">{b.star}★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-yellow-400 rounded"
                  style={{ width: `${b.percent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      {user && (
        <form
          onSubmit={handleSubmit}
          className="border rounded-xl p-4 bg-gray-50 space-y-3"
        >
          <StarRating
            value={form.rating}
            interactive
            onChange={(rating) => setForm((p) => ({ ...p, rating }))}
          />

          <textarea
            value={form.comment}
            onChange={(e) =>
              setForm((p) => ({ ...p, comment: e.target.value }))
            }
            placeholder="Write your experience..."
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {form.comment.length}/300
            </span>

            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ rating: 0, comment: "" });
                  }}
                  className="text-sm text-gray-500"
                >
                  Cancel
                </button>
              )}

              <button
                disabled={submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Post"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* LIST */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">No reviews yet</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const isOwner = user?._id === (r.user?._id || r.user);

            return (
              <div
                key={r._id}
                className="border p-4 rounded-xl hover:shadow-sm transition"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {r.user?.name || "User"}
                    </p>
                    <StarRating value={r.rating} />
                  </div>

                  {isOwner && (
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-indigo-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm mt-2 text-gray-600">{r.comment}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;
