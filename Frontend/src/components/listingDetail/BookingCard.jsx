import React, { useState, useEffect, useMemo, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfDay } from "date-fns";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BookingCard = ({ listing }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [range, setRange] = useState([null, null]);
  const [start, end] = range;

  const [guests, setGuests] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH BOOKINGS ---------------- */
  useEffect(() => {
    if (!listing?._id) return;

    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings");

        const filtered = (res.data?.data || []).filter(
          (b) => b.property === listing._id,
        );

        setBookings(filtered);
      } catch {
        setBookings([]);
      }
    };

    fetchBookings();
  }, [listing?._id]);

  /* ---------------- BOOKED DATES ---------------- */
  const bookedDates = useMemo(() => {
    return bookings.map((b) => ({
      start: startOfDay(new Date(b.checkIn)),
      end: startOfDay(new Date(b.checkOut)),
    }));
  }, [bookings]);

  const isRangeAvailable = (startDate, endDate) => {
    return !bookedDates.some(({ start, end }) => {
      return startDate <= end && endDate >= start;
    });
  };

  const isDateDisabled = (date) => {
    const d = startOfDay(date);

    return bookedDates.some(({ start, end }) => d >= start && d <= end);
  };

  const handleRangeChange = (dates) => {
    const [startDate, endDate] = dates;

    if (startDate && endDate && !isRangeAvailable(startDate, endDate)) {
      setRange([null, null]);
      return;
    }

    setRange(dates);
  };

  const nights = start && end ? Math.ceil((end - start) / 86400000) : 0;
  const total = nights * listing.price;

  /* ---------------- BOOK → REDIRECT TO PAYMENT ---------------- */
  const handleBooking = async () => {
    if (!start || !end || !isAuthenticated) return;

    if (!isRangeAvailable(start, end)) return;

    try {
      setLoading(true);

      // 🔥 STEP 1: create PENDING booking
      const res = await api.post("/bookings", {
        property: listing._id,
        checkIn: start.toISOString(),
        checkOut: end.toISOString(),
        guests,
        status: "pending", // important
        paymentStatus: "pending",
      });

      if (res.data.success) {
        const booking = res.data.data;

        // 🔥 STEP 2: redirect to payment page
        navigate("/payment", {
          state: {
            bookingId: booking._id,
            amount: total,
          },
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-lg sticky top-24 space-y-5">
      <h2 className="text-xl font-semibold">
        ₹{listing.price} <span className="text-sm text-gray-500">/ night</span>
      </h2>

      <DatePicker
        selectsRange
        startDate={start}
        endDate={end}
        onChange={handleRangeChange}
        filterDate={(date) => !isDateDisabled(date)}
        minDate={new Date()}
        className="w-full border p-2 rounded"
        placeholderText="Select dates"
      />

      <select
        value={guests}
        onChange={(e) => setGuests(+e.target.value)}
        className="w-full border p-2 rounded"
      >
        {Array.from({ length: listing.maxGuests || 4 }, (_, i) => i + 1).map(
          (n) => (
            <option key={n} value={n}>
              {n} guest{n > 1 && "s"}
            </option>
          ),
        )}
      </select>

      <button
        onClick={handleBooking}
        disabled={!start || !end || loading}
        className="w-full bg-black text-white py-2 rounded"
      >
        {loading ? "Redirecting..." : "Reserve"}
      </button>

      {nights > 0 && (
        <div className="text-sm border-t pt-3">
          <div className="flex justify-between">
            <span>
              ₹{listing.price} × {nights}
            </span>
            <span>₹{total}</span>
          </div>

          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
