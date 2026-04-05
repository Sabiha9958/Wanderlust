import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
      {/* Icon */}
      <div className="bg-red-100 text-red-600 p-4 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-12 h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>

      {/* Text */}
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Access Denied</h1>
      <p className="text-lg text-gray-500 mb-8 max-w-md">
        You don’t have the required permissions to view this page. If you
        believe this is a mistake, please contact support.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
