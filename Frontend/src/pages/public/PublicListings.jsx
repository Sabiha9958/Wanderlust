import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../hooks/useListings";
import ListingCard from "../../components/ListingCard";

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm h-full flex flex-col">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-4 space-y-3 flex-1 flex flex-col">
      <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
      <div className="mt-auto pt-4 flex justify-between items-center">
        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const PublicListings = () => {
  const { listings, status, reload } = useListings();
  const navigate = useNavigate();

  const handleView = (id) => {
    // Anyone can view the detail page, logged in or not.
    navigate(`/listings/${id}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Explore Listings
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {status === "success"
                ? `Found ${listings.length} properties for your next stay`
                : "Discover amazing places around the world"}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {status === "loading" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center py-24 bg-white rounded-3xl border border-red-100 shadow-sm max-w-2xl mx-auto mt-8">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-500 mb-6 px-4">
              We couldn't load the properties right now. Please check your
              connection and try again.
            </p>
            <button
              onClick={reload}
              className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition shadow-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            {listings.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    onView={() => handleView(listing._id)}
                    // We remove isLocked so the card doesn't show a lock icon
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto mt-8">
                <div className="text-6xl mb-4">🏜️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-500">
                  We couldn't find any listings that match your criteria. Please
                  check back later.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicListings;
