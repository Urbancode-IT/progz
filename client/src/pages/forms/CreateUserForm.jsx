import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

const CreateUserForm = () => {
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
        const response = await API.post("/users/register", values);
        navigate(-1, { state: { message: response.data.message } });
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
    
    <div className="min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border rounded-lg shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          New User Form
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below to register.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-300 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Full Name *
              </label>
              <input
                name="name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Email *
              </label>
              <input
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Password *
              </label>
              <input
                name="password"
                type="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Confirm Password *
              </label>
              <input
                name="confirmPassword"
                type="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">Phone</label>
              <input
                name="phone"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-600 mt-1">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 block mb-1">Role *</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="role"
                    value="instructor"
                    checked={formik.values.role === "instructor"}
                    onChange={formik.handleChange}
                    className="text-gray-600"
                  />
                  <span className="text-sm text-gray-700">Instructor</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formik.values.role === "student"}
                    onChange={formik.handleChange}
                    className="text-gray-600"
                  />
                  <span className="text-sm text-gray-700">Student</span>
                </label>
              </div>
              {formik.touched.role && formik.errors.role && (
                <p className="text-sm text-red-600 mt-1">
                  {formik.errors.role}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 block mb-1">
                Address
              </label>
              <textarea
                name="address"
                rows={3}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.address}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Education
              </label>
              <input
                name="education"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.education}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Profession
              </label>
              <input
                name="profession"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.profession}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 block mb-1">
                Experience
              </label>
              <textarea
                name="experience"
                rows={3}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.experience}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Create Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
     );
};

export default CreateUserForm;
