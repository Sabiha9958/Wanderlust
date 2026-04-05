import api from "./axiosInstance";

export const fetchListings = async () => {
  try {
    const { data } = await api.get("/listings", {
      headers: { "Cache-Control": "no-cache" },
    });

    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw new Error("Unable to fetch listings. Please try again later.");
  }
};
