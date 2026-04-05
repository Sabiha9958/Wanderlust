import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

const Profile = () => {
  const {
    user,
    fetchUser,
    logout,
    loading: authLoading,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    title: "",
    department: "",
    location: "",
    bio: "",
    avatar: "",
  });

  // Load user data into form when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        title: user.title || "",
        department: user.department || "",
        location: user.location || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Use the specific /me endpoint designed for the logged-in user
      const response = await api.put(`/users/me`, formData);

      if (response.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        await fetchUser(); // Instantly update global app state
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      // Use the specific /me endpoint designed for the logged-in user
      await api.delete(`/users/me`);
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to delete account. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8 mt-10 text-center bg-gray-50 rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Not Logged In</h2>
        <p className="text-gray-500 mb-4">
          Please log in to view your profile.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const avatarUrl =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=4f46e5&color=fff&rounded=true&bold=true`;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 font-sans">
      {/* Header & Status Messages */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your personal information and preferences.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:shadow-sm transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Identity & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

            <img
              src={avatarUrl}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg relative z-10 bg-white"
            />

            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              {user.name}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {user.email}
            </p>

            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                {user.role}
              </span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
            <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-gray-500 text-sm mb-6">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full px-5 py-2.5 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            {isEditing ? (
              /* --- EDIT MODE FORM --- */
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ ...user }); // Reset to current user data
                    }}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              /* --- VIEW MODE --- */
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Personal Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Job Title
                    </p>
                    <p className="text-gray-900 font-medium">
                      {user.title || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Department
                    </p>
                    <p className="text-gray-900 font-medium">
                      {user.department || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Phone Number
                    </p>
                    <p className="text-gray-900 font-medium">
                      {user.phone || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Location
                    </p>
                    <p className="text-gray-900 font-medium">
                      {user.location || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Bio
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {user.bio || (
                        <span className="text-gray-400 italic">
                          No bio written yet.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
