import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    phone: Yup.string().matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
    address: Yup.string(),
    education: Yup.string(),
    profession: Yup.string(),
    experience: Yup.string(),
    role: Yup.string().required("Role is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      role: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      education: "",
      profession: "",
      experience: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError("");
      try {
        const response = await API.post("/newusers/new-user", values);
        // Show success alert
        Swal.fire({
          title: 'Registration Submitted!',
          text: 'You can access your account once the administrator approves your registration.',
          icon: 'success',
          confirmButtonColor: '#6366f1', // indigo-500
          confirmButtonText: 'OK',
          backdrop: `
            rgba(99, 102, 241, 0.1)
            url("/images/nyan-cat.gif")
            center top
            no-repeat
          `,
          customClass: {
            container: 'backdrop-blur-sm'
          }
        }).then(() => {
          navigate(-1, { state: { message: response.data.message } });
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to create user profile"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="relative max-w-3xl w-full">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20"></div>
        
        <div className="relative z-10 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              New User Registration
            </h2>
            <p className="text-gray-600 mt-2">
              Fill in the details below to create your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100/80 border border-red-300/80 text-red-700 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    name="name"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              {/* Role Field */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="flex space-x-6 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg p-2 shadow-sm">
                  <label className="flex items-center space-x-2 px-3 py-1.5 rounded">
                    <input
                      type="radio"
                      name="role"
                      value="instructor"
                      checked={formik.values.role === "instructor"}
                      onChange={formik.handleChange}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Instructor</span>
                  </label>
                  <label className="flex items-center space-x-2 px-3 py-1.5 rounded">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formik.values.role === "student"}
                      onChange={formik.handleChange}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Student</span>
                  </label>
                </div>
                {formik.touched.role && formik.errors.role && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.role}
                  </p>
                )}
              </div>

              {/* Address Field */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  rows={3}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                />
              </div>

              {/* Education Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  name="education"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.education}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                />
              </div>

              {/* Profession Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <input
                  name="profession"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.profession}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                />
              </div>

              {/* Experience Field */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <textarea
                  name="experience"
                  rows={3}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.experience}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/30">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-white/50 backdrop-blur-sm border border-white/30 text-sm text-gray-700 rounded-lg hover:bg-white/70 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-70 transition-all shadow-md flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Create Registration"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;