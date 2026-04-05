const Help = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-600">Help Center</h1>
      <p className="mt-3 text-gray-700">
        Find answers to common questions and get support for your bookings,
        listings, and account.
      </p>
      <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
        <li>Managing your bookings</li>
        <li>Updating your profile</li>
        <li>Payment and refunds</li>
      </ul>
    </div>
  );
};

export default Help;
