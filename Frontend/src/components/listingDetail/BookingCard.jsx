import React, { useState, useContext, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  format,
  eachDayOfInterval,
  isBefore,
  startOfDay,
  addDays,
} from "date-fns";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

const BookingCard = ({ listing, refreshListing }) => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useContext(AuthContext);

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Store existing bookings to blur them out on the calendar
  const [existingBookings, setExistingBookings] = useState([]);

  // Fetch upcoming bookings for this specific listing
  const fetchBookings = async () => {
    try {
      // Note: Ensure your backend getAllBookings controller filters by 'property' if passed in req.query
      const res = await api.get(
        `/bookings?property=${listing._id}&status=confirmed`,
      );
      if (res.data?.success) {
        setExistingBookings(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching bookings", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [listing._id]);

  // Calculate disabled dates for the calendar (Blur out already booked dates)
  const disabledDates = useMemo(() => {
    let dates = [];
    existingBookings.forEach((booking) => {
      if (booking.checkIn && booking.checkOut) {
        const bookedDays = eachDayOfInterval({
          start: new Date(booking.checkIn),
          end: new Date(booking.checkOut),
        });
        dates = [...dates, ...bookedDays];
      }
    });
    return dates;
  }, [existingBookings]);

  // Pricing calculations
  const nights =
    startDate && endDate
      ? Math.max(0, Math.ceil((endDate - startDate) / 86400000))
      : 0;
  const totalPrice = nights * listing.price;
  const serviceFee = nights > 0 ? Math.round(totalPrice * 0.1) : 0; // Example 10% fee
  const finalPrice = totalPrice + serviceFee;

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setMessage({
        type: "error",
        text: "Please select both check-in and check-out dates.",
      });
      return;
    }
    if (!isAuthenticated) {
      setMessage({
        type: "error",
        text: "You must be logged in to reserve this property.",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const payload = {
        listingId: listing._id,
        userId: user._id,
        checkInDate: startDate,
        checkOutDate: endDate,
        guests,
      };

      const res = await api.post("/bookings", payload);

      if (res.data.success) {
        setMessage({ type: "success", text: "🎉 Reserved successfully!" });

        // INSTANT UI UPDATE: Add new booking to the disabled dates immediately
        setExistingBookings((prev) => [...prev, res.data.data]);
        setDateRange([null, null]); // Clear selection

        if (refreshListing) refreshListing();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message || "Those dates are no longer available.",
      });
      await fetchBookings(); // Resync with backend in case someone else booked it
    } finally {
      setLoading(false);
    }
  };

  if (authLoading)
    return <div className="animate-pulse bg-gray-200 h-96 rounded-2xl"></div>;

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 space-y-6 border border-gray-100 sticky top-24">
      {/* Header Pricing */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            ₹{listing.price}
          </span>
          <span className="text-gray-500 font-medium"> / night</span>
        </div>
      </div>

      {/* Booking Form UI */}
      <div className="border border-gray-300 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-300">
          <div className="w-full p-3 relative bg-white hover:bg-gray-50 transition">
            <label className="block text-[10px] font-bold uppercase text-gray-800">
              Check-in & Check-out
            </label>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              minDate={new Date()}
              excludeDates={disabledDates}
              placeholderText="Add dates"
              className="w-full mt-1 bg-transparent outline-none text-sm text-gray-700 cursor-pointer"
              dateFormat="MMM d, yyyy"
              withPortal
            />
          </div>
        </div>
        <div className="w-full p-3 relative bg-white hover:bg-gray-50 transition">
          <label className="block text-[10px] font-bold uppercase text-gray-800">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full mt-1 bg-transparent outline-none text-sm text-gray-700 cursor-pointer appearance-none"
          >
            {Array.from(
              { length: listing.maxGuests || 4 },
              (_, i) => i + 1,
            ).map((n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unavailable Dates / Next Open Tracker */}
      {existingBookings.length > 0 && (
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
          <p className="text-xs font-semibold text-orange-800 mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-9a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1z" />
            </svg>
            Already Booked Dates:
          </p>
          <ul className="text-xs text-orange-700 space-y-1 pl-5 list-disc">
            {existingBookings.map((b) => (
              <li key={b._id}>
                {format(new Date(b.checkIn), "MMM do")} —{" "}
                {format(new Date(b.checkOut), "MMM do")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reserve Button */}
      <button
        onClick={handleBooking}
        disabled={loading || !startDate || !endDate}
        className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 ${
          loading || !startDate || !endDate
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-rose-500/30"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Reserve"
        )}
      </button>

      {/* Status Messages */}
      {message.text && (
        <div
          className={`p-3 rounded-lg text-sm text-center font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}
        >
          {message.text}
        </div>
      )}

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500 mb-4">
            You won't be charged yet
          </p>
          <div className="flex justify-between text-gray-600 text-sm">
            <span className="underline">
              ₹{listing.price} x {nights} nights
            </span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span className="underline">Service fee</span>
            <span>₹{serviceFee}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-200">
            <span>Total</span>
            <span>₹{finalPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
