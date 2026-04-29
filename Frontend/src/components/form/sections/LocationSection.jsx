import React from "react";
import FormField from "../FormField";

const LocationSection = ({
  formData,
  handleInputChange,
  handleBlur,
  errors,
  touched,
  isBusy,
}) => (
  <section className="form-section">
    <h2 className="form-section-title">Location</h2>
    <div className="form-grid-3">
      <FormField
        label="City"
        name="location.city"
        value={formData.location.city}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors["location.city"]}
        touched={touched["location.city"]}
        placeholder="e.g. New Delhi"
        required
        disabled={isBusy}
      />
      <FormField
        label="Country"
        name="location.country"
        value={formData.location.country}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors["location.country"]}
        touched={touched["location.country"]}
        placeholder="e.g. India"
        required
        disabled={isBusy}
      />
      <FormField
        label="Area/Neighborhood"
        name="location.area"
        value={formData.location.area}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="e.g. Connaught Place"
        disabled={isBusy}
      />
    </div>
  </section>
);

export default LocationSection;
