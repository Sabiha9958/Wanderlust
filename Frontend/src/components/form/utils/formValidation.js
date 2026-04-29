export const validateField = (name, value, formData) => {
  switch (name) {
    case "title":
      return value.trim().length >= 10
        ? ""
        : "Title must be at least 10 characters";
    case "description":
      return value.trim().length >= 10
        ? ""
        : "Description must be at least 10 characters";
    case "price":
      if (value === "") return "Base price is required";
      const priceNum = Number(value);
      return priceNum >= 100 && priceNum <= 1000000
        ? ""
        : "Price must be between ₹100 and ₹1,000,000";
    case "cleaningFee":
    case "serviceFee":
      if (value === "") return "This fee is required (enter 0 if free)";
      return Number(value) >= 0 ? "" : "Fee cannot be negative";
    case "location.city":
      return value.trim().length >= 2 ? "" : "City name is required";
    case "location.country":
      return value.trim().length >= 2 ? "" : "Country is required";
    case "bedrooms":
    case "bathrooms":
      return Number(value) >= 1 && Number(value) <= 20
        ? ""
        : `At least 1 ${name.replace("s", "")} required`;
    case "maxGuests":
      return Number(value) >= 1 && Number(value) <= 50
        ? ""
        : "At least 1 guest, maximum 50";
    case "images":
      return formData.images.length >= 2
        ? ""
        : "At least two photos are required";
    default:
      return "";
  }
};
