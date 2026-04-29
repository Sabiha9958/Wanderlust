import React from "react";
import FormField from "../FormField";
import { PROPERTY_TYPES, CATEGORIES } from "../utils/formConstants";

const CoreDetails = ({
  formData,
  handleInputChange,
  handleBlur,
  errors,
  touched,
  isBusy,
}) => (
  <section className="form-section">
    <h2 className="form-section-title">Core Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <FormField
          label="Property Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.title}
          touched={touched.title}
          placeholder="e.g., Luxury 3BHK Penthouse with City Views"
          required
          disabled={isBusy}
        />
      </div>
      <FormField
        label="Property Type"
        name="propertyType"
        type="select"
        options={PROPERTY_TYPES}
        value={formData.propertyType}
        onChange={handleInputChange}
        disabled={isBusy}
      />
      <FormField
        label="Category"
        name="category"
        type="select"
        options={CATEGORIES}
        value={formData.category}
        onChange={handleInputChange}
        disabled={isBusy}
      />
    </div>
    <div className="mt-4">
      <FormField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors.description}
        touched={touched.description}
        type="textarea"
        rows={5}
        placeholder="Provide a detailed description of your property..."
        required
        disabled={isBusy}
      />
    </div>
  </section>
);

export default CoreDetails;
