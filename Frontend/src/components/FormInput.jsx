// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useCallback,
//   useRef,
// } from "react";
// import "../styles/FormInput.css";

// // ─── Constants ─────────────────────────────────────────────────────────
// const MAX_IMAGES = 15;
// const CLOUDINARY_CONFIG = {
//   cloudName: "dsaowy5xm",
//   uploadPreset: "listing_uploads",
//   url: "https://api.cloudinary.com/v1_1/dsaowy5xm/image/upload",
// };

// const AMENITIES = [
//   "wifi",
//   "parking",
//   "pool",
//   "kitchen",
//   "air-conditioning",
//   "fireplace",
//   "garden",
//   "elevator",
//   "gym",
//   "heating",
//   "washer",
//   "concierge",
//   "sauna",
//   "smart-tv",
//   "security",
//   "rooftop-terrace",
//   "balcony",
//   "breakfast",
//   "workspace",
//   "beach-access",
//   "mountain-view",
//   "lake-view",
//   "sea-view",
//   "patio",
//   "deck",
//   "fire-pit",
//   "daily-housekeeping",
//   "ac",
//   "hair-dryer",
//   "terrace",
//   "shuttle",
//   "clubhouse",
//   "play-area",
//   "power-backup",
//   "lift",
//   "kitchenette",
//   "others",
// ];

// const PROPERTY_TYPES = [
//   "apartment",
//   "studio",
//   "house",
//   "villa",
//   "guest-house",
//   "homestay",
//   "loft",
//   "cottage",
//   "bungalow",
//   "resort",
//   "penthouse",
//   "other",
// ];

// const CATEGORIES = ["budget", "standard", "premium", "luxury"];

// // ─── Helper Functions ──────────────────────────────────────────────────
// const createInitialFormState = () => ({
//   title: "",
//   description: "",
//   propertyType: "apartment",
//   category: "standard",
//   price: "",
//   cleaningFee: "", // Changed from 0 to enforce explicit user input
//   serviceFee: "", // Changed from 0 to enforce explicit user input
//   location: { city: "", area: "", country: "" },
//   bedrooms: "",
//   bathrooms: "",
//   maxGuests: "",
//   amenities: [],
//   images: [],
// });

// const transformListingToFormData = (data) => ({
//   title: data.title || "",
//   description: data.description || "",
//   propertyType: data.propertyType || "apartment",
//   category: data.category || "standard",
//   price: data.price || "",
//   cleaningFee: data.cleaningFee !== undefined ? data.cleaningFee : "",
//   serviceFee: data.serviceFee !== undefined ? data.serviceFee : "",
//   location: {
//     city: data.location?.city || "",
//     area: data.location?.area || "",
//     country: data.location?.country || "",
//   },
//   bedrooms: data.bedrooms || "",
//   bathrooms: data.bathrooms || "",
//   maxGuests: data.maxGuests || "",
//   amenities: data.amenities || [],
//   images: data.images || [],
// });

// const getFriendlyUploadError = (status) => {
//   if (status === 400) return "Invalid file format or size.";
//   if (status === 401)
//     return "Unauthorized upload. Check your Cloudinary preset.";
//   return "Server error during upload. Please try again.";
// };

// // ─── Validation Schema ────────────────────────────────────────────────
// const validateField = (name, value, formData) => {
//   switch (name) {
//     case "title":
//       return value.trim().length >= 10
//         ? ""
//         : "Title must be at least 10 characters";
//     case "description":
//       return value.trim().length >= 10
//         ? ""
//         : "Description must be at least 10 characters";

//     // Strict Pricing Validation
//     case "price":
//       if (value === "") return "Base price is required";
//       const priceNum = Number(value);
//       return priceNum >= 100 && priceNum <= 1000000
//         ? ""
//         : "Price must be between ₹100 and ₹1,000,000";
//     case "cleaningFee":
//     case "serviceFee":
//       if (value === "") return "This fee is required (enter 0 if free)";
//       return Number(value) >= 0 ? "" : "Fee cannot be negative";

