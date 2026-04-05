import api from "./axiosInstance";

export const fetchBookings = async () => {
  try {
    const { data } = await api.get("/bookings", {
      headers: { "Cache-Control": "no-cache" },
    });

    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    throw new Error("Unable to fetch bookings. Please try again later.");
  }
};
