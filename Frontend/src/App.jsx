import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* Public Pages */
import Home from "./pages/public/Home";
import Listings from "./pages/public/PublicListings";
import ListingDetail from "./pages/public/ListingDetail";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Help from "./pages/public/Help";
import Safety from "./pages/public/Safety";
import About from "./pages/public/About";
import Careers from "./pages/public/Careers";
import Community from "./pages/public/Community";

/* User Pages */
import Profile from "./pages/user/Profile";
import BookingDetail from "./pages/user/BookingDetail";
import CreateListingPage from "./pages/user/CreateListingPage";
import MyListings from "./pages/user/MyListings";
import MyBookings from "./pages/user/MyBookings";

/* Payment */
import PaymentPage from "./pages/payment/PaymentPage";

/* Admin */
import { AdminRoutes } from "./pages/admin/AdminRoutes";

/* Shared */
import NotFound from "./pages/shared/NotFound";
import Unauthorized from "./pages/shared/Unauthorized";

/* ---------------- WRAPPERS ---------------- */

const Private = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

const AdminOnly = ({ children }) => (
  <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

/* ---------------- ROUTE CONFIG ---------------- */

const routes = [
  /* Public */
  { path: "/", element: <Home />, type: "fade" },
  { path: "/listings", element: <Listings />, type: "slideUp" },
  { path: "/listing/:id", element: <ListingDetail />, type: "slideLeft" },
  { path: "/login", element: <Login />, type: "scale" },
  { path: "/register", element: <Register />, type: "rotate" },

  { path: "/help", element: <Help />, type: "fade" },
  { path: "/safety", element: <Safety />, type: "fade" },
  { path: "/about", element: <About />, type: "fade" },
  { path: "/careers", element: <Careers />, type: "fade" },
  { path: "/community", element: <Community />, type: "fade" },

  { path: "/unauthorized", element: <Unauthorized />, type: "fade" },

  /* User */
  {
    path: "/profile",
    element: <Profile />,
    private: true,
    type: "slideUp",
  },
  {
    path: "/booking/:id",
    element: <BookingDetail />,
    private: true,
    type: "slideLeft",
  },
  {
    path: "/create-listing",
    element: <CreateListingPage />,
    private: true,
    type: "scale",
  },
  {
    path: "/my-listings",
    element: <MyListings />,
    private: true,
    type: "slideUp",
  },
  {
    path: "/my-bookings",
    element: <MyBookings />,
    private: true,
    type: "slideUp",
  },

  /* Payment */
  {
    path: "/payment",
    element: <PaymentPage />,
    private: true,
    type: "scale",
  },

  /* Admin */
  {
    path: "/admin/*",
    element: <AdminRoutes />,
    admin: true,
    type: "slideLeft",
  },
];

/* ---------------- APP CONTENT ---------------- */

function AppContent() {
  const location = useLocation();

  const renderRoute = (route) => {
    let element = (
      <PageTransition type={route.type}>{route.element}</PageTransition>
    );

    if (route.private) {
      element = <Private>{element}</Private>;
    }

    if (route.admin) {
      element = <AdminOnly>{element}</AdminOnly>;
    }

    return <Route key={route.path} path={route.path} element={element} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900">
      <Navbar />

      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {routes.map(renderRoute)}

            {/* 404 */}
            <Route
              path="*"
              element={
                <PageTransition type="fade">
                  <NotFound />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

/* ---------------- ROOT ---------------- */

export default function AppWrapper() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
