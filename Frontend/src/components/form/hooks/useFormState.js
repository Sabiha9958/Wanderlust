import { useState, useCallback, useEffect } from "react";
import {
  createInitialFormState,
  transformListingToFormData,
} from "../utils/formHelpers";
import { validateField } from "../utils/formValidation";

export const useFormState = (initialData, isEditMode) => {
  const [formData, setFormData] = useState(createInitialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormData(transformListingToFormData(initialData));
    } else {
      setFormData(createInitialFormState());
    }
    setErrors({});
    setTouched({});
    setFormError("");
  }, [initialData, isEditMode]);

  const validateSingleField = useCallback((name, value, currentFormData) => {
    const error = validateField(name, value, currentFormData);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        let newData = { ...prev };
        if (name.startsWith("location.")) {
          const locKey = name.split(".")[1];
          newData.location = { ...newData.location, [locKey]: value };
        } else {
          newData[name] = value;
        }

        if (touched[name]) validateSingleField(name, value, newData);
        return newData;
      });
    },
    [touched, validateSingleField],
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateSingleField(name, value, formData);
    },
    [formData, validateSingleField],
  );

  const toggleAmenity = useCallback((amenity) => {
    setFormData((prev) => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const fieldsToValidate = [
      "title",
      "description",
      "price",
      "cleaningFee",
      "serviceFee",
      "location.city",
      "location.country",
      "bedrooms",
      "bathrooms",
      "maxGuests",
      "images",
    ];

    fieldsToValidate.forEach((field) => {
      let value = field.startsWith("location.")
        ? formData.location[field.split(".")[1]]
        : field === "images"
          ? formData.images
          : formData[field];
      newErrors[field] = validateField(field, value, formData);
    });

    setErrors(newErrors);
    setTouched(Object.fromEntries(fieldsToValidate.map((f) => [f, true])));
    return Object.values(newErrors).every((error) => !error);
  }, [formData]);

  return {
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
  };
};