//     case "location.city":
//       return value.trim().length >= 2 ? "" : "City name is required";
//     case "location.country":
//       return value.trim().length >= 2 ? "" : "Country is required";
//     case "bedrooms":
//     case "bathrooms":
//       return Number(value) >= 1 && Number(value) <= 20
//         ? ""
//         : `At least 1 ${name.replace("s", "")} required`;
//     case "maxGuests":
//       return Number(value) >= 1 && Number(value) <= 50
//         ? ""
//         : "At least 1 guest, maximum 50";
//     case "images":
//       return formData.images.length >= 2
//         ? ""
//         : "At least two photos are required";
//     default:
//       return "";
//   }
// };

// // ─── Reusable Form Field Component ─────────────────────────────────────
// const FormField = ({
//   label,
//   name,
//   value,
//   onChange,
//   onBlur,
//   error,
//   touched,
//   type = "text",
//   placeholder,
//   disabled,
//   required,
//   min,
//   max,
//   step,
//   rows,
//   options,
//   className = "",
// }) => {
//   const hasError = touched && error && error !== "";
//   const isValid = touched && !hasError;

//   return (
//     <div className="form-field-wrapper">
//       <label className="form-field-label" htmlFor={name}>
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>

//       <div className="form-field-input-wrapper">
//         {type === "textarea" ? (
//           <textarea
//             id={name}
//             name={name}
//             value={value}
//             onChange={onChange}
//             onBlur={onBlur}
//             placeholder={placeholder}
//             disabled={disabled}
//             rows={rows}
//             required={required}
//             className={`form-field-input ${hasError ? "error" : isValid ? "valid" : ""} ${className}`}
//             aria-invalid={hasError}
//           />
//         ) : type === "select" ? (
//           <select
//             id={name}
//             name={name}
//             value={value}
//             onChange={onChange}
//             onBlur={onBlur}
//             disabled={disabled}
//             required={required}
//             className={`form-field-input capitalize ${hasError ? "error" : isValid ? "valid" : ""} ${className}`}
//             aria-invalid={hasError}
//           >
//             {options.map((opt) => (
//               <option key={opt} value={opt}>
//                 {opt.replace("-", " ")}
//               </option>
//             ))}
//           </select>
//         ) : (
//           <input
//             id={name}
//             name={name}
//             type={type}
//             value={value}
//             onChange={onChange}
//             onBlur={onBlur}
//             placeholder={placeholder}
//             disabled={disabled}
//             min={min}
//             max={max}
//             step={step}
//             required={required}
//             className={`form-field-input ${hasError ? "error" : isValid ? "valid" : ""} ${className}`}
//             aria-invalid={hasError}
//           />
//         )}

//         {/* Status Icons */}
//         {isValid && type !== "select" && (
//           <svg
//             className="form-field-icon valid"
//             viewBox="0 0 24 24"
//             aria-hidden="true"
//           >
//             <path
//               fill="currentColor"
//               d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
//             />
//           </svg>
//         )}
//         {hasError && type !== "select" && (
//           <svg
//             className="form-field-icon error"
//             viewBox="0 0 24 24"
//             aria-hidden="true"
//           >
//             <circle
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="2"
//               fill="none"
//             />
//             <line
//               x1="15"
//               y1="9"
//               x2="9"
//               y2="15"
//               stroke="currentColor"
//               strokeWidth="2"
//             />
//             <line
//               x1="9"
//               y1="9"
//               x2="15"
//               y2="15"
//               stroke="currentColor"
//               strokeWidth="2"
//             />
//           </svg>
//         )}
//       </div>

//       {hasError && (
//         <p className="form-field-error" role="alert">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// };

