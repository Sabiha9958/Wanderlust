import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  memo,
} from "react";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import FormInput from "../../components/form/FormInput";

// ---------------- HELPERS ----------------

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeNumber = (value, { fallback = 1, min = 1 } = {}) => {
  if (value === "" || value === null || value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  return Math.max(parsed, min);
};

const normalizeAmenities = (value) => {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value.map((item) => normalizeText(item).toLowerCase()).filter(Boolean),
    ),
  ];
};

const normalizeImages = (value) => {
  if (!Array.isArray(value)) return [];

  return value.filter(Boolean);
};

const buildListingPayload = (formData, user) => ({
  ...formData,
  title: normalizeText(formData.title),
  description: normalizeText(formData.description),
  price: normalizeNumber(formData.price, { fallback: 100, min: 100 }),
  cleaningFee: normalizeNumber(formData.cleaningFee, { fallback: 0, min: 0 }),
  serviceFee: normalizeNumber(formData.serviceFee, { fallback: 0, min: 0 }),
  bedrooms: normalizeNumber(formData.bedrooms, { fallback: 1, min: 1 }),
  bathrooms: normalizeNumber(formData.bathrooms, { fallback: 1, min: 1 }),
  beds: normalizeNumber(formData.beds, { fallback: 1, min: 1 }),
  maxGuests: normalizeNumber(formData.maxGuests, { fallback: 1, min: 1 }),
  amenities: normalizeAmenities(formData.amenities),
  images: normalizeImages(formData.images),
  host: user?._id || user?.id,
  hostName: normalizeText(user?.name) || "Unknown Host",
});

// ---------------- CARD ----------------

const ListingCard = memo(({ listing, onEdit, onDelete, isDeleting }) => {
  const priceLabel = useMemo(
    () => `₹${Number(listing?.price || 0).toLocaleString("en-IN")}`,
    [listing?.price],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2
            className="truncate text-lg font-bold text-gray-900"
            title={listing?.title || "Untitled Listing"}
          >
            {listing?.title || "Untitled Listing"}
          </h2>

          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {priceLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>🛏️ {listing?.beds || 1} Beds</span>
          <span>•</span>
          <span>👥 {listing?.maxGuests || 1} Guests</span>
          <span>•</span>
          <span>🚿 {listing?.bathrooms || 1} Baths</span>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => onEdit(listing)}
            disabled={isDeleting}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(listing._id)}
            disabled={isDeleting}
            className="text-sm font-medium text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
});

ListingCard.displayName = "ListingCard";

// ---------------- MAIN COMPONENT ----------------

const MyListings = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);

  const [listings, setListings] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState(null);

  const authHeaders = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token],
  );

  const openModal = useCallback((listing = null) => {
    setCurrentListing(listing);
    setSubmitError("");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (submitBusy) return;
    setCurrentListing(null);
    setSubmitError("");
    setIsModalOpen(false);
  }, [submitBusy]);

  const fetchListings = useCallback(async () => {
    if (!token) return;

    try {
      setPageLoading(true);
      setPageError("");

      const { data } = await api.get("/listings/my-listings", authHeaders);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load listings");
      }

      setListings(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Fetch Listings Error:", error);
      setPageError(
        error.response?.data?.message ||
          "Failed to load your listings. Please try again.",
      );
    } finally {
      setPageLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (!authLoading && token) {
      fetchListings();
    }
  }, [authLoading, token, fetchListings]);

  const handleDelete = useCallback(
    async (id) => {
      if (!id) return;

      const confirmed = window.confirm(
        "Are you sure you want to delete this listing?",
      );

      if (!confirmed) return;

      try {
        setDeletingId(id);

        const { data } = await api.delete(`/listings/${id}`, authHeaders);

        if (!data?.success) {
          throw new Error(data?.message || "Delete failed");
        }

        setListings((prev) => prev.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Delete Listing Error:", error);
        alert(
          error.response?.data?.message ||
            "Failed to delete the listing. Please try again.",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [authHeaders],
  );

  const handleFormSubmit = useCallback(
    async (formData) => {
      if (!user) {
        throw new Error("User information is missing. Please log in again.");
      }

      try {
        setSubmitBusy(true);
        setSubmitError("");

        const isEditMode = Boolean(currentListing?._id);
        const payload = buildListingPayload(formData, user);

        if (!payload.title) {
          throw new Error("Title is required.");
        }

        if (!payload.description) {
          throw new Error("Description is required.");
        }

        if (payload.beds < 1) {
          throw new Error("Beds must be at least 1.");
        }

        const response = isEditMode
          ? await api.put(
              `/listings/${currentListing._id}`,
              payload,
              authHeaders,
            )
          : await api.post("/listings", payload, authHeaders);

        const { data } = response;

        if (!data?.success || !data?.data) {
          throw new Error(data?.message || "Failed to save listing.");
        }

        setListings((prev) =>
          isEditMode
            ? prev.map((item) =>
                item._id === data.data._id ? data.data : item,
              )
            : [data.data, ...prev],
        );

        closeModal();
      } catch (error) {
        console.error("Submit Listing Error:", error);

        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to save listing.";

        setSubmitError(backendMessage);
        throw new Error(backendMessage);
      } finally {
        setSubmitBusy(false);
      }
    },
    [user, currentListing, authHeaders, closeModal],
  );

  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-gray-500">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        <p>Loading your listings...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-red-50 p-6 text-center text-red-700">
          <p className="mb-4">{pageError}</p>
          <button
            type="button"
            onClick={fetchListings}
            className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="mt-1 text-gray-500">Manage your property portfolio</p>
          </div>

          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            New Listing
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-4 text-5xl">🏡</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              No listings yet
            </h2>
            <p className="mx-auto mb-6 max-w-sm text-gray-500">
              You haven&apos;t added any properties yet. Create your first
              listing to get started.
            </p>
            <button
              type="button"
              onClick={() => openModal()}
              className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              Create First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onEdit={openModal}
                onDelete={handleDelete}
                isDeleting={deletingId === listing._id}
              />
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {submitError && (
                <div className="border-b border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <FormInput
                initialData={currentListing}
                isEditMode={Boolean(currentListing?._id)}
                onSubmit={handleFormSubmit}
                onCancel={closeModal}
                isBusy={submitBusy}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
