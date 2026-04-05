import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout & Dashboard
import AdminLayout from "./AdminLayout";
import Overview from "./Overview";

// Users
import AdminUsers from "./AdminUsers";
import AdminUserDetail from "./AdminUserDetail";

// Listings
import AdminListings from "./AdminListings";
import AdminListingDetail from "./AdminListingDetail";

// Bookings
import AdminBookings from "./AdminBookings";
import AdminBookingDetail from "./AdminBookingDetail";

export const AdminRoutes = () => {
  return (
    <Routes>
      {/* The parent Route acts as a wrapper. 
        AdminLayout will render on screen, and its <Outlet /> will render the nested child routes.
      */}
      <Route element={<AdminLayout />}>
        {/* Default route when someone goes to /admin */}
        <Route index element={<Overview />} />

        {/* User Routes */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />

        {/* Listing Routes */}
        <Route path="listings" element={<AdminListings />} />
        <Route path="listings/:id" element={<AdminListingDetail />} />

        {/* Booking Routes */}
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="bookings/:id" element={<AdminBookingDetail />} />
      </Route>
    </Routes>
  );
};
