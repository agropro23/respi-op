import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, Settings, HomeIcon, AlertTriangle, Image, Pill, Moon, Sun, LogOut } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import profileIcon from '../assests/profile_icon.jpg';

const Layout = () => {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    // Persist mode in localStorage
    return localStorage.getItem('theme') === 'dark';
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getGreeting = () => {
      const now = new Date();
      const hours = now.getHours();

      if (hours >= 5 && hours < 12) {
        return 'Good Morning';
      } else if (hours >= 12 && hours < 17) {
        return 'Good Afternoon';
      } else if (hours >= 17 && hours < 21) {
        return 'Good Evening';
      } else {
        return 'Good Night';
      }
    };

    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    document.documentElement.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Mobile Viewport Optimization - Keep sidebar collapsed on mobile
  useEffect(() => {
    const handleMobileOptimization = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && sidebarHovered) {
        // Force sidebar to stay collapsed on mobile
        setSidebarHovered(false);
      }
    };

    // Initial check
    handleMobileOptimization();

    // Listen for window resize
    window.addEventListener('resize', handleMobileOptimization);
    return () => window.removeEventListener('resize', handleMobileOptimization);
  }, [sidebarHovered]);

  const styles = {
    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      backgroundColor: darkMode ? '#18181b' : 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease-in-out',
      zIndex: 50,
      width: sidebarHovered ? '256px' : '80px',
      overflow: 'hidden',
      borderRight: darkMode ? '1.5px solid #27272a' : 'none',
    },
    mainContent: {
      marginLeft: sidebarHovered ? '256px' : '80px',
      transition: 'all 0.3s ease-in-out',
      minHeight: '100vh',
      backgroundColor: darkMode ? '#18181b' : '#f9fafb',
    },
    logoContainer: {
      padding: '0.7rem 1.5rem',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: darkMode ? '1px solid #27272a' : '1px solid #e5e7eb',
      background: darkMode ? '#23232b' : 'white',
    },
    logo: {
      width: '32px',
      height: '32px',
      backgroundColor: '#2563eb',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    logoText: {
      marginLeft: '12px',
      fontWeight: 'bold',
      color: darkMode ? '#f3f4f6' : '#111827',
      transition: 'opacity 0.3s ease-in-out'
    },
    navSection: {
      marginTop: '2rem'
    },
    navLabel: {
      padding: '0 1rem',
      fontSize: '12px',
      fontWeight: '600',
      color: darkMode ? '#71717a' : '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      transition: 'opacity 0.3s ease-in-out'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      margin: '8px 12px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      position: 'relative',
      justifyContent: sidebarHovered ? 'flex-start' : 'center',
      background: darkMode ? '#23232b' : 'transparent',
    },
    navItemActive: {
      color: darkMode ? '#60a5fa' : '#2563eb',
      backgroundColor: darkMode ? '#313146' : '#eff6ff',
    },
    navItemDefault: {
      color: darkMode ? '#a1a1aa' : '#6b7280',
    },
    navItemText: {
      marginLeft: sidebarHovered ? '12px' : '0px',
      opacity: sidebarHovered ? 1 : 0,
      transition: 'all 0.3s ease-in-out',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      fontSize: '14px',
      fontWeight: '500',
      color: darkMode ? '#e4e4e7' : undefined,
    },
    header: {
      backgroundColor: darkMode ? '#23232b' : 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      borderBottom: darkMode ? '1px solid #27272a' : '1px solid #e5e7eb',
      padding: '1rem 1.5rem',
      color: darkMode ? '#f3f4f6' : undefined,
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define a style for the main content based on the route
  const mainContentPaddingStyle = isActive('/patch-test-report') ? {} : { padding: '1rem 1.5rem' };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: darkMode ? '#18181b' : '#f9fafb' }} className={darkMode ? 'dark-mode' : ''}>
      {/* Sidebar */}
      <div
        style={styles.sidebar}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Logo */}
        <div style={styles.logoContainer}>
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: sidebarHovered ? '90px' : '60px', transition: 'min-height 0.3s' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #2563eb 40%, #ff416c 100%)',
                borderRadius: '50%',
                width: sidebarHovered ? '56px' : '40px',
                height: sidebarHovered ? '56px' : '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(37,99,235,0.15)',
                marginBottom: sidebarHovered ? '6px' : '0',
                marginTop: sidebarHovered ? '10px' : '10px',
                transition: 'all 0.3s',
                border: '1.5px solid #fff',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => navigate("/")}
            >
              <span
                style={{
                  fontSize: sidebarHovered ? '2.2rem' : '1.4rem',
                  fontWeight: 900,
                  color: '#fff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  letterSpacing: '-2px',
                  lineHeight: 1,
                }}
              >
                R
              </span>
            </div>
            {sidebarHovered && (
              <div className="text-center" onClick={() => navigate("/")} style={{ marginTop: '2px', transition: 'opacity 0.3s', cursor: 'pointer' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em', color: '#2563eb', fontFamily: 'Montserrat, Arial, sans-serif' }}>
                  RESPICURE
                </span>
                <br />
                <span style={{ fontWeight: 500, fontSize: '0.85rem', color: darkMode ? '#e4e4e7' : '#222', letterSpacing: '0.12em', fontFamily: 'Montserrat, Arial, sans-serif' }}>
                  CHEST CLINIC
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.navSection}>
          {sidebarHovered && (
            <div style={styles.navLabel}>
              <span>MAIN</span>
            </div>
          )}

          <div className="mt-3">
            {/* Home */}
            <div
              style={{ 
                ...styles.navItem, 
                ...(isActive('/') ? styles.navItemActive : styles.navItemDefault),
                ...(sidebarHovered ? { cursor: 'pointer' } : {}),
              }}
              onClick={() => navigate('/')}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = darkMode ? '#313146' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isActive('/') ? (darkMode ? '#313146' : '#eff6ff') : (darkMode ? '#23232b' : 'transparent')}
            >
              <HomeIcon size={20} style={{ minWidth: '20px', minHeight: '20px' }} />
              {sidebarHovered && <span style={styles.navItemText}>Home</span>}
            </div>

            {/* Manage Patients */}
            <div
              style={{ 
                ...styles.navItem, 
                ...(isActive('/patients') ? styles.navItemActive : styles.navItemDefault)
              }}
              onClick={() => navigate('/patients')}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = darkMode ? '#313146' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isActive('/patients') ? (darkMode ? '#313146' : '#eff6ff') : (darkMode ? '#23232b' : 'transparent')}
            >
              <Users size={20} style={{ minWidth: '20px', minHeight: '20px' }} />
              {sidebarHovered && <span style={styles.navItemText}>Manage Patients</span>}
            </div>

            {/* Appointments */}
            <div
              style={{ 
                ...styles.navItem, 
                ...(isActive('/appointments') ? styles.navItemActive : styles.navItemDefault)
              }}
              onClick={() => navigate('/appointments')}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = darkMode ? '#313146' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isActive('/appointments') ? (darkMode ? '#313146' : '#eff6ff') : (darkMode ? '#23232b' : 'transparent')}
            >
              <Calendar size={20} style={{ minWidth: '20px', minHeight: '20px' }} />
              {sidebarHovered && <span style={styles.navItemText}>Appointments</span>}
            </div>

            {/* Allergies */}
            <div
              style={{ 
                ...styles.navItem, 
                ...(isActive('/allergy') ? styles.navItemActive : styles.navItemDefault)
              }}
              onClick={() => navigate('/allergy')}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = darkMode ? '#313146' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isActive('/allergy') ? (darkMode ? '#313146' : '#eff6ff') : (darkMode ? '#23232b' : 'transparent')}
            >
              <AlertTriangle size={20} style={{ minWidth: '20px', minHeight: '20px' }} />
              {sidebarHovered && <span style={styles.navItemText}>Allergies</span>}
            </div>

            {/* Medicine */}
            <div
              style={{ 
                ...styles.navItem, 
                ...(isActive('/medicines') ? styles.navItemActive : styles.navItemDefault)
              }}
              onClick={() => navigate('/medicines')}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = darkMode ? '#313146' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isActive('/medicines') ? (darkMode ? '#313146' : '#eff6ff') : (darkMode ? '#23232b' : 'transparent')}
            >
              <Pill size={20} style={{ minWidth: '20px', minHeight: '20px' }} />
              {sidebarHovered && <span style={styles.navItemText}>Medicine</span>}
            </div>

            {/* Settings */}
            <div
              style={{ 
                ...styles.navItem, 
                ...(isActive('/settings') ? styles.navItemActive : styles.navItemDefault)
              }}
              onClick={() => navigate('/settings')}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = darkMode ? '#313146' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isActive('/settings') ? (darkMode ? '#313146' : '#eff6ff') : (darkMode ? '#23232b' : 'transparent')}
            >
              <Settings size={20} style={{ minWidth: '20px', minHeight: '20px' }} />
              {sidebarHovered && <span style={styles.navItemText}>Settings</span>}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div className="d-flex justify-content-end align-items-center w-100">
            <div className="d-flex align-items-center gap-3">
              {/* Dark/Light Mode Toggle */}
              <button
                className="d-flex align-items-center"
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid #3f3f46' : '1px solid #d1d5db',
                  backgroundColor: darkMode ? '#27272a' : '#ffffff',
                  color: darkMode ? '#e5e7eb' : '#374151',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
                onClick={() => setDarkMode((d) => !d)}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#323238' : '#f9fafb';
                  e.currentTarget.style.borderColor = darkMode ? '#52525b' : '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#27272a' : '#ffffff';
                  e.currentTarget.style.borderColor = darkMode ? '#3f3f46' : '#d1d5db';
                }}
              >
                {darkMode ? (
                  <Sun size={17} className="me-2" />
                ) : (
                  <Moon size={17} className="me-2" />
                )}
                {darkMode ? 'Light' : 'Dark'}
              </button>

              {/* Logout Button */}
              <button
                className="d-flex align-items-center"
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid #7f1d1d' : '1px solid #fecaca',
                  backgroundColor: darkMode ? '#27272a' : '#ffffff',
                  color: darkMode ? '#f87171' : '#b91c1c',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
                onClick={handleLogout}
                title="Logout"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#3a1f1f' : '#fef2f2';
                  e.currentTarget.style.borderColor = darkMode ? '#991b1b' : '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#27272a' : '#ffffff';
                  e.currentTarget.style.borderColor = darkMode ? '#7f1d1d' : '#fecaca';
                }}
              >
                <LogOut size={17} className="me-2" />
                Logout
              </button>
              <div style={styles.avatar}>
                <img src={profileIcon} alt="Profile" style={styles.avatarImage} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={mainContentPaddingStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;