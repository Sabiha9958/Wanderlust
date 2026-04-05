import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import FormInput from "../../components/FormInput";

// ─── Sub-components ───────────────────────────────────────────────

const StarRating = ({ rating = 0, reviews = 0 }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }
          aria-hidden="true"
          style={{ fontSize: "1.1em" }}
        >
          ★
        </span>
      ))}
    </div>
    {reviews > 0 && (
      <span className="text-xs text-gray-500">
        ({reviews} review{reviews !== 1 ? "s" : ""})
      </span>
    )}
  </div>
);

const StatusBadge = ({ isAvailable }) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
      isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
    />
    {isAvailable ? "Active" : "Inactive"}
  </span>
);

const InfoRow = ({ label, value, className = "" }) => (
  <div className="flex justify-between py-1 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 uppercase tracking-wide">
      {label}
    </span>
    <span className={`text-sm font-medium text-gray-800 ${className}`}>
      {value ?? "—"}
    </span>
  </div>
);

const SpinnerIcon = ({ size = 5 }) => (
  <div
    className={`animate-spin rounded-full w-${size} h-${size} border-2 border-current border-t-transparent`}
  />
);

const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// ─── Amenity formatter ────────────────────────────────────────────

const formatAmenity = (a) =>
  a.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

// ─── ListingCard ──────────────────────────────────────────────────

