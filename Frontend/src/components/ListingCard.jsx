import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const image = listing.images?.[0]?.url;

  const handleNavigate = () => {
    if (!user) {
      navigate("/login", {
        state: { from: `/listing/${listing._id}` },
      });
      return;
    }

    navigate(`/listing/${listing._id}`, { state: { listing } });
  };

  return (
    <article
      onClick={handleNavigate}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* IMAGE */}
      <div className="relative h-52 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400 text-sm">
            No Image Available
          </div>
        )}

        {/* gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />

        {/* AVAILABILITY */}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md
            ${
              listing.isAvailable
                ? "bg-green-100/90 text-green-700"
                : "bg-red-100/90 text-red-600"
            }`}
        >
          {listing.isAvailable ? "Available" : "Unavailable"}
        </span>

        {/* LOCK HOVER */}
        {!user && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <div className="bg-black/60 text-white text-xs px-4 py-2 rounded-lg backdrop-blur">
              Login to view details
            </div>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">
        {/* TITLE */}
        <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {listing.title}
        </h2>

        {/* LOCATION */}
        <p className="text-sm text-gray-500">
          📍 {listing.location?.city}, {listing.location?.area}
        </p>

        {/* PRICE + RATING */}
        <div className="flex items-center justify-between mt-2">
          {/* PRICE (masked instead of blur) */}
          <span className="text-lg font-bold text-green-600">
            {user ? `₹${listing.price?.toLocaleString?.() || 0}` : "₹••••"}
          </span>

          <span className="text-sm text-gray-500">
            ⭐ {listing.rating || 0}
            <span className="opacity-70"> ({listing.reviews || 0})</span>
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${
              user
                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {user ? "View Details →" : "Login to Continue"}
        </button>
      </div>

      {/* subtle bottom accent on hover */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </article>
  );
};

export default ListingCard;
