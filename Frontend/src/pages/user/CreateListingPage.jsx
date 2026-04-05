import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput";
import api from "../../api/axiosInstance";

/* =========================
   ERROR HANDLING HELPER
========================= */
const getFriendlyCreateError = (error) => {
  const status = error?.response?.status;
  const serverMessage =
    error?.response?.data?.message || error?.response?.data?.error || "";

  if (status === 400)
    return "Some listing details are missing or invalid. Please check the form.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to create a listing.";
  if (status === 404)
    return "The service could not be found. Please try again later.";
  if (status === 409)
    return "A similar listing already exists. Please review your details.";
  if (status === 413)
    return "The uploaded data is too large. Please reduce image sizes.";
  if (status === 422)
    return "Unprocessable entity. Please check your form inputs.";
  if (status >= 500)
    return "Our server is experiencing issues. Please try again in a moment.";

  if (error?.code === "ECONNABORTED")
    return "The request took too long. Please check your connection.";
  if (!error?.response)
    return "Network error. Please check your internet connection.";

  // Use the exact server message if it exists and is safe to display
  if (typeof serverMessage === "string" && serverMessage.trim()) {
    if (/cast to|validation failed/i.test(serverMessage)) {
      return "Invalid data format provided. Please check your inputs.";
    }
    return serverMessage;
  }

  return "An unexpected error occurred while creating the listing.";
};

/* =========================
   MAIN COMPONENT
========================= */
const CreateListingPage = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const handleCreateListing = async (listingPayload) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      // Send the perfectly formatted payload from FormInput to the backend
      const response = await api.post("/listings", listingPayload);
      const responseData = response?.data;

      if (!responseData?.success || !responseData?.data?._id) {
        throw new Error("Invalid server response formatting");
      }

      setFeedback({
        type: "success",
        text: "Success! Your listing has been published.",
      });

      // Small delay so the user can read the success message before redirecting
      setTimeout(() => {
        navigate(`/admin/listings/${responseData.data._id}`, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Create listing failed:", error);
      setFeedback({
        type: "error",
        text: getFriendlyCreateError(error),
      });
      // Scroll to top so the user sees the error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate("/admin/listings")}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-3"
            >
              <svg
                className="w-4 h-4"
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Create New Listing
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details below to add a new property to the platform.
            </p>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {feedback.text && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}
            role="alert"
          >
            {feedback.type === "success" ? (
              <svg
                className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0"
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
                className="w-5 h-5 text-rose-600 mt-0.5 shrink-0"
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
            <div className="font-medium text-sm">{feedback.text}</div>
          </div>
        )}

        {/* MAIN FORM WRAPPER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <FormInput onSubmit={handleCreateListing} isBusy={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
