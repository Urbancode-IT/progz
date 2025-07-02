import React, { useEffect, useState } from 'react'; 
import API from '../../api/api';
import AdminDashboard from '../dashboards/AdminDashboard';
const PendingUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchPendingUsers = async () => {
    const res = await API.get('/newusers/pending');
    setUsers(res.data);
  };

  const approveUser = async (id) => {
    await API.post(`/newusers/approve/${id}`);
    fetchPendingUsers();
  };

  const declineUser = async (id) => {
    if (window.confirm('Are you sure you want to decline this user?')) {
      await API.delete(`/newusers/decline/${id}`);
      fetchPendingUsers();
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <AdminDashboard>
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Registrations</h2>
      {users.length === 0 ? (
        <p className="text-sm text-gray-600">No pending registrations.</p>
      ) : (
        <ul className="space-y-4">
          {users.map(user => (
            <li key={user._id} className="p-4 border border-gray-200 rounded flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{user.name} ({user.role})</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approveUser(user._id)}
                  className="px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => declineUser(user._id)}
                  className="px-3 py-1 bg-white border text-sm text-gray-700 rounded hover:bg-gray-100"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    </AdminDashboard>
  );
};

export default PendingUsers;
