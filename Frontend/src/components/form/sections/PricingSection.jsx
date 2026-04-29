import React from "react";
import FormField from "../FormField";

const PricingSection = ({
  formData,
  handleInputChange,
  handleBlur,
  errors,
  touched,
  isBusy,
}) => (
  <section className="form-section border-l-4 border-indigo-500 pl-4">
    <h2 className="form-section-title">Pricing & Fees (₹)</h2>
    <p className="text-sm text-gray-500 mb-4">
      All pricing fields must be filled out to proceed.
    </p>
    <div className="form-grid-3">
      <FormField
        label="Base Price (per night)"
        name="price"
        value={formData.price}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors.price}
        touched={touched.price}
        type="number"
        min="100"
        step="100"
        required
        disabled={isBusy}
      />
      <FormField
        label="Cleaning Fee"
        name="cleaningFee"
        value={formData.cleaningFee}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors.cleaningFee}
        touched={touched.cleaningFee}
        type="number"
        min="0"
        step="50"
        required
        disabled={isBusy}
      />
      <FormField
        label="Service Fee"
        name="serviceFee"
        value={formData.serviceFee}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={errors.serviceFee}
        touched={touched.serviceFee}
        type="number"
        min="0"
        step="50"
        required
        disabled={isBusy}
      />
    </div>
  </section>
);

export default PricingSection;
