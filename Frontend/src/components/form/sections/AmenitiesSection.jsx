import React, { useMemo } from "react";
import { AMENITIES } from "../utils/formConstants";
import { formatAmenity } from "../utils/formHelpers";

const AmenitiesSection = ({ formData, toggleAmenity, isBusy }) => {
  const selectedAmenitiesText = useMemo(() => {
    const count = formData.amenities.length;
    return count > 0 ? `${count} selected` : "None selected";
  }, [formData.amenities.length]);

  return (
    <section className="form-section">
      <div className="form-section-header">
        <h2 className="form-section-title mb-0">Amenities</h2>
        <span className="form-badge">{selectedAmenitiesText}</span>
      </div>
      <div className="form-amenities-grid">
        {AMENITIES.map((amenity) => {
          const isSelected = formData.amenities.includes(amenity);
          return (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={`form-amenity-chip ${isSelected ? "selected" : ""}`}
              disabled={isBusy}
              aria-pressed={isSelected}
            >
              {formatAmenity(amenity)}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default AmenitiesSection;
