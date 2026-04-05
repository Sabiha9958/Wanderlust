import React from "react";
import { useNavigate } from "react-router-dom";

const ListingHeader = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <button
        onClick={() => navigate("/listings")}
        className="px-4 py-2 rounded-xl bg-white shadow hover:shadow-md transition"
      >
        ← Back
      </button>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {listing.title}
        </h1>

        <p className="text-gray-500 mt-1">
          ⭐ {listing.rating} ({listing.reviews} reviews) •{" "}
          {listing.location.city}, {listing.location.area}
        </p>
      </div>
    </div>
  );
};

export default ListingHeader;
