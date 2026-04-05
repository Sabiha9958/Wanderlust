import { useEffect, useState, useCallback } from "react";
import { fetchListings } from "../api/listingApi";

export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState("loading");

  const loadListings = useCallback(async () => {
    try {
      setStatus("loading");
      const data = await fetchListings();
      setListings(data || []);
      setStatus("success");
    } catch (err) {
      console.error("Listings fetch error:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return { listings, status, reload: loadListings };
};
