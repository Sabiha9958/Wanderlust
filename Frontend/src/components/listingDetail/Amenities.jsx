const Amenities = ({ amenities = [], description }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Amenities;