// // ─── Main Form Component ───────────────────────────────────────────────
// const FormInput = ({
//   initialData = null,
//   isEditMode = false,
//   onSubmit,
//   onCancel,
//   isBusy = false,
// }) => {
//   const [formData, setFormData] = useState(createInitialFormState);
//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});
//   const [formError, setFormError] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     if (initialData && isEditMode) {
//       setFormData(transformListingToFormData(initialData));
//     } else {
//       setFormData(createInitialFormState());
//     }
//     setErrors({});
//     setTouched({});
//   }, [initialData, isEditMode]);

//   const validateSingleField = useCallback(
//     (name, value) => {
//       const error = validateField(name, value, formData);
//       setErrors((prev) => ({ ...prev, [name]: error }));
//       return error;
//     },
//     [formData],
//   );

//   const handleInputChange = useCallback(
//     (e) => {
//       const { name, value } = e.target;

//       setFormData((prev) => {
//         if (name.startsWith("location.")) {
//           const locKey = name.split(".")[1];
//           return { ...prev, location: { ...prev.location, [locKey]: value } };
//         }
//         return { ...prev, [name]: value };
//       });

//       if (touched[name]) validateSingleField(name, value);
//     },
//     [touched, validateSingleField],
//   );

//   const handleBlur = useCallback(
//     (e) => {
//       const { name, value } = e.target;
//       setTouched((prev) => ({ ...prev, [name]: true }));
//       validateSingleField(name, value);
//     },
//     [validateSingleField],
//   );

//   const handleImageUpload = useCallback(
//     async (e) => {
//       const files = Array.from(e.target.files);
//       if (files.length === 0) return;

//       const remainingSlots = MAX_IMAGES - formData.images.length;
//       if (files.length > remainingSlots) {
//         setFormError(
//           `Maximum ${MAX_IMAGES} images allowed. You can add ${remainingSlots} more.`,
//         );
//         return;
//       }

//       setIsUploading(true);
//       setFormError("");
//       setUploadProgress(10);

//       try {
//         const uploadPromises = files.map(async (file) => {
//           const formDataUpload = new FormData();
//           formDataUpload.append("file", file);
//           formDataUpload.append(
//             "upload_preset",
//             CLOUDINARY_CONFIG.uploadPreset,
//           );

//           const response = await fetch(CLOUDINARY_CONFIG.url, {
//             method: "POST",
//             body: formDataUpload,
//           });

//           if (!response.ok)
//             throw new Error(getFriendlyUploadError(response.status));

//           const data = await response.json();
//           return {
//             filename: data.original_filename || file.name,
//             url: data.secure_url || data.url,
//             isCover: false,
//           };
//         });

//         const uploadedImages = await Promise.all(uploadPromises);

//         setFormData((prev) => {
//           const updatedImages = [...prev.images, ...uploadedImages];
//           if (
//             updatedImages.length > 0 &&
//             !updatedImages.some((img) => img.isCover)
//           ) {
//             updatedImages[0].isCover = true;
//           }
//           if (updatedImages.length >= 2) {
//             setErrors((e) => ({ ...e, images: "" }));
//           }
//           return { ...prev, images: updatedImages };
//         });

//         setUploadProgress(100);
//       } catch (error) {
//         setFormError(
//           error.message || "Image upload failed. Please check your connection.",
//         );
//       } finally {
//         setTimeout(() => {
//           setIsUploading(false);
//           setUploadProgress(0);
//         }, 500);
//         if (fileInputRef.current) fileInputRef.current.value = "";
//       }
//     },
//     [formData.images.length],
//   );

//   const toggleAmenity = useCallback((amenity) => {
//     setFormData((prev) => {
//       const amenities = prev.amenities.includes(amenity)
//         ? prev.amenities.filter((a) => a !== amenity)
//         : [...prev.amenities, amenity];
//       return { ...prev, amenities };
//     });
//   }, []);

//   const removeImage = useCallback(
//     (index) => {
//       setFormData((prev) => {
//         const newImages = prev.images.filter((_, i) => i !== index);
//         if (prev.images[index].isCover && newImages.length > 0) {
//           newImages[0].isCover = true;
//         }

