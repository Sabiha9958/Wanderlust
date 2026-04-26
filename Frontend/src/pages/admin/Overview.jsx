import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { initSocket } from "../../utils/socket";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

/* ---------------- UTIL ---------------- */

const formatCurrency = (n = 0) => `₹${Number(n).toLocaleString("en-IN")}`;

const isPaid = (b) => b?.paymentStatus === "paid" && b?.status !== "cancelled";

/* ---------------- MAIN ---------------- */

export default function Dashboard() {
  const { token } = useContext(AuthContext);

  const [data, setData] = useState({
    users: [],
    listings: [],
    bookings: [],
  });

  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ---------------- */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [u, l, b] = await Promise.all([
        api.get("/users"),
        api.get("/listings"),
        api.get("/bookings"),
      ]);

      setData({
        users: u?.data?.data || [],
        listings: l?.data?.data || [],
        bookings: b?.data?.data || [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!token) return;

    fetchData();

    const socket = initSocket(token);

    socket.on("dashboard:update", fetchData);

    return () => {
      socket.off("dashboard:update");
    };
  }, [token, fetchData]);

  /* ---------------- ANALYTICS ---------------- */

  const analytics = useMemo(() => {
    let revenue = 0;

    const revenueMap = {};
    const statusMap = {};
    const propertyMap = {};
    const userMap = {};

    data.bookings.forEach((b) => {
      const price = Number(b.totalPrice) || 0;
      const month = new Date(b.createdAt).toLocaleString("en-IN", {
        month: "short",
      });

      if (isPaid(b)) {
        revenue += price;
        revenueMap[month] = (revenueMap[month] || 0) + price;
      }

      statusMap[b.status] = (statusMap[b.status] || 0) + 1;

      const property = b.property?.title || "Unknown";
      propertyMap[property] = (propertyMap[property] || 0) + price;

      const user = b.user?.name || "User";
      userMap[user] = (userMap[user] || 0) + price;
    });

    return {
      revenue,
      revenueTrend: Object.entries(revenueMap).map(([m, v]) => ({
        month: m,
        revenue: v,
      })),
      statusData: Object.entries(statusMap).map(([k, v]) => ({
        name: k,
        value: v,
      })),
      topProperties: Object.entries(propertyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topUsers: Object.entries(userMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [data.bookings]);

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="p-8 text-gray-500 text-center">Loading dashboard...</div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Overview of your platform activity
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard title="Users" value={data.users.length} />
        <StatCard title="Listings" value={data.listings.length} />
        <StatCard title="Bookings" value={data.bookings.length} />
        <StatCard title="Revenue" value={formatCurrency(analytics.revenue)} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Revenue Trend">
          <LineChart data={analytics.revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="revenue" stroke="#4f46e5" />
          </LineChart>
        </ChartCard>

        <ChartCard title="Booking Status">
          <BarChart data={analytics.statusData}>
            <CartesianGrid />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ChartCard>
      </div>

      {/* TOP LISTS */}
      <div className="grid grid-cols-2 gap-6">
        <ListCard title="Top Properties" data={analytics.topProperties} />
        <ListCard title="Top Users" data={analytics.topUsers} />
      </div>
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

const StatCard = ({ title, value }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border">
    <h3 className="font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      {children}
    </ResponsiveContainer>
  </div>
);

const ListCard = ({ title, data }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border">
    <h3 className="font-semibold mb-3">{title}</h3>

    {data.length === 0 ? (
      <p className="text-gray-400 text-sm">No data available</p>
    ) : (
      data.map(([name, value], i) => (
        <div
          key={i}
          className="flex justify-between py-2 border-b last:border-none"
        >
          <span className="text-gray-700">{name}</span>
          <span className="font-medium">{formatCurrency(value)}</span>
        </div>
      ))
    )}
  </div>
);
