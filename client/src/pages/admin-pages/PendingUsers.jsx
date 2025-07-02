import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import AdminDashboard from '../dashboards/AdminDashboard';
import { FiUserCheck, FiUserX, FiClock, FiMail, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/newusers/pending');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id) => {
    try {
      setProcessing(id);
      await API.post(`/newusers/approve/${id}`);
      toast.success('User approved successfully');
      fetchPendingUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    } finally {
      setProcessing(null);
    }
  };

  const declineUser = async (id) => {
    if (window.confirm('Are you sure you want to decline this user?')) {
      try {
        setProcessing(id);
        await API.delete(`/newusers/decline/${id}`);
        toast.success('User declined successfully');
        fetchPendingUsers();
      } catch (error) {
        toast.error('Failed to decline user');
      } finally {
        setProcessing(null);
      }
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <AdminDashboard>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <FiClock className="text-blue-500 text-2xl mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800">Pending Registrations</h2>
          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {users.length} pending
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FiUser className="mx-auto text-3xl text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No pending registrations</p>
            <p className="text-sm text-gray-500 mt-1">All caught up! Check back later for new requests.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                        <FiUser className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 flex items-center">
                          {user.name}
                          <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                            {user.role}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <FiMail className="mr-1.5" size={14} />
                          {user.email}
                        </p>
                        {user.createdAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Requested on: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveUser(user._id)}
                        disabled={processing === user._id}
                        className={`px-4 py-2 rounded-md flex items-center ${processing === user._id ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
                      >
                        {processing === user._id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing
                          </>
                        ) : (
                          <>
                            <FiUserCheck className="mr-1.5" size={16} />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => declineUser(user._id)}
                        disabled={processing === user._id}
                        className={`px-4 py-2 rounded-md flex items-center border ${processing === user._id ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
                      >
                        <FiUserX className="mr-1.5" size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};

export default PendingUsers;