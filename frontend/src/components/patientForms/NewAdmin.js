import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import SyringeCursor from '../SyringeCursor';

const BASE_URL = process.env.REACT_APP_CLIENT_BASE_URL;

function NewAdmin() {
  const ADMIN_USERNAME = 'admin@test.com';
  const ADMIN_PASSWORD = 'adminop';

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAllSavedUsers = async () => {
    const response = await fetch(`${BASE_URL}/api/save/all-users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch saved users.');
    }

    setUsers(data.users || []);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    setError('');
    setShowError(false);

    if (adminEmail !== ADMIN_USERNAME || adminPassword !== ADMIN_PASSWORD) {
      setError('Invalid admin credentials.');
      setShowError(true);
      return;
    }

    try {
      setLoading(true);

      await getAllSavedUsers();

      setIsLoggedIn(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SyringeCursor />

      <div className="d-flex min-vh-100 justify-content-center align-items-center bg-light">
        <div className="card shadow-lg p-4" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="mb-4 text-center">
            <h4 className="fw-bold text-dark">New Admin Panel</h4>
            <p className="mt-2 text-sm text-muted">
              {/* UPDATED: Description label */}
              Page to view saved user
            </p>
          </div>

          {showError && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowError(false)}
              ></button>
            </div>
          )}

          {!isLoggedIn ? (
            <div>
              <div>
                <label htmlFor="adminEmail" className="block text-sm text-dark font-normal">
                  Admin Email
                </label>
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="mt-1 block w-100 form-control"
                  placeholder="admin@test.com"
                />
              </div>

              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-dark mt-3">
                  Admin Password
                </label>
                <input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="mt-1 block w-100 form-control"
                  placeholder="admin123"
                />
              </div>

              <button
                type="button"
                onClick={handleAdminLogin}
                disabled={loading}
                className="btn btn-primary w-100 d-flex justify-content-center align-items-center mt-3"
              >
                <Lock className="me-2" size={16} />
                {loading ? 'Loading...' : 'Admin Sign in'}
              </button>
            </div>
          ) : (
            <div>
              {/* UPDATED: Title label */}
              <h5 className="fw-bold mb-3">Saved Users</h5>

              {users.length === 0 ? (
                <p className="text-muted">No saved users found.</p>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      {/* ADDED: Phone number column header */}
                      <th>Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td>{user.username}</td>
                        {/* ADDED: Phone number column cell */}
                        <td>{user.password || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <button
                type="button"
                className="btn btn-secondary w-100 mt-3"
                onClick={() => {
                  setIsLoggedIn(false);
                  setAdminEmail('');
                  setAdminPassword('');
                  setUsers([]);
                }}
              >
                Logout
              </button>
            </div>
          )}

          <div className="mt-4">
            <p className="small text-center text-muted">
              © {new Date().getFullYear()} Dr. Vipul's Allergy & Asthma Clinic All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewAdmin;
