import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* PUBLIC PAGES */
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

/* USER PAGES */
import Profile from "./pages/user/Profile";
import BookingDetail from "./pages/user/BookingDetail";
import CreateListingPage from "./pages/user/CreateListingPage";
import MyListings from "./pages/user/MyListings";
import MyBookings from "./pages/user/MyBookings";

/* ADMIN PAGES */
import { AdminRoutes } from "./pages/admin/AdminRoutes";

/* SHARED */
import NotFound from "./pages/shared/NotFound";
import Unauthorized from "./pages/shared/Unauthorized";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-900">
          <Navbar />

          <main className="flex-1 w-full">
            <Routes>
              {/* ---------------- PUBLIC ROUTES ---------------- */}
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/help" element={<Help />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/community" element={<Community />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* ---------------- USER ROUTES ---------------- */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-detail/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-listing"
                element={
                  <ProtectedRoute>
                    <CreateListingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute>
                    <MyListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* ---------------- ADMIN ROUTES ---------------- */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminRoutes />
                  </ProtectedRoute>
                }
              />

              {/* ---------------- 404 ROUTE ---------------- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
