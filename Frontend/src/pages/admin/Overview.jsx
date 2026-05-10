import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  Building2,
  CalendarCheck2,
  IndianRupee,
  TrendingUp,
  Activity,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { initSocket } from "../../utils/socket";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const COLORS = ["#C08457", "#D4A373", "#B08968", "#E6B98A", "#9C6644"];

const formatCurrency = (value = 0) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

const isPaidBooking = (booking) =>
  booking?.paymentStatus === "paid" && booking?.status !== "cancelled";

/* -------------------------------------------------------------------------- */
/*                                  DASHBOARD                                 */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const { token } = useContext(AuthContext);

  const [dashboard, setDashboard] = useState({
    users: [],
    listings: [],
    bookings: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                                   FETCH                                  */
  /* ------------------------------------------------------------------------ */

  const fetchDashboard = useCallback(async () => {
    try {
      setRefreshing(true);

      const [usersRes, listingsRes, bookingsRes] = await Promise.all([
        api.get("/users"),
        api.get("/listings"),
        api.get("/bookings"),
      ]);

      setDashboard({
        users: usersRes?.data?.data || [],
        listings: listingsRes?.data?.data || [],
        bookings: bookingsRes?.data?.data || [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                                   SOCKET                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!token) return;

    fetchDashboard();

    const socket = initSocket(token);

    socket.on("dashboard:update", fetchDashboard);

    return () => {
      socket.off("dashboard:update", fetchDashboard);
    };
  }, [token, fetchDashboard]);

  /* ------------------------------------------------------------------------ */
  /*                                 ANALYTICS                                */
  /* ------------------------------------------------------------------------ */

  const analytics = useMemo(() => {
    let revenue = 0;

    const revenueMap = {};
    const statusMap = {};
    const propertyMap = {};
    const userMap = {};

    dashboard.bookings.forEach((booking) => {
      const amount = Number(booking?.totalPrice || 0);

      const month = new Date(booking.createdAt).toLocaleString("en-IN", {
        month: "short",
      });

      if (isPaidBooking(booking)) {
        revenue += amount;

        revenueMap[month] = (revenueMap[month] || 0) + amount;
      }

      statusMap[booking.status] = (statusMap[booking.status] || 0) + 1;

      const property = booking?.property?.title || "Unknown Property";

      propertyMap[property] = (propertyMap[property] || 0) + amount;

      const user = booking?.user?.name || "Unknown User";

      userMap[user] = (userMap[user] || 0) + amount;
    });

    return {
      revenue,

      revenueTrend: Object.entries(revenueMap).map(([month, revenue]) => ({
        month,
        revenue,
      })),

      statusData: Object.entries(statusMap).map(([name, value]) => ({
        name,
        value,
      })),

      topProperties: Object.entries(propertyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),

      topUsers: Object.entries(userMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [dashboard.bookings]);

  /* ------------------------------------------------------------------------ */
  /*                                   LOADING                                */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#7A6855]">
          <RefreshCw className="animate-spin" size={20} />

          <span className="font-medium text-lg">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                    UI                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#2B2B2B]">
      <div className="max-w-[1700px] mx-auto p-6 lg:p-10 space-y-8">
        {/* ------------------------------------------------------------------ */}
        {/* HEADER                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFE7DD] border border-[#E5D7C8] text-[#8B6B4D] text-sm font-medium mb-4">
              <Activity size={15} />
              Live Platform Analytics
            </div>

            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              Business Dashboard
            </h1>

            <p className="mt-3 text-[#7A6855] max-w-2xl leading-relaxed">
              Monitor revenue, bookings, customers, listings, and real-time
              platform growth with a modern warm analytics experience.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="
              h-14
              px-6
              rounded-2xl
              bg-[#9C6644]
              hover:bg-[#8A5A3D]
              text-white
              transition-all
              duration-300
              flex
              items-center
              gap-3
              shadow-lg
              shadow-[#9C6644]/20
              font-medium
            "
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STATS                                                              */}
        {/* ------------------------------------------------------------------ */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatsCard
            title="Users"
            value={dashboard.users.length}
            icon={<Users size={22} />}
            accent="#9C6644"
          />

          <StatsCard
            title="Listings"
            value={dashboard.listings.length}
            icon={<Building2 size={22} />}
            accent="#B08968"
          />

          <StatsCard
            title="Bookings"
            value={dashboard.bookings.length}
            icon={<CalendarCheck2 size={22} />}
            accent="#D4A373"
          />

          <StatsCard
            title="Revenue"
            value={formatCurrency(analytics.revenue)}
            icon={<IndianRupee size={22} />}
            accent="#C08457"
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* CHARTS                                                             */}
        {/* ------------------------------------------------------------------ */}

        <section className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
          {/* Revenue Chart */}

          <Card className="2xl:col-span-2">
            <SectionTitle
              title="Revenue Growth"
              subtitle="Monthly revenue analytics overview"
            />

            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={analytics.revenueTrend}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#C08457" stopOpacity={0.4} />

                    <stop offset="95%" stopColor="#C08457" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#EFE4D8" strokeDasharray="3 3" />

                <XAxis dataKey="month" stroke="#8B735B" />

                <YAxis stroke="#8B735B" />

                <Tooltip
                  contentStyle={{
                    borderRadius: "18px",
                    border: "1px solid #E5D7C8",
                    backgroundColor: "#FFFDF9",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C08457"
                  strokeWidth={4}
                  fill="url(#revenueGradient)"
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#9C6644"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "#9C6644",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart */}

          <Card>
            <SectionTitle
              title="Booking Status"
              subtitle="Current booking distribution"
            />

            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={115}
                  innerRadius={70}
                  paddingAngle={4}
                >
                  {analytics.statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* LISTS                                                              */}
        {/* ------------------------------------------------------------------ */}

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ModernListCard
            title="Top Properties"
            subtitle="Highest revenue generating properties"
            data={analytics.topProperties}
          />

          <ModernListCard
            title="Top Customers"
            subtitle="Users contributing highest revenue"
            data={analytics.topUsers}
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* BAR CHART                                                          */}
        {/* ------------------------------------------------------------------ */}

        <Card>
          <SectionTitle
            title="Booking Analytics"
            subtitle="Detailed booking activity overview"
          />

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.statusData}>
              <CartesianGrid stroke="#EFE4D8" strokeDasharray="3 3" />

              <XAxis dataKey="name" stroke="#8B735B" />

              <YAxis stroke="#8B735B" />

              <Tooltip
                contentStyle={{
                  borderRadius: "18px",
                  border: "1px solid #E5D7C8",
                  backgroundColor: "#FFFDF9",
                }}
              />

              <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#B08968" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              REUSABLE COMPONENTS                           */
/* -------------------------------------------------------------------------- */

function Card({ children, className = "" }) {
  return (
    <div
      className={`
        bg-[#FFFDF9]
        border
        border-[#E9DED2]
        rounded-[32px]
        p-6
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">{title}</h2>

      <p className="text-[#7A6855] mt-1 text-sm">{subtitle}</p>
    </div>
  );
}

function StatsCard({ title, value, icon, accent }) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-[#E9DED2]
        bg-[#FFFDF9]
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background: `linear-gradient(135deg, ${accent}, transparent)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[#8B735B] text-sm font-medium">{title}</p>

          <h3 className="text-4xl font-bold mt-4">{value}</h3>

          <div className="flex items-center gap-1 mt-4 text-[#9C6644] text-sm font-medium">
            <ArrowUpRight size={15} />
            Active Growth
          </div>
        </div>

        <div
          className="
            h-14
            w-14
            rounded-2xl
            flex
            items-center
            justify-center
            text-white
            shadow-lg
          "
          style={{
            background: accent,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ModernListCard({ title, subtitle, data }) {
  return (
    <Card>
      <SectionTitle title={title} subtitle={subtitle} />

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-[#8B735B] text-sm">No data available</div>
        ) : (
          data.map(([name, value], index) => (
            <div
              key={index}
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-[#EFE4D8]
                px-5
                py-4
                transition-all
                duration-300
                hover:bg-[#FAF6F1]
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    h-11
                    w-11
                    rounded-2xl
                    bg-[#F3E8DD]
                    text-[#9C6644]
                    font-semibold
                    flex
                    items-center
                    justify-center
                  "
                >
                  {index + 1}
                </div>

                <div>
                  <h4 className="font-semibold">{name}</h4>

                  <p className="text-sm text-[#8B735B]">Revenue Contribution</p>
                </div>
              </div>

              <div className="text-lg font-bold text-[#9C6644]">
                {formatCurrency(value)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