const ListingCard = ({ listing, onDelete, onEdit, isDeleting }) => (
  <article className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-100">
    {/* Card overlay during delete */}
    {isDeleting && (
      <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
        <SpinnerIcon size={10} />
      </div>
    )}

    {/* Thumbnail */}
    {listing.images?.[0]?.url && (
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={listing.images[0].url}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
    )}

    <div className="p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate leading-tight">
            {listing.title}
          </h3>
          <StatusBadge isAvailable={listing.isAvailable} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(listing)}
            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            aria-label={`Edit ${listing.title}`}
            disabled={isDeleting}
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(listing._id)}
            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
            aria-label={`Delete ${listing.title}`}
            disabled={isDeleting}
          >
            {isDeleting ? <SpinnerIcon size={4} /> : <DeleteIcon />}
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="space-y-0.5">
        <InfoRow
          label="Location"
          value={
            [listing.location?.city, listing.location?.country]
              .filter(Boolean)
              .join(", ") || "N/A"
          }
        />
        <InfoRow
          label="Price/night"
          value={`₹${listing.price?.toLocaleString("en-IN") ?? "0"}`}
          className="text-green-600"
        />
        <InfoRow label="Bedrooms" value={listing.bedrooms} />
        <InfoRow label="Bathrooms" value={listing.bathrooms} />
        <InfoRow label="Guests" value={listing.maxGuests} />
        <InfoRow
          label="ID"
          value={`#${listing.listingId ?? listing._id?.slice(-6)}`}
        />
      </div>

      {/* Amenities */}
      {listing.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Amenities">
          {listing.amenities.slice(0, 5).map((a) => (
            <span
              key={a}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
            >
              {formatAmenity(a)}
            </span>
          ))}
          {listing.amenities.length > 5 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{listing.amenities.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <StarRating
          rating={listing.rating ?? 0}
          reviews={listing.reviews ?? 0}
        />
        <span className="text-xs text-gray-400">
          {listing.isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>
    </div>
  </article>
);

// ─── FormModal ────────────────────────────────────────────────────

const FormModal = ({ listing, isOpen, onClose, onSubmit, isBusy }) => {
  const isEditMode = Boolean(listing?._id);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !isBusy) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, isBusy, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isEditMode ? "Edit listing" : "Create new listing"}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit Listing" : "Create New Listing"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditMode
                ? `Updating "${listing.title}"`
                : "Fill in the details for your new property"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40"
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto p-6">
          <FormInput
            initialData={listing}
            isEditMode={isEditMode}
            onSubmit={onSubmit}
            onCancel={onClose}
            isBusy={isBusy}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Loading / Error states ───────────────────────────────────────

const LoadingState = () => (
  <div
    className="min-h-screen flex items-center justify-center bg-gray-50"
    aria-live="polite"
  >
    <div className="text-center space-y-3">
      <SpinnerIcon size={10} />
      <p className="text-gray-500 text-sm">Loading your listings…</p>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div
    className="min-h-screen flex items-center justify-center p-8 bg-gray-50"
    role="alert"
  >
    <div className="text-center max-w-sm p-8 bg-white border border-red-100 rounded-2xl shadow-md space-y-4">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-lg font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="text-gray-500 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

const EmptyState = ({ onCreateNew }) => (
  <div className="text-center py-20 space-y-6">
    <div className="mx-auto w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-5xl">
      🏠
    </div>
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-gray-900">No listings yet</h2>
      <p className="text-gray-500 max-w-sm mx-auto">
        Start by adding your first property — it only takes a few minutes.
      </p>
    </div>
    <button
      onClick={onCreateNew}
      className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
    >
      <span>+</span> Create First Listing
    </button>
  </div>
);

// ─── SENTINEL for "modal closed" (avoids null/undefined ambiguity) ─

const MODAL_CLOSED = Symbol("MODAL_CLOSED");

// ─── MyListings ───────────────────────────────────────────────────

const MyListings = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [submitBusy, setSubmitBusy] = useState(false);

  // modalListing: MODAL_CLOSED = closed, null = create mode, object = edit mode
  const [modalListing, setModalListing] = useState(MODAL_CLOSED);
  const isModalOpen = modalListing !== MODAL_CLOSED;

  // ── Fetch listings ─────────────────────────────────────────────

  const fetchListings = useCallback(async () => {
    if (!user || !token) {
      setPageError("Please sign in to view your listings.");
      setPageLoading(false);
      return;
    }

    try {
      setPageLoading(true);
      setPageError("");
      const { data } = await api.get("/listings/my-listings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data.success)
        throw new Error(data.message || "Failed to fetch listings");
      setListings(data.data ?? []);
    } catch (err) {
      console.error("[MyListings] fetchListings:", err);
      setPageError(
        err?.response?.status === 401
          ? "Session expired. Please sign in again."
          : "Failed to load your listings. Please try again.",
      );
    } finally {
      setPageLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (!authLoading) fetchListings();
  }, [authLoading, fetchListings]);

  // ── Delete ─────────────────────────────────────────────────────

  const handleDelete = useCallback(
    async (id) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this listing? This cannot be undone.",
        )
      )
        return;

      setDeletingId(id);
      try {
        const { data } = await api.delete(`/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setListings((prev) => prev.filter((l) => l._id !== id));
        } else {
          alert(data.message || "Failed to delete listing.");
        }
      } catch (err) {
        console.error("[MyListings] handleDelete:", err);
        alert(
          err?.response?.status === 404
            ? "Listing not found — it may have already been deleted."
            : "Failed to delete listing. Please try again.",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [token],
  );

  // ── Form submit (create or update) ────────────────────────────

  const handleFormSubmit = useCallback(
    async (formData) => {
      setSubmitBusy(true);
      const isEdit = Boolean(modalListing?._id);

      try {
        const request = isEdit
          ? api.put(`/listings/${modalListing._id}`, formData, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : api.post("/listings", formData, {
              headers: { Authorization: `Bearer ${token}` },
            });

        const { data } = await request;

        if (!data.success)
          throw new Error(data.message || "Failed to save listing.");

        setListings((prev) =>
          isEdit
            ? prev.map((l) => (l._id === data.data._id ? data.data : l))
            : [data.data, ...prev],
        );

        setModalListing(MODAL_CLOSED);
      } catch (err) {
        console.error("[MyListings] handleFormSubmit:", err);
        throw new Error(
          err?.response?.data?.message || "Failed to save listing.",
        );
      } finally {
        setSubmitBusy(false);
      }
    },
    [modalListing, token],
  );

  // ── Render ─────────────────────────────────────────────────────

  if (authLoading || pageLoading) return <LoadingState />;
  if (pageError)
    return <ErrorState message={pageError} onRetry={fetchListings} />;

  return (
    <>
      {/* Modal */}
      <FormModal
        isOpen={isModalOpen}
        listing={modalListing === MODAL_CLOSED ? null : modalListing}
        onClose={() => !submitBusy && setModalListing(MODAL_CLOSED)}
        onSubmit={handleFormSubmit}
        isBusy={submitBusy}
      />

      {/* Page */}
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {listings.length === 0
                  ? "No properties yet"
                  : `${listings.length} ${listings.length === 1 ? "property" : "properties"}`}
              </p>
            </div>
            {listings.length > 0 && (
              <button
                onClick={() => setModalListing(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span className="text-lg leading-none">+</span> New Listing
              </button>
            )}
          </div>

          {/* Content */}
          {listings.length === 0 ? (
            <EmptyState onCreateNew={() => setModalListing(null)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  onDelete={handleDelete}
                  onEdit={(l) => setModalListing(l)}
                  isDeleting={deletingId === listing._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyListings;