//         if (newImages.length < 2 && touched.images) {
//           setErrors((e) => ({
//             ...e,
//             images: "At least two photos are required",
//           }));
//         }
//         return { ...prev, images: newImages };
//       });
//     },
//     [touched.images],
//   );

//   const formatAmenity = useCallback(
//     (amenity) =>
//       amenity.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
//     [],
//   );

//   // ─── STRICT FORM VALIDATION ON SUBMIT ─────────────────────────────────
//   const validateForm = useCallback(() => {
//     const newErrors = {};
//     const fieldsToValidate = [
//       "title",
//       "description",
//       "price",
//       "cleaningFee",
//       "serviceFee",
//       "location.city",
//       "location.country",
//       "bedrooms",
//       "bathrooms",
//       "maxGuests",
//       "images",
//     ];

//     fieldsToValidate.forEach((field) => {
//       let value;
//       if (field.startsWith("location.")) {
//         value = formData.location[field.split(".")[1]];
//       } else if (field === "images") {
//         value = formData.images;
//       } else {
//         value = formData[field];
//       }
//       newErrors[field] = validateField(field, value, formData);
//     });

//     setErrors(newErrors);
//     setTouched(Object.fromEntries(fieldsToValidate.map((f) => [f, true])));

//     return Object.values(newErrors).every((error) => !error);
//   }, [formData]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isBusy || isUploading) return;

//     if (!validateForm()) {
//       setFormError("Please fix the validation errors before proceeding.");
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     setFormError("");

//     try {
//       await onSubmit({
//         ...formData,
//         title: formData.title.trim(),
//         description: formData.description.trim(),
//         price: Number(formData.price),
//         cleaningFee: Number(formData.cleaningFee),
//         serviceFee: Number(formData.serviceFee),
//         bedrooms: Number(formData.bedrooms),
//         bathrooms: Number(formData.bathrooms),
//         maxGuests: Number(formData.maxGuests),
//         location: {
//           city: formData.location.city.trim(),
//           area: formData.location.area.trim(),
//           country: formData.location.country.trim(),
//         },
//       });
//     } catch (error) {
//       setFormError(
//         error.message || "Failed to save listing. Please try again.",
//       );
//     }
//   };

//   const selectedAmenitiesText = useMemo(() => {
//     const count = formData.amenities.length;
//     return count > 0 ? `${count} selected` : "None selected";
//   }, [formData.amenities.length]);

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="forminput-container max-w-5xl mx-auto"
//       noValidate
//     >
//       {formError && (
//         <div className="form-global-error" role="alert">
//           <svg viewBox="0 0 24 24" aria-hidden="true">
//             <circle
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="2"
//               fill="none"
//             />
//             <line
//               x1="15"
//               y1="9"
//               x2="9"
//               y2="15"
//               stroke="currentColor"
//               strokeWidth="2"
//             />
//             <line
//               x1="9"
//               y1="9"
//               x2="15"
//               y2="15"
//               stroke="currentColor"
//               strokeWidth="2"
//             />
//           </svg>
//           {formError}
//         </div>
//       )}

//       {/* CORE DETAILS SECTION */}
//       <section className="form-section">
//         <h2 className="form-section-title">Core Details</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="md:col-span-2">
//             <FormField
//               label="Property Title"
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               onBlur={handleBlur}
//               error={errors.title}
//               touched={touched.title}
//               placeholder="e.g., Luxury 3BHK Penthouse with City Views"
//               required
//               disabled={isBusy}
//             />
//           </div>

//           <FormField
//             label="Property Type"
//             name="propertyType"
//             type="select"
//             options={PROPERTY_TYPES}
//             value={formData.propertyType}
//             onChange={handleInputChange}
//             disabled={isBusy}
//           />

//           <FormField
//             label="Category"
//             name="category"
//             type="select"
//             options={CATEGORIES}
//             value={formData.category}
//             onChange={handleInputChange}
//             disabled={isBusy}
//           />
//         </div>

