const mongoose = require("mongoose");
const Listing = require("../models/Listing");

/* ----------------------------- Utility Responses ----------------------------- */
const response = {
  badRequest: (res, message) =>
    res.status(400).json({ success: false, message }),
  notFound: (res, message = "Listing not found") =>
    res.status(404).json({ success: false, message }),
  unauthorized: (res) =>
    res.status(401).json({ success: false, message: "Unauthorized" }),
  serverError: (res, error) => {
    console.error("Server Error:", error.message || error);
    res.status(500).json({ success: false, message: "Internal server error" });
  },
};

/* ------------------------------- Normalizers -------------------------------- */
const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

const normalizeImages = (images = []) => {
  if (!Array.isArray(images)) return [];
  return images.map((img, idx) => ({
    filename: String(img?.filename || `image-${idx + 1}`).trim(),
    url: String(img?.url || "").trim(),
    caption: String(img?.caption || "").trim(),
    isCover: Boolean(img?.isCover),
  }));
};

const normalizeAmenities = (amenities = []) =>
  Array.isArray(amenities)
    ? [...new Set(amenities.map((item) => String(item).trim().toLowerCase()))]
    : [];

// FIX: Safely parse location and guarantee valid GeoJSON or nothing
const buildLocation = (loc = {}) => {
  const parsedLoc = {
    city: String(loc.city || "").trim(),
    area: String(loc.area || "").trim(),
    state: String(loc.state || "").trim(),
    country: String(loc.country || "").trim(),
    addressLine: String(loc.addressLine || "").trim(),
    pincode: String(loc.pincode || "").trim(),
  };

  // Extract coordinates safely whether it comes as [lng, lat] or { type, coordinates: [lng, lat] }
  let coordsArray = null;
  if (Array.isArray(loc.coordinates)) {
    coordsArray = loc.coordinates;
  } else if (Array.isArray(loc.coordinates?.coordinates)) {
    coordsArray = loc.coordinates.coordinates;
  }

  // Only attach the coordinates object if we have exactly 2 valid numbers
  if (coordsArray && coordsArray.length === 2) {
    const lng = Number(coordsArray[0]);
    const lat = Number(coordsArray[1]);

    if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
      parsedLoc.coordinates = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }
  }

  return parsedLoc;
};

/* ------------------------------- Controllers -------------------------------- */

exports.createListing = async (req, res) => {
  if (!req.user?.id) return response.unauthorized(res);

  try {
    const payload = {
      title: req.body.title.trim(),
      description: (req.body.description || "").trim(),
      propertyType: req.body.propertyType || "apartment",
      category: req.body.category || "standard",
      price: normalizeNumber(req.body.price),
      cleaningFee: normalizeNumber(req.body.cleaningFee, 0),
      serviceFee: normalizeNumber(req.body.serviceFee, 0),
      bedrooms: normalizeNumber(req.body.bedrooms, 1),
      bathrooms: normalizeNumber(req.body.bathrooms, 1),
      beds: normalizeNumber(req.body.beds, 1),
      maxGuests: normalizeNumber(req.body.maxGuests, 1),
      amenities: normalizeAmenities(req.body.amenities),
      images: normalizeImages(req.body.images),
      location: buildLocation(req.body.location),
      host: req.user.id,
      isAvailable: req.body.isAvailable ?? true,
      featured: req.body.featured ?? false,
    };

    const listing = await Listing.create(payload);

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing,
    });
  } catch (err) {
    response.serverError(res, err);
  }
};

exports.getMyListings = async (req, res) => {
  if (!req.user?.id) return response.unauthorized(res);

  try {
    const listings = await Listing.find({ host: req.user.id })
      .populate("host", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res
      .status(200)
      .json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    response.serverError(res, err);
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("host", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res
      .status(200)
      .json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    response.serverError(res, err);
  }
};

exports.getListingById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return response.badRequest(res, "Invalid listing ID format");

  try {
    const listing = await Listing.findById(id)
      .populate("host", "name email")
      .lean();

    if (!listing) return response.notFound(res);

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    response.serverError(res, err);
  }
};

exports.updateListing = async (req, res) => {
  if (!req.user?.id) return response.unauthorized(res);

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return response.badRequest(res, "Invalid listing ID format");

  try {
    const existing = await Listing.findById(id);
    if (!existing) return response.notFound(res);

    // Verify ownership (optional but recommended for security)
    if (existing.host.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing",
      });
    }

    const updateData = {
      ...(req.body.title && { title: req.body.title.trim() }),
      ...(req.body.description && { description: req.body.description.trim() }),
      ...(req.body.propertyType && { propertyType: req.body.propertyType }),
      ...(req.body.category && { category: req.body.category }),
      ...(req.body.price != null && {
        price: normalizeNumber(req.body.price, existing.price),
      }),
      ...(req.body.cleaningFee != null && {
        cleaningFee: normalizeNumber(
          req.body.cleaningFee,
          existing.cleaningFee,
        ),
      }),
      ...(req.body.serviceFee != null && {
        serviceFee: normalizeNumber(req.body.serviceFee, existing.serviceFee),
      }),
      ...(req.body.bedrooms != null && {
        bedrooms: normalizeNumber(req.body.bedrooms, existing.bedrooms),
      }),
      ...(req.body.bathrooms != null && {
        bathrooms: normalizeNumber(req.body.bathrooms, existing.bathrooms),
      }),
      ...(req.body.beds != null && {
        beds: normalizeNumber(req.body.beds, existing.beds),
      }),
      ...(req.body.maxGuests != null && {
        maxGuests: normalizeNumber(req.body.maxGuests, existing.maxGuests),
      }),
      ...(Array.isArray(req.body.images) &&
        req.body.images.length > 0 && {
          images: normalizeImages(req.body.images),
        }),
      ...(req.body.amenities && {
        amenities: normalizeAmenities(req.body.amenities),
      }),
      ...(req.body.isAvailable != null && {
        isAvailable: Boolean(req.body.isAvailable),
      }),
      ...(req.body.featured != null && {
        featured: Boolean(req.body.featured),
      }),
      ...(req.body.location && { location: buildLocation(req.body.location) }),
    };

    const updated = await Listing.findByIdAndUpdate(id, updateData, {
      returnDocument: "after", // Fixed deprecation warning here
      runValidators: true,
    })
      .populate("host", "name email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: updated,
    });
  } catch (err) {
    response.serverError(res, err);
  }
};

exports.deleteListing = async (req, res) => {
  if (!req.user?.id) return response.unauthorized(res);

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return response.badRequest(res, "Invalid listing ID format");

  try {
    const listing = await Listing.findById(id);
    if (!listing) return response.notFound(res);

    // Verify ownership
    if (listing.host.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this listing",
      });
    }

    await Listing.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Listing deleted successfully" });
  } catch (err) {
    response.serverError(res, err);
  }
};
