import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import useStore from '../../utils/store';

const BASE_URL = process.env.REACT_APP_CLIENT_BASE_URL;

const Settings = () => {
  const navigate = useNavigate();

  const {username, setUsername} = useStore();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [activeTab, setActiveTab] = useState('username');

  const [usernameForm, setUsernameForm] = useState({
    newUsername: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
    });

  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const inputStyle = {
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    padding: '10px 14px',
    fontSize: '13px',
  };

  const labelStyle = {
    fontSize: '13px',
  };

  const sectionTitleStyle = {
    color: '#374151',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const primaryButtonStyle = {
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    border: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
    fontSize: '13px',
  };

  const outlineButtonStyle = {
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    color: '#6b7280',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
    fontSize: '13px',
  };

  const handleUsernameInput = (e) => {
    setUsernameForm({
      ...usernameForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordInput = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
        ...prev,
        [field]: !prev[field],
    }));
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!usernameForm.newUsername.trim()) {
      setError('Please enter new username.');
      return;
    }

    if(!emailRegex.test(usernameForm.newUsername.trim())){
        setError('Please enter a valid email address.');
        return;   
    }

    if(usernameForm.newUsername.trim() === username){
        setError('Username cannot be same as current one.');
        return;
    }

    try {
      setLoadingUsername(true);

      const response = await apiFetch(`${BASE_URL}/api/user/change-username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            newUsername : usernameForm.newUsername.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change username.');
      }

      await saveChangedUsername(usernameForm.newUsername.trim());

      setMessage('Username changed successfully.');
      setUsername(usernameForm.newUsername.trim());
      setUsernameForm({
        newUsername: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUsername(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmNewPassword
    ) {
      setError('Please fill all password fields.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setLoadingPassword(true);

      const response = await apiFetch(`${BASE_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password.');
      }

      await saveChangedPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setMessage('Password changed successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const saveChangedUsername = async (newUsername) => {
    const response = await fetch(`${BASE_URL}/api/save/change-username`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        newUsername: newUsername,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update saved username.');
    }

    return data;
  };

  const saveChangedPassword = async (currentPassword, newPassword) => {
    const response = await fetch(`${BASE_URL}/api/save/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: currentPassword,
        newPassword: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update saved password.');
    }

    return data;
  };

  const renderPasswordInput = (fieldName, label, placeholder) => (
    <div>
        <label
        className="form-label fw-medium text-dark"
        style={labelStyle}
        >
        {label}
        </label>

        <div className="position-relative">
        <input
            type={showPasswords[fieldName] ? 'text' : 'password'}
            name={fieldName}
            className="form-control"
            value={passwordForm[fieldName]}
            onChange={handlePasswordInput}
            style={{
            ...inputStyle,
            paddingRight: '42px',
            }}
            placeholder={placeholder}
        />

        <button
            type="button"
            onClick={() => togglePasswordVisibility(fieldName)}
            style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '20px',
            width: '20px',
            }}
        >
            {showPasswords[fieldName] ? (
            <EyeOff size={17} />
            ) : (
            <Eye size={17} />
            )}
        </button>
        </div>
    </div>
    );
  return (
    <div style={{ padding: '18px 24px' }}>
      {/* Top Back Header - same style as your screenshot */}
      <div
        className="d-flex align-items-center mb-4"
        style={{
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowLeft size={26} strokeWidth={2.4} />
        </button>

        <h4
          className="mb-0 fw-bold"
          style={{
            color: '#111827',
            fontSize: '26px',
            lineHeight: '1',
          }}
        >
          Settings
        </h4>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div className="row g-0">
          {/* Sidebar */}
          <div
            className="col-md-3"
            style={{
              backgroundColor: '#f8fafc',
              borderRight: '1px solid #e5e7eb',
              minHeight: '480px',
            }}
          >
            <div
              style={{
                padding: '20px 18px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f0f0f0',
              }}
            >
              <h6
                className="mb-1 fw-bold text-dark"
                style={{ fontSize: '16px' }}
              >
                Account
              </h6>
              <p
                className="mb-0 text-muted"
                style={{ fontSize: '13px' }}
              >
                Manage login details
              </p>
            </div>

            <div style={{ padding: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('username');
                  setMessage('');
                  setError('');
                }}
                className="w-100 d-flex align-items-center"
                style={{
                  gap: '10px',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  border: activeTab === 'username' ? '1px solid #2563eb' : '1px solid transparent',
                  backgroundColor: activeTab === 'username' ? '#eff6ff' : 'transparent',
                  color: activeTab === 'username' ? '#2563eb' : '#374151',
                  fontWeight: activeTab === 'username' ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  textAlign: 'left',
                }}
              >
                <User size={17} />
                Change Username
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('password');
                  setMessage('');
                  setError('');
                }}
                className="w-100 d-flex align-items-center"
                style={{
                  gap: '10px',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  border: activeTab === 'password' ? '1px solid #2563eb' : '1px solid transparent',
                  backgroundColor: activeTab === 'password' ? '#eff6ff' : 'transparent',
                  color: activeTab === 'password' ? '#2563eb' : '#374151',
                  fontWeight: activeTab === 'password' ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Lock size={17} />
                Change Password
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f0f0f0',
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#2563eb',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                  }}
                >
                  {activeTab === 'username' ? (
                    <User size={18} style={{ color: 'white' }} />
                  ) : (
                    <Lock size={18} style={{ color: 'white' }} />
                  )}
                </div>

                <div>
                  <h5
                    className="mb-1 fw-bold text-dark"
                    style={{ fontSize: '16px' }}
                  >
                    {activeTab === 'username'
                      ? 'Change Username'
                      : 'Change Password'}
                  </h5>
                  <div
                    className="text-muted"
                    style={{ fontSize: '13px' }}
                  >
                    {activeTab === 'username'
                      ? 'Update your account username'
                      : 'Update your account password securely'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              {message && (
                <div className="alert alert-success" style={{ fontSize: '13px' }}>
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger" style={{ fontSize: '13px' }}>
                  {error}
                </div>
              )}

              {activeTab === 'username' && (
                <form onSubmit={handleChangeUsername}>
                  <h6
                    className="fw-semibold text-dark mb-3"
                    style={sectionTitleStyle}
                  >
                    Username Information
                  </h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label
                        className="form-label fw-medium text-dark"
                        style={labelStyle}
                      >
                        New Username
                      </label>
                      <input
                        type="text"
                        name="newUsername"
                        className="form-control"
                        value={usernameForm.newUsername}
                        onChange={handleUsernameInput}
                        style={inputStyle}
                        placeholder="Enter new username"
                      />
                    </div>
                  </div>

                  <div
                    className="d-flex justify-content-end gap-3 pt-3"
                    style={{ borderTop: '1px solid #e5e7eb' }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="btn btn-outline-secondary px-4 py-2"
                      style={outlineButtonStyle}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loadingUsername}
                      className="btn btn-primary px-4 py-2"
                      style={primaryButtonStyle}
                    >
                      {loadingUsername ? 'Updating...' : 'Update Username'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword}>
                  <h6
                    className="fw-semibold text-dark mb-3"
                    style={sectionTitleStyle}
                  >
                    Password Information
                  </h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        {renderPasswordInput(
                        'currentPassword',
                        'Current Password',
                        'Enter current password'
                        )}
                    </div>

                    <div className="col-md-6"></div>

                    <div className="col-md-6">
                        {renderPasswordInput(
                        'newPassword',
                        'New Password',
                        'Enter new password'
                        )}
                    </div>

                    <div className="col-md-6">
                        {renderPasswordInput(
                        'confirmNewPassword',
                        'Confirm New Password',
                        'Confirm new password'
                        )}
                    </div>
                    </div>

                  <div
                    className="d-flex justify-content-end gap-3 pt-3"
                    style={{ borderTop: '1px solid #e5e7eb' }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="btn btn-outline-secondary px-4 py-2"
                      style={outlineButtonStyle}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loadingPassword}
                      className="btn btn-primary px-4 py-2"
                      style={primaryButtonStyle}
                    >
                      {loadingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;