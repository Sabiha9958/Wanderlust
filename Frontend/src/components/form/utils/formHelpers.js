export const createInitialFormState = () => ({
  title: "",
  description: "",
  propertyType: "apartment",
  category: "standard",
  price: "",
  cleaningFee: "",
  serviceFee: "",
  location: { city: "", area: "", country: "" },
  bedrooms: "",
  bathrooms: "",
  maxGuests: "",
  amenities: [],
  images: [],
});

export const transformListingToFormData = (data) => ({
  title: data.title || "",
  description: data.description || "",
  propertyType: data.propertyType || "apartment",
  category: data.category || "standard",
  price: data.price || "",
  cleaningFee: data.cleaningFee !== undefined ? data.cleaningFee : "",
  serviceFee: data.serviceFee !== undefined ? data.serviceFee : "",
  location: {
    city: data.location?.city || "",
    area: data.location?.area || "",
    country: data.location?.country || "",
  },
  bedrooms: data.bedrooms || "",
  bathrooms: data.bathrooms || "",
  maxGuests: data.maxGuests || "",
  amenities: data.amenities || [],
  images: data.images || [],
});

export const getFriendlyUploadError = (status) => {
  if (status === 400) return "Invalid file format or size.";
  if (status === 401)
    return "Unauthorized upload. Check your Cloudinary preset.";
  return "Server error during upload. Please try again.";
};

export const formatAmenity = (amenity) => {
  return amenity.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};