//         <div className="mt-4">
//           <FormField
//             label="Description"
//             name="description"
//             value={formData.description}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors.description}
//             touched={touched.description}
//             type="textarea"
//             rows={5}
//             placeholder="Provide a detailed description of your property..."
//             required
//             disabled={isBusy}
//           />
//         </div>
//       </section>

//       {/* PRICING & FEES SECTION - UPDATED TO BE STRICTLY REQUIRED */}
//       <section className="form-section border-l-4 border-indigo-500 pl-4">
//         <h2 className="form-section-title">Pricing & Fees (₹)</h2>
//         <p className="text-sm text-gray-500 mb-4">
//           All pricing fields must be filled out to proceed.
//         </p>
//         <div className="form-grid-3">
//           <FormField
//             label="Base Price (per night)"
//             name="price"
//             value={formData.price}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors.price}
//             touched={touched.price}
//             type="number"
//             min="100"
//             step="100"
//             required
//             disabled={isBusy}
//           />
//           <FormField
//             label="Cleaning Fee"
//             name="cleaningFee"
//             value={formData.cleaningFee}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors.cleaningFee}
//             touched={touched.cleaningFee}
//             type="number"
//             min="0"
//             step="50"
//             required
//             disabled={isBusy}
//           />
//           <FormField
//             label="Service Fee"
//             name="serviceFee"
//             value={formData.serviceFee}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors.serviceFee}
//             touched={touched.serviceFee}
//             type="number"
//             min="0"
//             step="50"
//             required
//             disabled={isBusy}
//           />
//         </div>
//       </section>

//       {/* LOCATION SECTION */}
//       <section className="form-section">
//         <h2 className="form-section-title">Location</h2>
//         <div className="form-grid-3">
//           <FormField
//             label="City"
//             name="location.city"
//             value={formData.location.city}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors["location.city"]}
//             touched={touched["location.city"]}
//             placeholder="e.g. New Delhi"
//             required
//             disabled={isBusy}
//           />
//           <FormField
//             label="Country"
//             name="location.country"
//             value={formData.location.country}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors["location.country"]}
//             touched={touched["location.country"]}
//             placeholder="e.g. India"
//             required
//             disabled={isBusy}
//           />
//           <FormField
//             label="Area/Neighborhood"
//             name="location.area"
//             value={formData.location.area}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             placeholder="e.g. Connaught Place"
//             disabled={isBusy}
//           />
//         </div>
//       </section>

//       {/* CAPACITY & ROOMS SECTION */}
//       <section className="form-section">
//         <h2 className="form-section-title">Capacity & Rooms</h2>
//         <div className="form-grid-3">
//           <FormField
//             label="Max Guests"
//             name="maxGuests"
//             value={formData.maxGuests}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors.maxGuests}
//             touched={touched.maxGuests}
//             type="number"
//             min="1"
//             max="50"
//             required
//             disabled={isBusy}
//           />
//           <FormField
//             label="Bedrooms"
//             name="bedrooms"
//             value={formData.bedrooms}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors.bedrooms}
//             touched={touched.bedrooms}
//             type="number"
//             min="1"
//             max="20"
//             required
//             disabled={isBusy}
//           />
//           <FormField
//             label="Bathrooms"
//             name="bathrooms"
//             value={formData.bathrooms}
//             onChange={handleInputChange}
//             onBlur={handleBlur}
//             error={errors.bathrooms}
//             touched={touched.bathrooms}
//             type="number"
//             min="1"
//             max="20"
//             required
//             disabled={isBusy}
//           />
//         </div>
//       </section>

