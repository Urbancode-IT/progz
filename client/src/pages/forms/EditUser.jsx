import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AdminDashboard from '../dashboards/AdminDashboard';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      address: '',
      education: '',
      profession: '',
      experience: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits'),
      password: Yup.string().min(6, 'Password must be at least 6 characters'),
    }),
    onSubmit: async (values) => {
      try {
        await API.put(`/users/${id}`, values);
        navigate(-1);
      } catch (err) {
        setError('Failed to update user');
      }
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/users/edit/${id}`);
        formik.setValues(data);
      } catch (err) {
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <AdminDashboard><div className="p-6">Loading...</div></AdminDashboard>;

  return (
    <AdminDashboard>
      <div className="max-w-2xl mx-auto bg-white p-6 border rounded shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit User</h2>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {['name', 'email', 'phone','password', 'address', 'education', 'profession', 'experience'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                name={field}
                type="text"
                value={formik.values[field]}
                onChange={formik.handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {formik.touched[field] && formik.errors[field] && (
                <p className="text-sm text-red-600">{formik.errors[field]}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white rounded text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </AdminDashboard>
  );
};

export default EditUser;
