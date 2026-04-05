import api from "./axiosInstance";

export const fetchAuth = async () => {
  try {
    const { data } = await api.get("/auth/me");

    return data?.data || null;
  } catch (error) {
    console.error("Auth fetch failed:", error.response?.data || error);
    throw new Error("Unable to fetch authenticated user");
  }
};
