import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.scss';

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleResetPassword = (userId) => {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
      axios.post('/api/user/reset-password', { userId, newPassword })
        .then(response => {
          alert('Password reset successfully');
        })
        .catch(error => {
          console.error('Error resetting password:', error);
          alert('Failed to reset password');
        });
    }
  };

  return (
    <div className="AdminPage">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Legal Name</th>
            <th>Birthday</th>
            <th>Credits</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.legal_name}</td>
              <td>{user.birthday}</td>
              <td>{user.credits}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
                <button onClick={() => handleResetPassword(user.id)}>Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;