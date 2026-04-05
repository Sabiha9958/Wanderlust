import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

/* ---------- REUSABLE UI ---------- */
const FieldRow = ({
  label,
  value,
  isEditing,
  inputType = "text",
  inputKey,
  form,
  onChange,
}) => (
  <div className="py-3 border-b border-gray-50 last:border-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
    <label className="text-sm font-medium text-gray-500 w-1/3">{label}</label>
    <div className="w-full sm:w-2/3">
      {isEditing ? (
        <input
          type={inputType}
          value={form[inputKey] || ""}
          onChange={(e) => onChange(inputKey, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
        />
      ) : (
        <p className="text-sm font-medium text-gray-900">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </p>
      )}
    </div>
  </div>
);

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/users/${id}`);
      setUser(data.data);
      setForm(data.data);
    } catch (err) {
      console.error("Fetch failed:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchUser();
  }, [id, fetchUser]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.put(`/users/${id}`, form);
      setUser(data.data);
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err);
      alert("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to soft delete this user? They will be marked as deleted but retained in the database.",
      )
    )
      return;
    try {
      await api.delete(`/users/${id}`);
      setUser((prev) => ({ ...prev, isDeleted: true }));
      setForm((prev) => ({ ...prev, isDeleted: true }));
    } catch (err) {
      console.error("Soft delete failed:", err.response?.data || err);
    }
  };

  const handleHardDelete = async () => {
    if (
      !window.confirm(
        "WARNING: This action is irreversible. Permanently delete this user?",
      )
    )
      return;
    try {
      await api.delete(`/users/${id}?hard=true`);
      navigate("/admin/users");
    } catch (err) {
      console.error("Hard delete failed:", err.response?.data || err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">User Not Found</h2>
        <button
          onClick={() => navigate("/admin/users")}
          className="text-indigo-600 hover:underline"
        >
          Return to Users
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 xl:p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER ACTIONS */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Users
          </button>

          <div className="flex gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setForm(user);
                    setEditing(false);
                  }}
                  className="px-5 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COL: PROFILE CARD */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
              {user.isDeleted && (
                <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[10px] font-bold py-1 uppercase tracking-widest">
                  Deleted Account
                </div>
              )}

              <div className="relative mt-4 mb-4">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=150`
                  }
                  alt={user.name}
                  className={`w-28 h-28 rounded-full object-cover border-4 shadow-sm ${user.isActive ? "border-green-50" : "border-gray-50"}`}
                />
                <div
                  className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${user.isActive ? "bg-green-500" : "bg-gray-400"}`}
                ></div>
              </div>

              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm font-medium text-indigo-600 mb-1">
                {user.title || "No Title"}
              </p>
              <p className="text-xs text-gray-500 mb-4">{user.email}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {user.role}
                </span>
                {user.isEmailVerified && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              <div className="w-full pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-left mb-2">
                  Biography
                </p>
                {editing ? (
                  <textarea
                    value={form.bio || ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    rows="3"
                    placeholder="User biography..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 text-left leading-relaxed">
                    {user.bio || (
                      <span className="italic text-gray-400">
                        No bio provided.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
                Account Meta
              </h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">User ID</span>
                <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {user._id}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last Login</span>
                <span className="font-medium text-gray-900">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COL: DETAILS FORM */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Personal Information
              </h3>

              <div className="space-y-2">
                <FieldRow
                  label="Full Name"
                  value={user.name}
                  isEditing={editing}
                  inputKey="name"
                  form={form}
                  onChange={handleChange}
                />
                <FieldRow
                  label="Email Address"
                  value={user.email}
                  isEditing={editing}
                  inputType="email"
                  inputKey="email"
                  form={form}
                  onChange={handleChange}
                />
                <FieldRow
                  label="Phone Number"
                  value={user.phone}
                  isEditing={editing}
                  inputType="tel"
                  inputKey="phone"
                  form={form}
                  onChange={handleChange}
                />
                <FieldRow
                  label="Job Title"
                  value={user.title}
                  isEditing={editing}
                  inputKey="title"
                  form={form}
                  onChange={handleChange}
                />
                <FieldRow
                  label="Department"
                  value={user.department}
                  isEditing={editing}
                  inputKey="department"
                  form={form}
                  onChange={handleChange}
                />
                <FieldRow
                  label="Location"
                  value={user.location}
                  isEditing={editing}
                  inputKey="location"
                  form={form}
                  onChange={handleChange}
                />

                {/* Advanced Settings Row */}
                <div className="py-3 mt-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                    System Privileges
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">
                        System Role
                      </label>
                      {editing ? (
                        <select
                          value={form.role}
                          onChange={(e) => handleChange("role", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium capitalize text-gray-900 bg-gray-50 p-2 rounded-lg">
                          {user.role}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">
                        Account Status
                      </label>
                      {editing ? (
                        <select
                          value={form.isActive}
                          onChange={(e) =>
                            handleChange("isActive", e.target.value === "true")
                          }
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="true">
                            Active (Allowed to login)
                          </option>
                          <option value="false">Inactive (Suspended)</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium capitalize text-gray-900 bg-gray-50 p-2 rounded-lg">
                          {user.isActive ? "Active" : "Inactive"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-red-800 mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-red-600 mb-6">
                These actions affect the user's data permanently or temporarily.
                Please proceed with caution.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSoftDelete}
                  disabled={user.isDeleted}
                  className="flex-1 py-2.5 px-4 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-100 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {user.isDeleted ? "Already Soft Deleted" : "Soft Delete User"}
                </button>
                <button
                  onClick={handleHardDelete}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-sm"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
