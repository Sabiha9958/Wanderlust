import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api/axiosInstance";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from "recharts";

/* =========================
   HELPERS & CONSTANTS
========================= */
const formatCurrency = (n = 0) => `₹${n.toLocaleString("en-IN")}`;
const isPaid = (b) => b?.paymentStatus === "paid" && b?.status !== "cancelled";
const getMonthKey = (date) =>
  new Date(date).toLocaleString("default", { month: "short", year: "numeric" });

const STATUS_COLORS = {
  confirmed: "#3b82f6",
  pending: "#f59e0b",
  "checked-in": "#6366f1",
  completed: "#10b981",
  cancelled: "#ef4444",
};

/* =========================
   CUSTOM TOOLTIPS
========================= */
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl min-w-[120px]">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-lg font-bold text-indigo-600">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl min-w-[120px]">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-lg font-bold text-gray-900">
          {payload[0].value}{" "}
          <span className="text-sm font-medium text-gray-500">bookings</span>
        </p>
      </div>
    );
  }
  return null;
};

/* =========================
   CHART WRAPPERS (FIXED DIMENSIONS)
========================= */
const RevenueTrendChart = ({ data }) => (
  <div className="w-full h-[350px] bg-gray-50/50 rounded-xl p-4 flex items-center justify-center">
    {data?.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f3f4f6"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <RechartsTooltip
            content={<CustomLineTooltip />}
            cursor={{ stroke: "#e5e7eb", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{
              r: 6,
              fill: "#4f46e5",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="text-gray-400 text-sm text-center">
        No revenue data available
      </div>
    )}
  </div>
);

const BookingStatusChart = ({ data }) => (
  <div className="w-full h-[350px] bg-gray-50/50 rounded-xl p-4 flex items-center justify-center">
    {data?.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f3f4f6"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={10}
            tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <RechartsTooltip
            content={<CustomBarTooltip />}
            cursor={{ fill: "#f9fafb" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.name] || "#9ca3af"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="text-gray-400 text-sm text-center">
        No booking data available
      </div>
    )}
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */
const Overview = () => {
  const [data, setData] = useState({ users: 0, listings: 0, bookings: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, listingsRes, bookingsRes] = await Promise.all([
        api.get("/users"),
        api.get("/listings"),
        api.get("/bookings"),
      ]);

      setData({
        users: usersRes.data?.data?.length ?? 0,
        listings: listingsRes.data?.data?.length ?? 0,
        bookings: bookingsRes.data?.data ?? [],
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const analytics = useMemo(() => {
    const bookings = data.bookings || [];
    let paidRevenue = 0,
      pendingRevenue = 0,
      refundedRevenue = 0;
    const statusMap = {};
    const revenueByMonth = {};

    bookings.forEach((b) => {
      const price = Number(b?.totalPrice) || 0;
      if (isPaid(b)) {
        paidRevenue += price;
        const key = getMonthKey(b.createdAt);
        revenueByMonth[key] = (revenueByMonth[key] || 0) + price;
      } else if (b?.paymentStatus === "refunded") {
        refundedRevenue += price;
      } else if (b?.status !== "cancelled") {
        pendingRevenue += price;
      }
      const status = b?.status || "unknown";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const revenueTrend = Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({ month, revenue, date: new Date(month) }))
      .sort((a, b) => a.date - b.date)
      .map(({ month, revenue }) => ({ month, revenue }));

    const bookingsByStatus = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));

    const topMonth =
      [...revenueTrend].sort((a, b) => b.revenue - a.revenue)[0] || null;

    return {
      paidRevenue,
      pendingRevenue,
      refundedRevenue,
      bookingsByStatus,
      revenueTrend,
      topMonth,
    };
  }, [data.bookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-2 max-w-md">
            Welcome back. Here's what's happening with your platform today.
          </p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white/80 px-6 py-3 rounded-xl border border-gray-200 shadow-sm backdrop-blur-sm">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* PRIMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={data.users.toLocaleString()}
          icon="👥"
          bgClass="bg-blue-50"
        />
        <StatCard
          label="Active Properties"
          value={data.listings.toLocaleString()}
          icon="🏠"
          bgClass="bg-purple-50"
        />
        <StatCard
          label="Total Bookings"
          value={data.bookings.length.toLocaleString()}
          icon="📅"
          bgClass="bg-emerald-50"
        />
        <StatCard
          label="Net Revenue"
          value={formatCurrency(analytics.paidRevenue)}
          icon="💰"
          bgClass="bg-indigo-50"
          valueClass="text-indigo-600"
        />
      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MiniStatCard
          label="Earned (Paid)"
          value={formatCurrency(analytics.paidRevenue)}
          indicatorColor="bg-emerald-500"
        />
        <MiniStatCard
          label="Pipeline (Pending)"
          value={formatCurrency(analytics.pendingRevenue)}
          indicatorColor="bg-amber-500"
        />
        <MiniStatCard
          label="Lost (Refunded)"
          value={formatCurrency(analytics.refundedRevenue)}
          indicatorColor="bg-rose-500"
        />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card
          title="Revenue Growth"
          subtitle="Confirmed and paid bookings over time"
        >
          <RevenueTrendChart data={analytics.revenueTrend} />
        </Card>
        <Card
          title="Reservation Status"
          subtitle="Distribution of all current bookings"
        >
          <BookingStatusChart data={analytics.bookingsByStatus} />
        </Card>
      </div>

      {/* BUSINESS INSIGHTS */}
      <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Business Insights
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <InsightCard
            icon="📈"
            title="Top Performing Month"
            content={`Your highest revenue was ${analytics.topMonth?.month || "N/A"}, bringing in ${formatCurrency(analytics.topMonth?.revenue || 0)}`}
          />
          <InsightCard
            icon="⏳"
            title="Pipeline Potential"
            content={`You have ${formatCurrency(analytics.pendingRevenue)} in pending reservations. Follow up to secure this revenue.`}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================
   UI COMPONENTS (IMPROVED)
========================= */
const StatCard = ({
  label,
  value,
  icon,
  bgClass,
  valueClass = "text-gray-900",
}) => (
  <div className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
    <div
      className={`w-16 h-16 rounded-2xl flex items-center justify-center ${bgClass} mb-4 shadow-lg group-hover:scale-110 transition-transform`}
    >
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
      {label}
    </p>
    <p className={`text-3xl font-bold truncate ${valueClass}`}>{value}</p>
  </div>
);

const MiniStatCard = ({ label, value, indicatorColor }) => (
  <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
    <div
      className={`absolute left-0 top-0 bottom-0 w-1 ${indicatorColor} group-hover:w-2 transition-all`}
    ></div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">
      {label}
    </p>
    <p className="text-2xl font-bold text-gray-900 ml-4">{value}</p>
  </div>
);

const Card = ({ title, subtitle, children }) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/50 flex flex-col">
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const InsightCard = ({ icon, title, content }) => (
  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl hover:shadow-md transition-all">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
      <span className="text-2xl">{icon}</span>
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-lg mb-2">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{content}</p>
    </div>
  </div>
);

export default Overview;
