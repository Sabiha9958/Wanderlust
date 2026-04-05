const calculateNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const calculateTotalPrice = ({ price, checkIn, checkOut, guests = 1 }) => {
  const nights = calculateNights(checkIn, checkOut);

  // extendable: pricing rules
  const guestMultiplier = guests > 2 ? 1 + (guests - 2) * 0.1 : 1;

  return Math.round(nights * price * guestMultiplier);
};

module.exports = {
  calculateNights,
  calculateTotalPrice,
};
