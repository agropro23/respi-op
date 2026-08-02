import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import SyringeCursor from './SyringeCursor'; // adjust path if needed
import useStore from '../utils/store';
import { Navigate, useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_CLIENT_BASE_URL;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  const {username, setUsername, removeUsername} = useStore();

  const save = async () => {
    await fetch(`${BASE_URL}/api/save/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowError(false);
    setError('');
    removeUsername();
    try {
        const response = await fetch(`${BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setUsername(email);
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        await save();
        // window.location.href = '/';
        navigate("/");
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
        setShowError(true);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      setShowError(true);
    }
  };

  return (
    <>
      <SyringeCursor />
      <div className="d-flex min-vh-100 justify-content-center align-items-center bg-light">
        <div className="d-flex min-vh-100 justify-content-center align-items-center bg-light">
          <div className="card shadow-lg p-4" style={{ maxWidth: '430px', width: '100%' }}>
            <div className="mb-4 text-center">
              <h4 className="fw-bold text-dark">Dr. Vipul's Allergy & Asthma Clinic</h4>
              <p className="mt-2 text-sm text-muted">Please log in to access your admin dashboard</p>
            </div>

            {showError && (
              <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setShowError(false)}></button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-dark font-normal">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-100 form-control"
                  placeholder="doctor@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark mt-3">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-100 form-control"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="btn btn-primary w-100 d-flex justify-content-center align-items-center mt-3"
                >
                  <Lock className="me-2" size={16} />
                  Sign in
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="small text-center text-muted">
                © {new Date().getFullYear()} Dr. Vipul's Allergy & Asthma Clinic All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;