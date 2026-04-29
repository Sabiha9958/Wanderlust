import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import FormInput from "../../components/form/FormInput";

// =========================
// HELPERS
// =========================

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

const validateListingPayload = (payload) => {
  if (!payload.title) return "Title is required.";
  if (!payload.description) return "Description is required.";
  if (payload.price < 100) return "Price must be at least ₹100.";
  if (payload.bedrooms < 1) return "Bedrooms must be at least 1.";
  if (payload.bathrooms < 1) return "Bathrooms must be at least 1.";
  if (payload.beds < 1) return "Beds must be at least 1.";
  if (payload.maxGuests < 1) return "Max guests must be at least 1.";
  return "";
};

const getFriendlyListingError = (error) => {
  const status = error?.response?.status;
  const serverMessage =
    error?.response?.data?.message || error?.response?.data?.error || "";

  if (status === 400) {
    return (
      serverMessage ||
      "Some listing details are invalid. Please review the form and try again."
    );
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The listing or service was not found.";
  }

  if (status === 409) {
    return "A similar listing already exists. Please review the details.";
  }

  if (status === 413) {
    return "Uploaded content is too large. Please reduce file size and try again.";
  }

  if (status === 422) {
    return (
      serverMessage ||
      "Submitted data could not be processed. Please check your inputs."
    );
  }

  if (status >= 500) {
    return "Something went wrong on the server. Please try again in a moment.";
  }

  if (error?.code === "ECONNABORTED") {
    return "The request timed out. Please check your connection and try again.";
  }

  if (!error?.response) {
    return "Network error. Please check your internet connection and try again.";
  }

  if (typeof serverMessage === "string" && serverMessage.trim()) {
    if (
      /cast to|validation failed|mongoose|min|max|required/i.test(serverMessage)
    ) {
      return "Invalid data was submitted. Please review the form fields carefully.";
    }
    return serverMessage;
  }

  return "An unexpected error occurred while saving the listing.";
};

// =========================
// FEEDBACK ALERT
// =========================

const FeedbackAlert = ({ type, text }) => {
  if (!text) return null;

  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm ${
        isSuccess
          ? "border-emerald-100 bg-emerald-50 text-emerald-800"
          : "border-rose-100 bg-rose-50 text-rose-800"
      }`}
    >
      {isSuccess ? (
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ) : (
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}

      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};

// =========================
// MAIN COMPONENT
// =========================

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, loading: authLoading } = useContext(AuthContext);

  const listingId = searchParams.get("id");
  const isEditMode = Boolean(listingId);

  const redirectTimerRef = useRef(null);

  const [initialData, setInitialData] = useState(null);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [pageError, setPageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  const authHeaders = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token],
  );

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleBack = useCallback(() => {
    navigate("/my-listings");
  }, [navigate]);

  const fetchListingForEdit = useCallback(async () => {
    if (!listingId || !token) return;

    try {
      setPageLoading(true);
      setPageError("");

      const { data } = await api.get(`/listings/${listingId}`, authHeaders);

      if (!data?.success || !data?.data) {
        throw new Error(data?.message || "Failed to load listing.");
      }

      setInitialData(data.data);
    } catch (error) {
      console.error("Fetch listing for edit failed:", error);
      setPageError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to load listing details.",
      );
    } finally {
      setPageLoading(false);
    }
  }, [listingId, token, authHeaders]);

  useEffect(() => {
    if (!authLoading && isEditMode) {
      fetchListingForEdit();
    }
  }, [authLoading, isEditMode, fetchListingForEdit]);

  const handleSubmit = useCallback(
    async (formData) => {
      if (isSubmitting) return;
      if (!user) {
        setFeedback({
          type: "error",
          text: "User information is missing. Please sign in again.",
        });
        return;
      }

      try {
        setIsSubmitting(true);
        setFeedback({ type: "", text: "" });

        const payload = buildListingPayload(formData, user);
        const validationMessage = validateListingPayload(payload);

        if (validationMessage) {
          throw new Error(validationMessage);
        }

        const response = isEditMode
          ? await api.put(`/listings/${listingId}`, payload, authHeaders)
          : await api.post("/listings", payload, authHeaders);

        const { data } = response;

        if (!data?.success || !data?.data?._id) {
          throw new Error("Invalid server response.");
        }

        setFeedback({
          type: "success",
          text: isEditMode
            ? "Listing updated successfully."
            : "Listing created successfully.",
        });

        redirectTimerRef.current = setTimeout(() => {
          navigate("/my-listings", { replace: true });
        }, 1000);
      } catch (error) {
        console.error("Save listing failed:", error);

        setFeedback({
          type: "error",
          text: getFriendlyListingError(error),
        });

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, user, isEditMode, listingId, authHeaders, navigate],
  );

  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-gray-500">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        <p>{isEditMode ? "Loading listing details..." : "Preparing form..."}</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-red-50 p-6 text-center text-red-700">
          <p className="mb-4">{pageError}</p>
          <div className="flex justify-center gap-3">
            {isEditMode && (
              <button
                type="button"
                onClick={fetchListingForEdit}
                className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            )}
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg bg-gray-700 px-5 py-2 text-white transition hover:bg-gray-800"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center md:p-8">
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Listings
            </button>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {isEditMode ? "Edit Listing" : "Create New Listing"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? "Update the property details below."
                : "Fill in the details below to add a new property to the platform."}
            </p>
          </div>
        </div>

        <FeedbackAlert type={feedback.type} text={feedback.text} />

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="p-6 md:p-8">
            <FormInput
              initialData={initialData}
              isEditMode={isEditMode}
              onSubmit={handleSubmit}
              onCancel={handleBack}
              isBusy={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
