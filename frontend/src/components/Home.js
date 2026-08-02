import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Pill, AlertTriangle, FileText, PlusCircle, Activity as ActivityIcon, Edit2 } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const BASE_URL = process.env.REACT_APP_CLIENT_BASE_URL;

const Home = () => {
  const styles = {
    statsIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    clickableCard: {
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
    },
    clickableCardHover: {
      boxShadow: '0 6px 24px rgba(37,99,235,0.10)',
    }
  };

  const [weeklyPatients, setWeeklyPatients] = useState([]);

  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    newPatients: 0,  
    totalAllergies: 0,
    totalMedicines: 0,
    loading: false,
    error: null
  });

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);

  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const patientsResponse = await apiFetch(`${BASE_URL}/api/patients`);
      if (!patientsResponse.ok) {
        throw new Error('Failed to fetch patients');
      }
      const patientsData = await patientsResponse.json();
  
      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await apiFetch(`${BASE_URL}/api/appointments?date=${today}`);
      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const appointmentsData = await appointmentsResponse.json();
  
      // Calculate new patients added today
      const todayPatients = Array.isArray(patientsData)
        ? patientsData.filter(patient => {
          const patientDate = new Date(patient.createdAt).toISOString().split('T')[0];
          return patientDate === today;
        })
        : [];
  
      // Prepare data for last 7 days
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
  
      const weeklyCounts = last7Days.map(date =>
        Array.isArray(patientsData)
          ? patientsData.filter(patient => new Date(patient.createdAt).toISOString().split('T')[0] === date).length
          : 0
      );
  
      setWeeklyPatients({ labels: last7Days, data: weeklyCounts });
  
      // Fetch total allergies
      const allergiesResponse = await apiFetch(`${BASE_URL}/api/allergies`);
      let totalAllergies = 0;
      if (allergiesResponse.ok) {
        const allergiesData = await allergiesResponse.json();
        totalAllergies = Array.isArray(allergiesData.data) ? allergiesData.data.length : 0;
      }
  
      // Fetch total medicines
      const medicinesResponse = await apiFetch(`${BASE_URL}/api/medicine`);
      let totalMedicines = 0;
      if (medicinesResponse.ok) {
        const medicinesData = await medicinesResponse.json();
        totalMedicines = Array.isArray(medicinesData.data) ? medicinesData.data.length : 0;
      }
  
      setStats({
        totalPatients: Array.isArray(patientsData) ? patientsData.length : 0,
        todayAppointments: Array.isArray(appointmentsData) ? appointmentsData.length : 0,
        newPatients: todayPatients.length,
        totalAllergies,
        totalMedicines,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch statistics, Please refresh or login again.'
      }));
    }
  };

  // Fetch recent activity
  const fetchActivity = async () => {
    try {
      const res = await apiFetch(`${BASE_URL}/api/activity`);
      if (!res.ok) throw new Error('Failed to fetch activity');
      const data = await res.json();
      setActivity(data);
      setActivityError(null);
    } catch (err) {
      setActivityError('Failed to fetch activity feed, Please refresh or login again.');
    }
  };

  useEffect(() => {
    fetchStats();

    // Fetch activity on mount
    const initialFetch = async () => {
      setActivityLoading(true);
      await fetchActivity();
      setActivityLoading(false);
    };

    initialFetch();

    // Set up auto-polling every 1 second
    const pollInterval = setInterval(async () => {
      await fetchActivity();
    }, 1000); // 1 second

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);

  // Helper for relative time
  function timeAgo(date) {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Icon and color map for activity types
  const activityTypeMap = {
    patient: { icon: <Users size={18} className="text-primary" />, color: '#2563eb', label: 'New Patient' },
    appointment: { icon: <Calendar size={18} className="text-success" />, color: '#16a34a', label: 'Appointment' },
    prescription: { icon: <FileText size={18} className="text-info" />, color: '#0ea5e9', label: 'Prescription' },
    allergy: { icon: <AlertTriangle size={18} className="text-warning" />, color: '#eab308', label: 'Allergy' },
    patchTest: { icon: <ActivityIcon size={18} className="text-secondary" />, color: '#64748b', label: 'Allergy Test' },
    actualPatchTest: { icon: <ActivityIcon size={18} className="text-success" />, color: '#10b981', label: 'Patch Test' },
    instruction: { icon: <Edit2 size={18} className="text-purple" />, color: '#a21caf', label: 'Instruction' },
    followup: { icon: <PlusCircle size={18} className="text-teal" />, color: '#14b8a6', label: 'Follow-up' },
    medicine: { icon: <Pill size={18} className="text-pink" />, color: '#db2777', label: 'Medicine' },
  };

  // Helper: get color for type
  const getTypeColor = (type) => (activityTypeMap[type]?.color || '#e0e7ef');

  return (
    <>
      {stats.error && (
        <div className="alert alert-danger mb-4" role="alert">
          {stats.error}
        </div>
      )}

      <div className="row g-4 m-2">
        <div
          className="d-flex flex-wrap justify-content-between align-items-stretch gap-3 w-100"
          style={{ marginBottom: 24 }}
        >
          {[
            {
              label: 'Patients',
              value: stats.totalPatients,
              loading: stats.loading,
              sub: 'Active patients',
              icon: <Users size={24} style={{ color: '#2563eb' }} />, 
              bg: 'linear-gradient(90deg, #e0e7ef 0%, #f8fafc 100%)',
              color: '#2563eb',
              onClick: () => navigate('/patients'),
            },
            {
              label: 'Appointments',
              value: stats.todayAppointments,
              loading: stats.loading,
              sub: "Today's schedule",
              icon: <Calendar size={24} style={{ color: '#16a34a' }} />, 
              bg: 'linear-gradient(90deg, #dcfce7 0%, #f8fafc 100%)',
              color: '#16a34a',
              onClick: () => navigate('/appointments'),
            },
            {
              label: 'New Patients',
              value: stats.newPatients,
              loading: stats.loading,
              sub: 'Added today',
              icon: <Users size={24} style={{ color: '#16a34a' }} />, 
              bg: 'linear-gradient(90deg, #f0fdf4 0%, #f8fafc 100%)',
              color: '#16a34a',
              onClick: () => navigate('/patients'),
            },
            {
              label: 'Allergies',
              value: stats.totalAllergies,
              loading: stats.loading,
              sub: 'Allergy types',
              icon: <AlertTriangle size={24} style={{ color: '#eab308' }} />, 
              bg: 'linear-gradient(90deg, #fef9c3 0%, #f8fafc 100%)',
              color: '#eab308',
              onClick: () => navigate('/allergy'),
            },
            {
              label: 'Medicines',
              value: stats.totalMedicines,
              loading: stats.loading,
              sub: 'Available medicines',
              icon: <Pill size={24} style={{ color: '#a21caf' }} />, 
              bg: 'linear-gradient(90deg, #f3e8ff 0%, #f8fafc 100%)',
              color: '#a21caf',
              onClick: () => navigate('/medicines'),
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="stat-card flex-grow-1 flex-shrink-1"
              style={{
                minWidth: '170px',
                maxWidth: '220px',
                flexBasis: '17%',
                border: '1.5px solid #e0e7ef',
                borderRadius: 18,
                boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s',
                minHeight: 160,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'stretch',
              }}
              onClick={card.onClick}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.12)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.08)'}
            >
              <div
                className="stat-card-header d-flex align-items-center"
                style={{
                  background: card.bg,
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                  padding: '18px 20px 10px 20px',
                  minHeight: 56,
                  borderBottom: '1.5px solid #e0e7ef',
                  fontWeight: 700,
                  fontSize: 18,
                  color: card.color,
                  letterSpacing: 0.2,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.04)',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {card.icon}
                <span className="ms-2">{card.label}</span>
              </div>
              <div className="stat-card-body" style={{ padding: '18px 20px 10px 20px', background: '#fff', borderBottomLeftRadius: 18, borderBottomRightRadius: 18, flex: 1 }}>
                <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: 32, letterSpacing: 0.5 }}>
                  {card.loading ? <span className="placeholder col-6"></span> : card.value}
                </h3>
                <div className="text-muted" style={{ fontSize: 14 }}>{card.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="card mb-4" style={{ boxShadow: '0 6px 32px rgba(37,99,235,0.10)', border: '1.5px solid #e0e7ef', borderRadius: 18, overflow: 'hidden', background: '#f8fafc' }}>
        <div
          className="card-header d-flex align-items-center"
          style={{
            background: 'linear-gradient(90deg, #e0e7ef 0%, #f8fafc 100%)',
            fontWeight: 700,
            fontSize: 22,
            color: '#1e293b',
            letterSpacing: 0.2,
            borderBottom: '1.5px solid #e0e7ef',
            padding: '18px 28px',
            boxShadow: '0 2px 8px rgba(37,99,235,0.04)',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            minHeight: 60,
          }}
        >
          <Clock size={24} className="me-3 text-primary" />
          <span style={{ flex: 1 }}>Recent Activity</span>
</div>
        <div className="card-body" style={{ minHeight: 120, background: '#f9fafb', padding: '28px 28px 18px 28px', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
          {activityLoading ? (
            <div className="text-muted">Loading activity...</div>
          ) : activityError ? (
            <div className="text-danger">{activityError}</div>
          ) : activity.length === 0 ? (
            <div className="text-muted">No recent activity.</div>
          ) : (
            <div className="timeline-vertical position-relative" style={{ paddingLeft: 36, borderLeft: 'none' }}>
              {activity.map((item, idx) => {
                const map = activityTypeMap[item.type] || {};
                const color = getTypeColor(item.type);
                return (
                  <div
                    key={idx}
                    className="d-flex align-items-start mb-4 position-relative timeline-item activity-fadein"
                    style={{ minHeight: 56, transition: 'box-shadow 0.2s, transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderRadius: 12, background: '#fff', padding: '12px 18px', marginLeft: 0, borderLeft: `4px solid ${color}` }}
                  >
                    {/* Vertical colored bar */}
                    <span
                      className="position-absolute"
                      style={{
                        left: -36,
                        top: 0,
                        width: 4,
                        height: '100%',
                        background: color,
                        borderRadius: 2,
                        zIndex: 1,
                        opacity: 0.18,
                      }}
                    />
                    {/* Icon with white bg and colored border */}
                    <span
                      className="d-flex align-items-center justify-content-center position-absolute activity-icon"
                      style={{
                        left: -54,
                        top: 10,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#fff',
                        border: `3px solid ${color}`,
                        boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                        zIndex: 2,
                        fontSize: 20,
                        transition: 'transform 0.2s',
                      }}
                    >
                      {map.icon || <FileText size={20} color={color} />}
                    </span>
                    {/* Type chip */}
                    <span
                      className="badge rounded-pill me-3"
                      style={{
                        background: color,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 13,
                        marginTop: 2,
                        marginRight: 18,
                        minWidth: 90,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        letterSpacing: 0.5,
                        border: 'none',
                        position: 'relative',
                        left: -10,
                      }}
                    >
                      {map.label || item.type.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className="ms-2" style={{ flex: 1 }}>
                      <div className="fw-semibold text-dark" style={{ fontSize: 16 }}>{item.name ? item.name : ''}</div>
                      <div className="text-muted small" style={{ fontSize: 14, marginTop: 2 }}>{typeof item.details === 'object' ? JSON.stringify(item.details) : item.details}</div>
                      <div className="text-secondary small mt-1" style={{ fontSize: 13 }}>{timeAgo(item.date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;