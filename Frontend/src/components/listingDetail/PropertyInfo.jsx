const PropertyInfo = ({ listing }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow grid grid-cols-2 md:grid-cols-3 gap-4">
      <div>🏠 {listing.bedrooms} Bedrooms</div>
      <div>🛁 {listing.bathrooms} Bathrooms</div>
      <div>👥 {listing.maxGuests} Guests</div>
    </div>
  );
};

export default PropertyInfo;
