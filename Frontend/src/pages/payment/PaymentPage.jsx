import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingId = location.state?.bookingId;

  const [status, setStatus] = useState("processing");
  // processing | success | failed

  useEffect(() => {
    if (!bookingId) {
      setStatus("failed");
      return;
    }

    let timer;

    const processPayment = () => {
      timer = setTimeout(async () => {
        try {
          const isSuccess = Math.random() > 0.2;

          if (!isSuccess) {
            setStatus("failed");
            return;
          }

          // ✅ success
          setStatus("success");

          await api.patch(`/bookings/${bookingId}/pay`, {
            paymentStatus: "paid",
            status: "confirmed",
          });

          setTimeout(() => {
            navigate("/my-bookings");
          }, 1500);
        } catch (err) {
          setStatus("failed");
        }
      }, 2500);
    };

    processPayment();

    return () => clearTimeout(timer);
  }, [bookingId, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 text-center w-[350px]">
        {status === "processing" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Processing Payment...
            </h2>
            <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-green-600 text-xl font-bold">
              Payment Successful ✅
            </h2>
            <p className="mt-2 text-sm text-gray-500">Redirecting...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <h2 className="text-red-500 text-xl font-bold">
              Payment Failed ❌
            </h2>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
