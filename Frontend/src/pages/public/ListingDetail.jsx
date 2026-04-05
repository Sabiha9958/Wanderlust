import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";

import ListingHeader from "../../components/listingDetail/ListingHeader";
import ImageGallery from "../../components/listingDetail/ImageGallery";
import BookingCard from "../../components/listingDetail/BookingCard";
import PropertyInfo from "../../components/listingDetail/PropertyInfo";
import Amenities from "../../components/listingDetail/Amenities";
import MetaInfo from "../../components/listingDetail/MetaInfo";
import Reviews from "../../components/Reviews";

const ListingDetail = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  // If we navigated here with listing data in state, use it immediately
  const [listing, setListing] = useState(state?.listing || null);
  const [status, setStatus] = useState(state?.listing ? "success" : "loading");

  const fetchListing = async () => {
    try {
      setStatus("loading");
      const { data } = await api.get(`/listings/${id}`);
      if (data.success && data.data) {
        setListing(data.data);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Failed to fetch listing:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    // Only fetch if we don't already have the data
    if (!listing && id) {
      fetchListing();
    }
    // Scroll to top when opening a new listing
    window.scrollTo(0, 0);
  }, [id]);

  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Preparing your destination...
        </p>
      </div>
    );
  }

  // Error / Not Found State
  if (status === "error" || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Listing Unavailable
          </h2>
          <p className="text-gray-500 mb-8">
            The property you are looking for might have been removed or the link
            is incorrect.
          </p>
          <button
            onClick={() => navigate("/listings")}
            className="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition"
          >
            Explore Other Places
          </button>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Navigation Bar for Detail Page */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to search
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title and Top Level Info */}
        <ListingHeader listing={listing} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
              <ImageGallery images={listing.images} />
            </div>

            {/* Core Property Information (Bedrooms, Bathrooms, Description) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <PropertyInfo listing={listing} />
            </div>

            {/* What this place offers */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <Amenities
                amenities={listing.amenities}
                description={listing.description}
              />
            </div>

            {/* Reviews Section */}
            {/* Note: The Reviews component should handle showing login prompts if a user tries to leave a review */}
            <div
              className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
              id="reviews-section"
            >
              <Reviews listingId={listing._id} />
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Booking Panel */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* The BookingCard is where the "Action" happens. 
                If the user is NOT logged in, THIS component should render a "Login to Book" button 
                instead of the date picker/booking form. 
              */}
              <BookingCard listing={listing} />

              {/* Host and Extra Info */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <MetaInfo listing={listing} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
