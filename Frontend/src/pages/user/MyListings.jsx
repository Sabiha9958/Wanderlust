import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bath,
  BedDouble,
  Building2,
  Edit3,
  Eye,
  Globe,
  Heart,
  MapPin,
  Plus,
  Star,
  Trash2,
  Users,
  Wifi,
} from "lucide-react";

import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import FormInput from "../../components/form/FormInput";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value = 0) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

const getCoverImage = (images = []) =>
  images.find((img) => img?.isCover)?.url ||
  images?.[0]?.url ||
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200";

const amenityIcons = {
  wifi: <Wifi size={14} />,
  parking: "🚗",
  kitchen: "🍽️",
  ac: "❄️",
  washer: "🧺",
  balcony: "🌇",
  garden: "🌿",
  security: "🛡️",
};

/* -------------------------------------------------------------------------- */
/*                               LISTING CARD                                 */
/* -------------------------------------------------------------------------- */

const ListingCard = memo(({ listing, onEdit, onDelete, isDeleting }) => {
  const coverImage = useMemo(
    () => getCoverImage(listing?.images),
    [listing?.images],
  );

  const location = useMemo(() => {
    const city = listing?.location?.city || "";
    const country = listing?.location?.country || "";

    return [city, country].filter(Boolean).join(", ");
  }, [listing]);

  return (
    <div
      className="
          group
          overflow-hidden
          rounded-[32px]
          border
          border-[#ECECEC]
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-2xl
        "
    >
      {/* IMAGE */}

      <div className="relative h-[250px] overflow-hidden">
        <img
          src={coverImage}
          alt={listing?.title}
          className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
        />

        {/* OVERLAY */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* PRICE */}

        <div
          className="
              absolute
              left-5
              top-5
              rounded-2xl
              bg-white/95
              px-4
              py-2
              shadow-lg
              backdrop-blur-md
            "
        >
          <p className="text-xs font-medium text-gray-500">Per Night</p>

          <h3 className="text-lg font-bold text-gray-900">
            {formatCurrency(listing?.price)}
          </h3>
        </div>

        {/* FEATURED */}

        {listing?.featured && (
          <div
            className="
                absolute
                right-5
                top-5
                rounded-full
                bg-amber-400
                px-3
                py-1
                text-xs
                font-semibold
                text-white
                shadow-md
              "
          >
            Featured
          </div>
        )}

        {/* BOTTOM INFO */}

        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-center justify-between">
            <div>
              <span
                className="
                    rounded-full
                    bg-white/15
                    px-3
                    py-1
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-white
                    backdrop-blur-md
                  "
              >
                {listing?.propertyType}
              </span>

              <h2 className="mt-3 text-2xl font-bold text-white">
                {listing?.title}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-white/90">
                <MapPin size={15} />

                <span>{location}</span>
              </div>
            </div>

            <button
              className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/20
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-white
                  hover:text-gray-900
                "
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-6">
        {/* DESCRIPTION */}

        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
          {listing?.description}
        </p>

        {/* STATS */}

        <div
          className="
              mt-6
              grid
              grid-cols-4
              gap-3
              rounded-3xl
              bg-[#FAFAFA]
              p-4
            "
        >
          <InfoBox
            icon={<BedDouble size={16} />}
            label="Beds"
            value={listing?.beds || 1}
          />

          <InfoBox
            icon={<Bath size={16} />}
            label="Baths"
            value={listing?.bathrooms || 1}
          />

          <InfoBox
            icon={<Users size={16} />}
            label="Guests"
            value={listing?.maxGuests || 1}
          />

          <InfoBox
            icon={<Building2 size={16} />}
            label="Rooms"
            value={listing?.bedrooms || 1}
          />
        </div>

        {/* AMENITIES */}

        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {listing?.amenities?.slice(0, 5)?.map((item) => (
              <div
                key={item}
                className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-gray-700
                  "
              >
                <span>{amenityIcons[item] || "✨"}</span>

                <span className="capitalize">{item.replace("-", " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}

        <div
          className="
              mt-6
              flex
              items-center
              justify-between
              border-t
              border-gray-100
              pt-5
            "
        >
          {/* HOST */}

          <div className="flex items-center gap-3">
            <div
              className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-50
                  text-sm
                  font-bold
                  text-blue-700
                "
            >
              {listing?.hostName?.charAt(0)}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {listing?.hostName}
              </p>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={13} className="fill-amber-400 text-amber-400" />

                <span>{listing?.rating || 0} Rating</span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-2">
            <ActionButton>
              <Eye size={16} />
            </ActionButton>

            <ActionButton onClick={() => onEdit(listing)}>
              <Edit3 size={16} />
            </ActionButton>

            <button
              type="button"
              onClick={() => onDelete(listing?._id)}
              disabled={isDeleting}
              className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  text-red-600
                  transition
                  hover:bg-red-600
                  hover:text-white
                  disabled:opacity-50
                "
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ListingCard.displayName = "ListingCard";

/* -------------------------------------------------------------------------- */
/*                                MAIN PAGE                                   */
/* -------------------------------------------------------------------------- */

const MyListings = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState(null);

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  /* ---------------------------------------------------------------------- */
  /* FETCH                                                                  */
  /* ---------------------------------------------------------------------- */

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/listings/my-listings", authHeaders);

      setListings(data?.data || []);
    } catch (error) {
      console.error(error);

      setPageError(error?.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (!authLoading && token) {
      fetchListings();
    }
  }, [authLoading, token, fetchListings]);

  /* ---------------------------------------------------------------------- */
  /* ACTIONS                                                                */
  /* ---------------------------------------------------------------------- */

  const openModal = useCallback((listing = null) => {
    setCurrentListing(listing);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setCurrentListing(null);
    setIsModalOpen(false);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this listing?")) {
        return;
      }

      try {
        await api.delete(`/listings/${id}`, authHeaders);

        setListings((prev) => prev.filter((item) => item._id !== id));
      } catch (error) {
        console.error(error);
      }
    },
    [authHeaders],
  );

  /* ---------------------------------------------------------------------- */
  /* LOADING                                                                */
  /* ---------------------------------------------------------------------- */

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="space-y-4 text-center">
          <div
            className="
              mx-auto
              h-12
              w-12
              animate-spin
              rounded-full
              border-4
              border-gray-200
              border-t-blue-600
            "
          />

          <p className="text-gray-500">Loading Listings...</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* ERROR                                                                  */
  /* ---------------------------------------------------------------------- */

  if (pageError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-6">
        <div
          className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-red-100
            bg-white
            p-8
            text-center
            shadow-sm
          "
        >
          <h2 className="text-xl font-bold text-red-600">Failed to Load</h2>

          <p className="mt-2 text-gray-500">{pageError}</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* UI                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-100
                bg-blue-50
                px-4
                py-2
                text-sm
                font-medium
                text-blue-700
              "
            >
              <Globe size={15} />
              Property Management
            </div>

            <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900">
              My Listings
            </h1>

            <p className="mt-3 max-w-2xl text-lg text-gray-500">
              Manage your properties, pricing, bookings, amenities, and
              visibility in one modern dashboard experience.
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="
              inline-flex
              items-center
              gap-3
              rounded-2xl
              bg-blue-600
              px-7
              py-4
              font-semibold
              text-white
              shadow-lg
              shadow-blue-500/20
              transition-all
              hover:-translate-y-0.5
              hover:bg-blue-700
            "
          >
            <Plus size={18} />
            Create Listing
          </button>
        </div>

        {/* EMPTY */}

        {listings.length === 0 ? (
          <div
            className="
              rounded-[40px]
              border
              border-dashed
              border-gray-300
              bg-white
              px-6
              py-24
              text-center
            "
          >
            <div className="text-7xl">🏡</div>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              No Listings Yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Start growing your rental business by adding your first premium
              property listing.
            </p>

            <button
              onClick={() => openModal()}
              className="
                mt-8
                rounded-2xl
                bg-blue-600
                px-6
                py-3
                font-semibold
                text-white
                transition
                hover:bg-blue-700
              "
            >
              Add Your First Listing
            </button>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-8
              md:grid-cols-2
              2xl:grid-cols-3
            "
          >
            {listings.map((listing) => (
              <ListingCard
                key={listing?._id}
                listing={listing}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* MODAL */}

        {isModalOpen && (
          <div
            className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/50
      p-5
      backdrop-blur-md
    "
          >
            <div
              className="
        max-h-[95vh]
        w-full
        max-w-5xl
        overflow-y-auto
        rounded-[32px]
        bg-white
        shadow-2xl
      "
            >
              <FormInput
                initialData={currentListing}
                isEditMode={Boolean(currentListing?._id)}
                onSubmit={async (formData) => {
                  try {
                    if (currentListing?._id) {
                      const response = await api.put(
                        `/listings/${currentListing._id}`,
                        formData,
                        authHeaders,
                      );

                      const updatedListing = response?.data?.data;

                      setListings((prev) =>
                        prev.map((item) =>
                          item._id === updatedListing._id
                            ? updatedListing
                            : item,
                        ),
                      );
                    } else {
                      const response = await api.post(
                        "/listings",
                        formData,
                        authHeaders,
                      );

                      const newListing = response?.data?.data;

                      setListings((prev) => [newListing, ...prev]);
                    }

                    closeModal();
                  } catch (error) {
                    console.error("Listing Submit Error:", error);
                  }
                }}
                onCancel={closeModal}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              SMALL COMPONENTS                              */
/* -------------------------------------------------------------------------- */

function InfoBox({ icon, label, value }) {
  return (
    <div className="text-center">
      <div className="flex justify-center text-blue-600">{icon}</div>

      <p className="mt-2 text-xs text-gray-500">{label}</p>

      <h4 className="mt-1 text-sm font-bold text-gray-900">{value}</h4>
    </div>
  );
}

function ActionButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-2xl
        bg-gray-100
        text-gray-700
        transition
        hover:bg-blue-600
        hover:text-white
      "
    >
      {children}
    </button>
  );
}

export default MyListings;
