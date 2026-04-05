import api from "./axiosInstance";

export const fetchUsers = async () => {
  try {
    const { data } = await api.get("/users", {
      headers: { "Cache-Control": "no-cache" },
    });

    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    throw new Error("Unable to fetch users. Please try again later.");
  }
};
