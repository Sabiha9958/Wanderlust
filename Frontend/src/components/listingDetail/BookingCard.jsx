import React, { useState, useEffect, useMemo, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfDay, isBefore, isAfter, eachDayOfInterval } from "date-fns";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

const BookingCard = ({ listing }) => {
  const { isAuthenticated } = useContext(AuthContext);

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
        const res = await api.get(
          `/bookings?property=${listing._id}&status=confirmed`,
        );

        setBookings(res.data?.data || []);
      } catch {
        setBookings([]);
      }
    };

    fetchBookings();
  }, [listing._id]);

  /* ---------------- BOOKED INTERVALS ---------------- */
  const bookedIntervals = useMemo(() => {
    return bookings.map((b) => ({
      start: startOfDay(new Date(b.checkIn)),
      end: startOfDay(new Date(b.checkOut)),
    }));
  }, [bookings]);

  /* ---------------- DISABLED DAYS (FOR UI) ---------------- */
  const disabledDates = useMemo(() => {
    return bookedIntervals.flatMap((interval) =>
      eachDayOfInterval({
        start: interval.start,
        end: interval.end,
      }),
    );
  }, [bookedIntervals]);

  /* ---------------- CHECK RANGE OVERLAP ---------------- */
  const isRangeAvailable = (startDate, endDate) => {
    return !bookedIntervals.some(({ start, end }) => {
      return startDate < end && endDate > start;
    });
  };

  /* ---------------- DATE FILTER ---------------- */
  const isDateSelectable = (date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return false;

    return !disabledDates.some(
      (d) => startOfDay(d).getTime() === startOfDay(date).getTime(),
    );
  };

  /* ---------------- HANDLE RANGE CHANGE ---------------- */
  const handleRangeChange = (dates) => {
    const [startDate, endDate] = dates;

    if (startDate && endDate) {
      const nights = Math.ceil((endDate - startDate) / 86400000);

      if (nights < 1) {
        setRange([null, null]);
        return;
      }

      if (!isRangeAvailable(startDate, endDate)) {
        setRange([null, null]);
        return;
      }
    }

    setRange(dates);
  };

  /* ---------------- PRICE ---------------- */
  const nights = start && end ? Math.ceil((end - start) / 86400000) : 0;

  const total = nights * listing.price;

  /* ---------------- BOOK ---------------- */
  const handleBooking = async () => {
    if (!start || !end || !isAuthenticated) return;

    if (!isRangeAvailable(start, end)) return;

    try {
      setLoading(true);

      const res = await api.post("/bookings", {
        property: listing._id,
        checkIn: start.toISOString(),
        checkOut: end.toISOString(),
        guests,
      });

      if (res.data.success) {
        setBookings((prev) => [...prev, res.data.data]);
        setRange([null, null]);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setRange([null, null]); // conflict fallback
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CUSTOM DAY STYLE (BLUR BOOKED) ---------------- */
  const dayClassName = (date) => {
    const isBooked = disabledDates.some(
      (d) => startOfDay(d).getTime() === startOfDay(date).getTime(),
    );

    return isBooked ? "opacity-40 pointer-events-none line-through" : "";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-lg sticky top-24 space-y-5">
      <h2 className="text-xl font-semibold">
        ₹{listing.price}
        <span className="text-sm text-gray-500"> / night</span>
      </h2>

      <div className="border rounded-xl overflow-hidden">
        <div className="p-3">
          <label className="text-xs font-semibold text-gray-600">
            Select Dates
          </label>

          <DatePicker
            selectsRange
            startDate={start}
            endDate={end}
            onChange={handleRangeChange}
            filterDate={isDateSelectable}
            dayClassName={dayClassName} // ✅ blur booked dates
            minDate={new Date()}
            className="w-full mt-2 text-sm outline-none"
            placeholderText="Check-in → Check-out"
            dateFormat="MMM d, yyyy"
          />
        </div>

        <div className="p-3 border-t">
          <label className="text-xs font-semibold text-gray-600">Guests</label>

          <select
            value={guests}
            onChange={(e) => setGuests(+e.target.value)}
            className="w-full mt-2 text-sm outline-none"
          >
            {Array.from(
              { length: listing.maxGuests || 4 },
              (_, i) => i + 1,
            ).map((n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 && "s"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleBooking}
        disabled={!start || !end || nights < 1 || loading}
        className={`w-full py-3 rounded-xl text-white ${
          loading || !start || !end
            ? "bg-gray-300"
            : "bg-black hover:bg-gray-900"
        }`}
      >
        {loading ? "Processing..." : "Reserve"}
      </button>

      {nights > 0 && (
        <div className="border-t pt-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>
              ₹{listing.price} × {nights} nights
            </span>
            <span>₹{total}</span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
