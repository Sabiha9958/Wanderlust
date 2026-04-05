import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  // Click outside handler for both dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean, professional link styles without extreme animations
  const linkBase =
    "px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors";
  const activeLink =
    "px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-full";

  const userAvatar =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=4f46e5&color=fff&rounded=true&bold=true`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Minimalist Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group focus:outline-none"
        >
          <div className="p-1.5 bg-indigo-600 rounded-lg">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
            WanderLust
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? activeLink : linkBase)}
          >
            Home
          </NavLink>
          <NavLink
            to="/listings"
            className={({ isActive }) => (isActive ? activeLink : linkBase)}
          >
            Explore
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/my-bookings"
                className={({ isActive }) => (isActive ? activeLink : linkBase)}
              >
                My Trips
              </NavLink>
              <NavLink
                to="/create-listing"
                className={({ isActive }) => (isActive ? activeLink : linkBase)}
              >
                List Property
              </NavLink>
            </>
          )}

          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 text-sm font-bold text-red-700 bg-red-50 rounded-full"
                  : "px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors"
              }
            >
              Admin Panel
            </NavLink>
          )}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 border border-gray-300 p-1 pl-3 rounded-full hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>
                <img
                  src={userAvatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover bg-gray-100"
                />
              </button>

              {/* Clean Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 mb-2">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/my-listings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  >
                    Manage Properties
                  </Link>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden mobile-menu-toggle p-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Flat & Clean Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full z-40"
        >
          <div className="px-4 pt-2 pb-6 space-y-1">
            {user && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            )}

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Home
            </Link>
            <Link
              to="/listings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Explore Listings
            </Link>

            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
                >
                  My Trips
                </Link>
                <Link
                  to="/create-listing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
                >
                  List Your Property
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
                >
                  Profile Settings
                </Link>

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-lg mt-2"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