//       {/* AMENITIES SECTION */}
//       <section className="form-section">
//         <div className="form-section-header">
//           <h2 className="form-section-title mb-0">Amenities</h2>
//           <span className="form-badge">{selectedAmenitiesText}</span>
//         </div>
//         <div className="form-amenities-grid">
//           {AMENITIES.map((amenity) => {
//             const isSelected = formData.amenities.includes(amenity);
//             return (
//               <button
//                 key={amenity}
//                 type="button"
//                 onClick={() => toggleAmenity(amenity)}
//                 className={`form-amenity-chip ${isSelected ? "selected" : ""}`}
//                 disabled={isBusy}
//                 aria-pressed={isSelected}
//               >
//                 {formatAmenity(amenity)}
//               </button>
//             );
//           })}
//         </div>
//       </section>

//       {/* PHOTOS SECTION */}
//       <section className="form-section">
//         <div className="form-section-header">
//           <h2 className="form-section-title mb-0">
//             Property Photos <span className="text-red-500">*</span>
//           </h2>
//           <span className="form-badge">
//             {formData.images.length}/{MAX_IMAGES}
//           </span>
//         </div>
//         <p className="text-sm text-gray-500 mb-4">
//           You must upload at least 2 images. The first image will be used as the
//           cover photo.
//         </p>

//         <label
//           className={`form-file-upload ${isBusy || formData.images.length >= MAX_IMAGES ? "disabled" : ""}`}
//           style={
//             touched.images && errors.images
//               ? {
//                   borderColor: "var(--fi-danger)",
//                   background: "var(--fi-danger-light)",
//                 }
//               : {}
//           }
//         >
//           <input
//             ref={fileInputRef}
//             type="file"
//             multiple
//             accept="image/jpeg,image/png,image/webp"
//             onChange={handleImageUpload}
//             className="form-file-input"
//             disabled={isBusy || formData.images.length >= MAX_IMAGES}
//           />
//           <div className="form-file-content">
//             <svg viewBox="0 0 24 24">
//               <path
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
//               />
//             </svg>
//             <div>
//               <p>Click or drag to upload photos</p>
//               <p className="subtext">
//                 {formData.images.length >= MAX_IMAGES
//                   ? "Maximum limit reached"
//                   : `Upload up to ${MAX_IMAGES - formData.images.length} more (JPG, PNG, WebP)`}
//               </p>
//             </div>
//           </div>
//         </label>

//         {touched.images && errors.images && (
//           <p className="form-field-error" style={{ marginTop: "12px" }}>
//             ⚠ {errors.images}
//           </p>
//         )}

//         {isUploading && (
//           <div className="upload-progress">
//             <div className="progress-header">
//               <span className="fi-dot-pulse"></span> Uploading to cloud...
//             </div>
//             <div className="fi-progress-track">
//               <div
//                 className="fi-progress-fill"
//                 style={{ width: `${uploadProgress}%` }}
//               ></div>
//             </div>
//           </div>
//         )}

//         {formData.images.length > 0 && (
//           <div className="form-image-grid mt-4">
//             {formData.images.map((img, i) => (
//               <div
//                 key={`${img.url}-${i}`}
//                 className={`form-image-card ${img.isCover ? "ring-2 ring-indigo-500" : ""}`}
//               >
//                 <img
//                   src={img.url}
//                   alt={`Preview ${i + 1}`}
//                   loading="lazy"
//                   className="object-cover"
//                 />
//                 {img.isCover && (
//                   <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
//                     COVER
//                   </span>
//                 )}
//                 <button
//                   type="button"
//                   onClick={() => removeImage(i)}
//                   className="form-image-remove"
//                   disabled={isBusy}
//                 >
//                   ✕
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       <button
//         type="submit"
//         className={`form-submit-btn w-full mt-4 ${Object.values(errors).some(Boolean) ? "invalid" : ""}`}
//         disabled={isBusy || isUploading}
//       >
//         {isBusy ? (
//           <>
//             <div className="fi-spinner" /> Processing Request...
//           </>
//         ) : isEditMode ? (
//           "Save Changes to Database"
//         ) : (
//           "Publish New Listing"
//         )}
//       </button>
//     </form>
//   );
// };

// export default FormInput;
