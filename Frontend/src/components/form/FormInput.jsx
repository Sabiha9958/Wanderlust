import React from "react";
import "../../styles/FormInput.css";

import { useFormState } from "./hooks/useFormState";
import { useImageUpload } from "./hooks/useImageUpload";

import CoreDetails from "./sections/CoreDetails";
import PricingSection from "./sections/PricingSection";
import LocationSection from "./sections/LocationSection";
import CapacitySection from "./sections/CapacitySection";
import AmenitiesSection from "./sections/AmenitiesSection";
import ImagesSection from "./sections/ImagesSection";

const FormInput = ({
  initialData = null,
  isEditMode = false,
  onSubmit,
  onCancel,
  isBusy = false,
}) => {
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    touched,
    formError,
    setFormError,
    handleInputChange,
    handleBlur,
    toggleAmenity,
    validateForm,
  } = useFormState(initialData, isEditMode);

  const {
    isUploading,
    uploadProgress,
    fileInputRef,
    handleImageUpload,
    removeImage,
  } = useImageUpload(formData, setFormData, setErrors, setFormError, touched);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBusy || isUploading) return;

    if (!validateForm()) {
      setFormError("Please fix the validation errors before proceeding.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormError("");

    try {
      await onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        cleaningFee: Number(formData.cleaningFee),
        serviceFee: Number(formData.serviceFee),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        maxGuests: Number(formData.maxGuests),
        location: {
          city: formData.location.city.trim(),
          area: formData.location.area.trim(),
          country: formData.location.country.trim(),
        },
      });
    } catch (error) {
      setFormError(
        error.message || "Failed to save listing. Please try again.",
      );
    }
  };

  const sharedProps = {
    formData,
    handleInputChange,
    handleBlur,
    errors,
    touched,
    isBusy,
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="forminput-container max-w-5xl mx-auto"
      noValidate
    >
      {formError && (
        <div className="form-global-error" role="alert">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="15"
              y1="9"
              x2="9"
              y2="15"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="9"
              y1="9"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          {formError}
        </div>
      )}

      <CoreDetails {...sharedProps} />
      <PricingSection {...sharedProps} />
      <LocationSection {...sharedProps} />
      <CapacitySection {...sharedProps} />

      <AmenitiesSection
        formData={formData}
        toggleAmenity={toggleAmenity}
        isBusy={isBusy}
      />

      <ImagesSection
        formData={formData}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        fileInputRef={fileInputRef}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        errors={errors}
        touched={touched}
        isBusy={isBusy}
      />

      <button
        type="submit"
        className={`form-submit-btn w-full mt-4 ${Object.values(errors).some(Boolean) ? "invalid" : ""}`}
        disabled={isBusy || isUploading}
      >
        {isBusy ? (
          <>
            <div className="fi-spinner" /> Processing Request...
          </>
        ) : isEditMode ? (
          "Save Changes to Database"
        ) : (
          "Publish New Listing"
        )}
      </button>
    </form>
  );
};

export default FormInput;
