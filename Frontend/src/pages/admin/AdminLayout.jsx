import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

/* =========================
   NAV CONFIG
========================= */

const NAV_ITEMS = [
  { label: "Overview", path: "/admin" },
  { label: "Users", path: "/admin/users" },
  { label: "Listings", path: "/admin/listings" },
  { label: "Bookings", path: "/admin/bookings" },
];

/* =========================
   COMPONENT
========================= */

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* =========================
         SIDEBAR (DESKTOP)
      ========================= */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col">
        <SidebarHeader />
        <SidebarNav />
      </aside>

      {/* =========================
         MOBILE SIDEBAR
      ========================= */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          <aside className="relative w-64 bg-white h-full shadow-lg">
            <SidebarHeader />
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* =========================
         MAIN CONTENT
      ========================= */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between md:justify-end">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-gray-600"
          >
            ☰
          </button>

          <div className="text-sm text-gray-500">Admin Panel</div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/* =========================
   SIDEBAR PARTS
========================= */

const SidebarHeader = () => (
  <div className="p-6 border-b font-semibold text-lg">Admin Dashboard</div>
);

const SidebarNav = ({ onNavigate }) => (
  <nav className="flex flex-col p-3 gap-2">
    {NAV_ITEMS.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/admin"}
        onClick={onNavigate}
        className={({ isActive }) =>
          `px-4 py-2 rounded-xl text-sm transition ${
            isActive
              ? "bg-indigo-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        {item.label}
      </NavLink>
    ))}
  </nav>
);

export default AdminLayout;
