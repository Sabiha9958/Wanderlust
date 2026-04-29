import React from "react";
import FormField from "../FormField";

const CapacitySection = ({
  formData,
  handleInputChange,
  handleBlur,
  errors,
  touched,
  isBusy,
}) => (
  <section className="form-section">
    <h2 className="form-section-title">Capacity & Rooms</h2>
    <div className="form-grid-3">
      <FormField
        label="Max Guests"
        name="maxGuests"
        value={formData.maxGuests}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors.maxGuests}
        touched={touched.maxGuests}
        type="number"
        min="1"
        max="50"
        required
        disabled={isBusy}
      />
      <FormField
        label="Bedrooms"
        name="bedrooms"
        value={formData.bedrooms}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors.bedrooms}
        touched={touched.bedrooms}
        type="number"
        min="1"
        max="20"
        required
        disabled={isBusy}
      />
      <FormField
        label="Bathrooms"
        name="bathrooms"
        value={formData.bathrooms}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors.bathrooms}
        touched={touched.bathrooms}
        type="number"
        min="1"
        max="20"
        required
        disabled={isBusy}
      />
    </div>
  </section>
);

export default CapacitySection;
