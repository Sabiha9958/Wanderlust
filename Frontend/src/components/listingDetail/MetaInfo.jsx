const MetaInfo = ({ listing }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-2 text-sm text-gray-600">
      <p>
        <strong>Location:</strong> {listing.location.city},{" "}
        {listing.location.country}
      </p>
      <p>
        <strong>Host:</strong> {listing.hostName}
      </p>
      <p>
        <strong>Created:</strong>{" "}
        {new Date(listing.createdAt).toLocaleDateString()}
      </p>
      <p>
        <strong>Updated:</strong>{" "}
        {new Date(listing.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default MetaInfo;
