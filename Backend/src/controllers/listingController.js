const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const { getIO } = require("../socket/socket");

/* ---------------- HELPERS ---------------- */

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const toNumber = (val, fallback = 0) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
};

const cleanString = (val) => (typeof val === "string" ? val.trim() : val);

const cleanArray = (arr) =>
  Array.isArray(arr)
    ? [...new Set(arr.map((i) => i.trim().toLowerCase()).filter(Boolean))]
    : [];

/* =========================================================
   CREATE LISTING
========================================================= */
exports.createListing = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const listing = await Listing.create({
      ...req.body,

      /* SECURITY: force server-side values */
      host: user.id,
      hostName: user.name || "",

      /* sanitize critical fields */
      title: cleanString(req.body.title),
      description: cleanString(req.body.description),

      amenities: cleanArray(req.body.amenities),

      /* safe numeric casting */
      price: toNumber(req.body.price),
      cleaningFee: toNumber(req.body.cleaningFee),
      serviceFee: toNumber(req.body.serviceFee),
      maxGuests: toNumber(req.body.maxGuests),
      bedrooms: toNumber(req.body.bedrooms),
      bathrooms: toNumber(req.body.bathrooms),
      beds: toNumber(req.body.beds),

      /* IMPORTANT: prevent override */
      listingId: undefined,
      slug: undefined,
    });

    getIO()?.emit("dashboard:update", {
      type: "LISTING_CREATED",
      data: listing,
    });

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   GET ALL LISTINGS
========================================================= */
exports.getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate("host", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   GET SINGLE LISTING
========================================================= */
exports.getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const listing = await Listing.findById(id)
      .populate("host", "name email")
      .lean();

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    return res.json({
      success: true,
      data: listing,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   MY LISTINGS
========================================================= */
exports.getMyListings = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const listings = await Listing.find({ host: user.id })
      .populate("host", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   UPDATE LISTING
========================================================= */
exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const isOwner =
      listing.host.toString() === user.id || user.role === "admin";

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    /* ---------------- SAFE UPDATE PAYLOAD ---------------- */
    const updateData = { ...req.body };

    // ❌ never allow overwriting system fields
    delete updateData.slug;
    delete updateData.listingId;
    delete updateData.host;
    delete updateData.hostName;

    // normalize numbers
    const numericFields = [
      "price",
      "cleaningFee",
      "serviceFee",
      "maxGuests",
      "bedrooms",
      "bathrooms",
      "beds",
    ];

    numericFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        updateData[field] = toNumber(updateData[field]);
      }
    });

    // clean strings
    if (updateData.title) updateData.title = cleanString(updateData.title);
    if (updateData.description)
      updateData.description = cleanString(updateData.description);

    // clean arrays
    if (updateData.amenities) {
      updateData.amenities = cleanArray(updateData.amenities);
    }

    const updated = await Listing.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        returnDocument: "after",
      },
    )
      .populate("host", "name email")
      .lean();

    return res.json({
      success: true,
      message: "Listing updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   DELETE LISTING
========================================================= */
exports.deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const isOwner =
      listing.host.toString() === user.id || user.role === "admin";

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    await listing.deleteOne();

    return res.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
