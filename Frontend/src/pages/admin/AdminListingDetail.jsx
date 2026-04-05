import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

/* ---------- REUSABLE UI COMPONENTS ---------- */

const DetailItem = ({ label, value, colSpan = 1 }) => (
  <div
    className={`bg-gray-50 p-3 rounded-lg ${colSpan === 2 ? "col-span-2" : ""}`}
  >
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
      {value || "-"}
    </p>
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
    />
  </div>
);

const StarRating = ({ value }) => (
  <div className="flex gap-1 text-sm">
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        className={s <= value ? "text-yellow-400" : "text-gray-200"}
      >
        ★
      </span>
    ))}
  </div>
);

const ReviewCard = ({ review, onDelete }) => (
  <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="font-semibold text-sm text-gray-900">{review.userName}</p>
        <p className="text-xs text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={() => onDelete(review._id)}
        className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
      >
        Remove
      </button>
    </div>
    <StarRating value={review.rating} />
    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
      {review.comment}
    </p>
  </div>
);

/* ---------- MAIN COMPONENT ---------- */

export default function AdminListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    title: "",
    price: "",
    cleaningFee: "",
    serviceFee: "",
    propertyType: "",
    category: "",
    bedrooms: "",
    bathrooms: "",
    beds: "",
    maxGuests: "",
    description: "",
    amenities: "",
    isAvailable: true,
    featured: false,
  });

  // Data Fetching
  const fetchListing = useCallback(async () => {
    try {
      setStatus("loading");
      const { data } = await api.get(`/listings/${id}`);
      const l = data.data;
      setListing(l);

      setForm({
        title: l.title || "",
        price: l.price || "",
        cleaningFee: l.cleaningFee || "",
        serviceFee: l.serviceFee || "",
        propertyType: l.propertyType || "",
        category: l.category || "",
        bedrooms: l.bedrooms || "",
        bathrooms: l.bathrooms || "",
        beds: l.beds || "",
        maxGuests: l.maxGuests || "",
        description: l.description || "",
        amenities: l.amenities ? l.amenities.join(", ") : "",
        isAvailable: l.isAvailable ?? true,
        featured: l.featured ?? false,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(data.data || []);
    } catch {
      setReviews([]);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchListing();
      fetchReviews();
    }
  }, [id, fetchListing, fetchReviews]);

  // Actions
  const handleDeleteListing = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this listing?",
      )
    )
      return;
    try {
      await api.delete(`/listings/${id}`);
      navigate("/admin/listings");
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Clean and cast the payload to prevent 400 Bad Request errors from strict DB validators
      const payload = {
        title: form.title.trim(),
        price: form.price ? Number(form.price) : undefined,
        cleaningFee: form.cleaningFee ? Number(form.cleaningFee) : undefined,
        serviceFee: form.serviceFee ? Number(form.serviceFee) : undefined,
        propertyType: form.propertyType.trim(),
        category: form.category.trim(),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        beds: form.beds ? Number(form.beds) : undefined,
        maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
        description: form.description.trim(),
        isAvailable: form.isAvailable,
        featured: form.featured,
        amenities:
          typeof form.amenities === "string"
            ? form.amenities
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean)
            : form.amenities,
      };

      // Strip keys that resulted in NaN or undefined to safely patch data
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key],
      );

      await api.put(`/listings/${id}`, {
        ...payload,
        images: listing.images,
        location: listing.location,
      });
      setEditMode(false);
      fetchListing(); // Refresh to get normalized data from DB
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to update listing. Please check the values.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      alert("Failed to delete review.");
    }
  };

  // Render States
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === "error" || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-red-100">
          <p className="text-red-600 font-semibold mb-4">
            Failed to load listing details.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-800">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-1 inline-block"
          >
            &larr; Back to Listings
          </button>
          <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">
            {listing.title}
          </h1>
          <p className="text-sm text-gray-500">ID: {listing.listingId}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditMode((p) => !p)}
            className="px-5 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            {editMode ? "Cancel Editing" : "Edit Listing"}
          </button>
          <button
            onClick={handleDeleteListing}
            className="px-5 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Data & Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* INFO / EDIT SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5 border-b pb-3">
              Property Details
            </h2>

            {editMode ? (
              <form onSubmit={handleUpdateListing} className="space-y-4">
                <InputField
                  label="Listing Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InputField
                    label="Price (₹)"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                  <InputField
                    label="Cleaning Fee (₹)"
                    type="number"
                    value={form.cleaningFee}
                    onChange={(e) =>
                      setForm({ ...form, cleaningFee: e.target.value })
                    }
                  />
                  <InputField
                    label="Service Fee (₹)"
                    type="number"
                    value={form.serviceFee}
                    onChange={(e) =>
                      setForm({ ...form, serviceFee: e.target.value })
                    }
                  />

                  <InputField
                    label="Type (e.g. apartment)"
                    value={form.propertyType}
                    onChange={(e) =>
                      setForm({ ...form, propertyType: e.target.value })
                    }
                  />
                  <InputField
                    label="Category (e.g. premium)"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  />
                  <InputField
                    label="Max Guests"
                    type="number"
                    value={form.maxGuests}
                    onChange={(e) =>
                      setForm({ ...form, maxGuests: e.target.value })
                    }
                  />

                  <InputField
                    label="Bedrooms"
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) =>
                      setForm({ ...form, bedrooms: e.target.value })
                    }
                  />
                  <InputField
                    label="Bathrooms"
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) =>
                      setForm({ ...form, bathrooms: e.target.value })
                    }
                  />
                  <InputField
                    label="Beds"
                    type="number"
                    value={form.beds}
                    onChange={(e) => setForm({ ...form, beds: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amenities (Comma separated)
                  </label>
                  <textarea
                    value={form.amenities}
                    onChange={(e) =>
                      setForm({ ...form, amenities: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                  />
                </div>

                <div className="flex gap-6 py-4 border-t border-b border-gray-100 bg-gray-50 px-4 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={(e) =>
                        setForm({ ...form, isAvailable: e.target.checked })
                      }
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    Available for Booking
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm({ ...form, featured: e.target.checked })
                      }
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    Featured Listing
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-sm transition ${isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                  >
                    {isSaving ? "Saving changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <DetailItem
                  label="Property Type"
                  value={listing.propertyType}
                />
                <DetailItem label="Category" value={listing.category} />
                <DetailItem label="Host" value={listing.hostName} />

                <DetailItem
                  label="Price"
                  value={`₹${listing.price?.toLocaleString()}`}
                />
                <DetailItem
                  label="Cleaning Fee"
                  value={`₹${listing.cleaningFee?.toLocaleString()}`}
                />
                <DetailItem
                  label="Service Fee"
                  value={`₹${listing.serviceFee?.toLocaleString()}`}
                />

                <DetailItem label="Bedrooms" value={listing.bedrooms} />
                <DetailItem label="Bathrooms" value={listing.bathrooms} />
                <DetailItem label="Beds" value={listing.beds} />

                <DetailItem label="Max Guests" value={listing.maxGuests} />
                <DetailItem
                  label="Location"
                  value={`${listing.location?.city}, ${listing.location?.state}`}
                  colSpan={2}
                />

                <DetailItem
                  label="Amenities"
                  value={listing.amenities?.join(", ")}
                  colSpan={2}
                />

                <div className="col-span-2 sm:col-span-3 bg-gray-50 p-4 rounded-lg mt-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* REVIEWS SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5 border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">Guest Reviews</h2>
              <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
                {reviews.length} Total
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">
                  No reviews left for this property yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {reviews.map((r) => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Media & Status */}
        <div className="space-y-8">
          {/* STATUS WIDGET */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Current Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">
                  Visibility
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${listing.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {listing.isAvailable ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">
                  Featured
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${listing.featured ? "bg-yellow-100 text-yellow-800" : "bg-gray-200 text-gray-600"}`}
                >
                  {listing.featured ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">
                  Average Rating
                </span>
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  ⭐ {listing.rating ? listing.rating.toFixed(1) : "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-400 space-y-1">
              <p>Created: {new Date(listing.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(listing.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* IMAGE GALLERY WIDGET */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Media Gallery</h3>
            {listing.images?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {listing.images.map((img, i) => (
                  <div
                    key={i}
                    className={`relative rounded-xl overflow-hidden group ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                  >
                    <img
                      src={img.url}
                      alt={`Property ${i + 1}`}
                      className="w-full h-full object-cover aspect-square hover:scale-105 transition duration-500"
                    />
                    {img.isCover && (
                      <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-md">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                No images available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
