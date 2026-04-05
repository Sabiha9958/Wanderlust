import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../hooks/useListings";

/* ---------- MAIN ---------- */

const AdminListings = () => {
  const { listings, status, reload } = useListings();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Dynamically extract unique property types for the filter dropdown
  const propertyTypes = useMemo(() => {
    if (!listings) return [];
    const types = new Set(listings.map((l) => l.propertyType).filter(Boolean));
    return ["All", ...Array.from(types)];
  }, [listings]);

  // Filter by both search query and selected property type
  const filtered = useMemo(() => {
    if (!listings) return [];
    return listings.filter((l) => {
      const matchesSearch =
        l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.location?.area?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || l.propertyType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [listings, search, typeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filtered.length} of {listings?.length || 0} properties
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search by title or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />

          {/* TYPE FILTER */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer capitalize"
          >
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            onClick={reload}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Refresh
          </button>

          <button
            onClick={() => navigate("/create-listing")}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
          >
            <span>+</span> Add Listing
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 max-w-7xl mx-auto">
        {status === "loading" && <SkeletonGrid />}
        {status === "error" && <Error retry={reload} />}

        {status === "success" && (
          <>
            {filtered.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((listing) => (
                  <AdminListingCard
                    key={listing._id}
                    listing={listing}
                    onView={() => navigate(`/admin/listings/${listing._id}`)}
                  />
                ))}
              </div>
            ) : (
              <Empty
                onCreate={() => navigate("/admin/listings/create")}
                hasFilters={search !== "" || typeFilter !== "All"}
                resetFilters={() => {
                  setSearch("");
                  setTypeFilter("All");
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminListings;

/* ---------- CARD ---------- */

const AdminListingCard = ({ listing, onView }) => {
  // Find cover image or fallback to first image
  const coverImage =
    listing.images?.find((img) => img.isCover)?.url || listing.images?.[0]?.url;

  return (
    <div
      onClick={onView}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
    >
      {/* IMAGE CONTAINER */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
            <span>📷</span>
            <span className="mt-1">No Image</span>
          </div>
        )}

        {/* STATUS BADGE */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm backdrop-blur-md
              ${
                listing.isAvailable
                  ? "bg-green-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
          >
            {listing.isAvailable ? "Active" : "Inactive"}
          </span>
        </div>

        {/* FEATURED BADGE */}
        {listing.featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-md bg-yellow-400 text-yellow-900 shadow-sm">
            Featured
          </span>
        )}

        {/* HOVER OVERLAY */}
        <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300 flex items-center justify-center">
          <button className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-white text-indigo-600 font-medium text-sm px-5 py-2 rounded-full shadow-lg">
            Manage Listing
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category & Type */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded capitalize">
            {listing.category || "Standard"}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {listing.propertyType}
          </span>
        </div>

        {/* Title & Location */}
        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
          {listing.title}
        </h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-1">
          📍 {listing.location?.city}, {listing.location?.area}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
          <span>🛏️ {listing.bedrooms || 0} Beds</span>
          <span>•</span>
          <span>🛁 {listing.bathrooms || 0} Baths</span>
          <span>•</span>
          <span>👥 {listing.maxGuests || 0} Guests</span>
        </div>

        {/* Footer: Price & Rating */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              ₹{listing.price?.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-gray-500 font-medium">/night</span>
          </div>

          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
            <span className="text-yellow-500 text-xs">★</span>
            <span className="text-xs font-semibold text-yellow-700">
              {listing.rating ? listing.rating.toFixed(1) : "New"}
            </span>
            {listing.reviews > 0 && (
              <span className="text-xs text-gray-400 ml-1">
                ({listing.reviews})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- STATES ---------- */

const SkeletonGrid = () => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm"
      >
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse mt-2" />
        <div className="flex justify-between mt-4 pt-4 border-t">
          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-12 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const Error = ({ retry }) => (
  <div className="text-center py-20 bg-white rounded-2xl border border-red-100 mt-6 shadow-sm">
    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
      ⚠️
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-500 mb-6">
      Failed to load listings from the server.
    </p>
    <button
      onClick={retry}
      className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
    >
      Try Again
    </button>
  </div>
);

const Empty = ({ onCreate, hasFilters, resetFilters }) => (
  <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed mt-6">
    <div className="text-4xl mb-4">🏠</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {hasFilters ? "No matches found" : "No listings yet"}
    </h3>
    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
      {hasFilters
        ? "We couldn't find any properties matching your current filters and search terms."
        : "You haven't created any properties yet. Start by adding your first listing."}
    </p>

    {hasFilters ? (
      <button
        onClick={resetFilters}
        className="px-6 py-2 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition"
      >
        Clear Filters
      </button>
    ) : (
      <button
        onClick={onCreate}
        className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
      >
        Create your first listing
      </button>
    )}
  </div>
);
