import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { apiFetch } from '../../utils/api'; 

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const purposes = ['Consultation', 'Follow-up', 'Test', 'Vaccination', 'Other'];

const API_URL = `${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients`;

const Appointments = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    contact: '',
    patientId: '',
    date: new Date().toISOString().slice(0, 10),
    time: '12:00', // 24-hour format
    purpose: '',
  });
  const [schedule, setSchedule] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [lockedFields, setLockedFields] = useState({ name: false, contact: false });
  const [viewAppointments, setViewAppointments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAppointments = async () => {
    try {
      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/appointments`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setSchedule(data);
    } catch (err) {
      setSchedule([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    apiFetch(API_URL)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched data:', data);
        setPatients(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch patients');
        setLoading(false);
      });
    fetchAppointments();
  }, []);

  const validate = () => {
    const errors = {};
    if (!form.name || !form.name.trim()) errors.name = 'Name is required';
    if (!form.contact || !form.contact.trim()) {
      errors.contact = 'Contact is required';
    } else if (!/^\d{10}$/.test(form.contact.trim()) && form.contact !== 'N/A') {
      errors.contact = 'Contact must be a 10-digit number';
    }
    if (!form.purpose) errors.purpose = 'Purpose is required';
    // Validate time (allow 00:00 to 23:59)
    const [hh, mm] = (form.time || '').split(':');
    const hour = parseInt(hh, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      errors.time = 'Invalid time';
    }
    // Validate date and time are not in the past
    const selectedDateTime = new Date(`${form.date}T${form.time || '00:00'}:00`);
    const now = new Date();
    if (selectedDateTime < now.setSeconds(0,0)) {
      errors.date = 'Date and time cannot be in the past';
      errors.time = 'Date and time cannot be in the past';
    }
    return errors;
  };

  const handleChange = (field, value) => {
    if (lockedFields[field]) return;
    setForm(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleAdd = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!form.patientId) {
      setFormErrors({ name: 'Patient not found' });
      return;
    }

    // Check if the patient already has an appointment on the same date
    const duplicate = schedule.find(
      appt => appt.patientId?.$oid === form.patientId && appt.date === form.date
    );
    if (duplicate) {
      setFormErrors({ date: 'This patient already has an appointment on this date.' });
      return;
    }

    try {
      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: form.patientId,
          date: form.date,
          time: form.time,
          purpose: form.purpose
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        setFormErrors({ submit: errorData.error || 'Failed to add appointment' });
        return;
      }
      await fetchAppointments();
    } catch (err) {
      setFormErrors({ submit: 'Network error' });
      return;
    }

    setForm({
      name: '',
      contact: '',
      patientId: '',
      date: new Date().toISOString().slice(0, 10),
      time: '12:00',
      purpose: '',
    });
    setFormErrors({});
    setShowAppointmentForm(false); // <-- Close the modal/card after add
    setLockedFields({ name: false, contact: false });
  };

  const handleClear = () => {
    setForm(prev => ({
      ...prev,
      date: new Date().toISOString().slice(0, 10),
      time: '12:00',
      purpose: '',
      patientId: '',
    }));
    setFormErrors({});
    setLockedFields({ name: false, contact: false });
  };

  const handleChangeRow = async () => {
    if (selectedIdx === null) return;
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const appointmentToUpdate = schedule[selectedIdx];
    try {
      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/appointments/${appointmentToUpdate._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: form.patientId,
          date: form.date,
          time: form.time,
          purpose: form.purpose
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        setFormErrors({ submit: errorData.error || 'Failed to update appointment' });
        return;
      }
      await fetchAppointments();
      setShowAppointmentForm(false);
      setSelectedIdx(null);
      handleClear();
    } catch (err) {
      setFormErrors({ submit: 'Network error' });
    }
  };

  const handleRowClick = idx => {
    setSelectedIdx(idx);
    const item = schedule[idx];
    const patientId = item.patientId?.$oid || item.patientId;
    const patient = patients.find(p => p._id === patientId);

    setForm({
      name: patient?.basicInfo?.name || '',
      contact: patient?.basicInfo?.tel1 || patient?.basicInfo?.tel2 || patient?.basicInfo?.tel3 || 'N/A',
      patientId: patientId,
      date: item.date,
      time: item.time,
      purpose: item.purpose,
    });
    setFormErrors({});
    setLockedFields({ name: true, contact: true });
    setShowAppointmentForm(true);
  };

  const getDayOfWeek = dateStr => {
    const d = new Date(dateStr);
    return weekdays[d.getDay()];
  };

  // Utility to format time from 24-hour to 12-hour with AM/PM
  function formatTime12Hour(timeStr) {
    if (!timeStr) return '';
    let [hour, minute] = timeStr.split(':');
    hour = parseInt(hour, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  }

  // Add a handler for deleting an appointment
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
        const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/appointments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        setFormErrors({ submit: errorData.error || 'Failed to delete appointment' });
        return;
      }
      await fetchAppointments();
    } catch (err) {
      setFormErrors({ submit: 'Network error' });
    }
  };

  // Utility to format date from YYYY-MM-DD to DD-MM-YYYY
  function formatDateDDMMYYYY(dateStr) {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }

  // Patient List View
  if (!showAppointmentForm) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <button
            className="btn btn-outline-primary"
            style={{ borderRadius: 8, fontWeight: 500, fontSize: 15, padding: '8px 24px' }}
            onClick={() => setViewAppointments(v => !v)}
          >
            {viewAppointments ? 'View Patient' : 'View Appointments'}
          </button>
        </div>
        {viewAppointments ? (
          <div className="card shadow-sm" style={{ maxWidth: 1200, borderRadius: 12, margin: '40px auto', minHeight: 300 }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center" style={{ borderRadius: '12px 12px 0 0' }}>
              <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '16px' }}>Appointments List</h5>
              <div className="input-group" style={{ minWidth: 160, maxWidth: 400 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or Patient ID..."
                  style={{ borderRadius: '8px 0 0 8px', fontSize: 15, minWidth: 0 }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <span className="input-group-text" style={{ borderRadius: '0 8px 8px 0', borderLeft: 0, background: '#f3f4f6' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#6b7280" strokeWidth="2" /><path stroke="#6b7280" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" /></svg>
                </span>
              </div>
            </div>
            <div className="card-body">
              {schedule.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, border: '2px dashed #d1d5db', borderRadius: 16, background: '#fafbfc' }}>
                  <div style={{ background: '#e5e7eb', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Plus size={32} color="#6b7280" />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#374151', marginBottom: 4 }}>No appointments booked</div>
                  <div style={{ color: '#6b7280', fontSize: 15 }}>Click on a patient to add an appointment</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle" style={{ minWidth: 800, fontSize: 15, width: '100%' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '14px 16px', width: '12%' }}>Patient ID</th>
                        <th style={{ padding: '14px 16px', width: '18%' }}>Name</th>
                        <th style={{ padding: '14px 16px', width: '12%' }}>Date</th>
                        <th style={{ padding: '14px 16px', width: '10%' }}>Time</th>
                        <th style={{ padding: '14px 16px', width: '15%' }}>Contact</th>
                        <th style={{ padding: '14px 16px', width: '18%' }}>Purpose</th>
                        <th style={{ padding: '14px 16px', width: '20%', minWidth: 180, textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule
                        .slice()
                        .sort((a, b) => {
                          const parseDateTime = (item) => {
                            const [time, ampm] = (item.time || '').split(' ');
                            let [hour, minute] = (time || '00:00').split(':');
                            hour = parseInt(hour, 10);
                            minute = parseInt(minute, 10);
                            if (ampm === 'PM' && hour < 12) hour += 12;
                            if (ampm === 'AM' && hour === 12) hour = 0;
                            const dt = new Date(item.date);
                            dt.setHours(hour, minute, 0, 0);
                            return dt;
                          };
                          return parseDateTime(a) - parseDateTime(b);
                        })
                        .filter(item => {
                          const patient = patients.find(p => p._id === (item.patientId?.$oid || item.patientId));
                          const name = patient?.basicInfo?.name || '';
                          const pid = patient?.patientId || '';
                          return name.toLowerCase().includes(searchQuery.toLowerCase()) || pid.toLowerCase().includes(searchQuery.toLowerCase());
                        })
                        .map((item, idx) => {
                          const patient = patients.find(p => p._id === (item.patientId?.$oid || item.patientId));
                          return (
                            <tr key={idx}>
                              <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontWeight: 500, color: '#2563eb' }}>{patient?.patientId || 'N/A'}</td>
                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{patient?.basicInfo?.name || 'N/A'}</td>
                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{formatDateDDMMYYYY(item.date)}</td>
                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{formatTime12Hour(item.time)}</td>
                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{patient?.basicInfo?.tel1 || patient?.basicInfo?.tel2 || patient?.basicInfo?.tel3 || 'N/A'}</td>
                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{item.purpose || 'N/A'}</td>
                              <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'left', minWidth: 140 }}>
                                <div className="d-flex flex-row gap-2 flex-nowrap align-items-center" style={{flexWrap: 'nowrap'}}>
                                <button 
                                    className="btn btn-warning btn-sm appointment-action-btn"
                                    style={{ minWidth: 90, fontWeight: 600, letterSpacing: 0.5, borderRadius: 8, boxShadow: '0 1px 2px rgba(251,191,36,0.08)', color: '#fff', background: '#f59e42', border: 'none', transition: 'background 0.2s, color 0.2s' }}
                                  onClick={() => {
                                    setSelectedIdx(idx);
                                    setForm({
                                      name: patient?.basicInfo?.name || '',
                                      contact: patient?.basicInfo?.tel1 || patient?.basicInfo?.tel2 || patient?.basicInfo?.tel3 || 'N/A',
                                      patientId: item.patientId?.$oid || item.patientId,
                                      date: item.date,
                                      time: item.time,
                                      purpose: item.purpose,
                                    });
                                    setFormErrors({});
                                    setLockedFields({ name: true, contact: true });
                                    setShowAppointmentForm(true);
                                  }}
                                >
                                  Change
                                </button>
                                <button 
                                    className="btn btn-danger btn-sm appointment-action-btn"
                                    style={{ minWidth: 90, fontWeight: 600, letterSpacing: 0.5, borderRadius: 8, boxShadow: '0 1px 2px rgba(239,68,68,0.08)', color: '#fff', background: '#ef4444', border: 'none', transition: 'background 0.2s, color 0.2s' }}
                                  onClick={() => handleDeleteAppointment(item._id)}
                                >
                                  Delete
                                </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <style>{`
              .appointment-action-btn:hover {
                filter: brightness(0.95);
                transform: translateY(-2px) scale(1.03);
                box-shadow: 0 4px 12px rgba(251,191,36,0.10);
              }
            `}</style>
          </div>
        ) : (
      <div className="card shadow-sm" style={{ maxWidth: 1200, borderRadius: 12, margin: '40px auto' }}>
        <div className="card-header bg-white d-flex justify-content-between align-items-center" style={{ borderRadius: '12px 12px 0 0' }}>
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '16px' }}>Patients List</h5>
          <div className="input-group" style={{ minWidth: 160, maxWidth: 400 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or Patient ID..."
              style={{ borderRadius: '8px 0 0 8px', fontSize: 15, minWidth: 0 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <span className="input-group-text" style={{ borderRadius: '0 8px 8px 0', borderLeft: 0, background: '#f3f4f6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#6b7280" strokeWidth="2" /><path stroke="#6b7280" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" /></svg>
            </span>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-danger">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle" style={{ minWidth: 800, fontSize: 15, width: '100%' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '14px 16px', width: '15%' }}>Patient ID</th>
                    <th style={{ padding: '14px 16px', width: '25%' }}>Name</th>
                    <th style={{ padding: '14px 16px', width: '10%' }}>Age</th>
                    <th style={{ padding: '14px 16px', width: '10%' }}>Sex</th>
                    <th style={{ padding: '14px 16px', width: '20%' }}>Contact</th>
                    <th style={{ padding: '14px 16px', width: '20%', minWidth: 180, textAlign: 'left' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted">No patients found</td></tr>
                      ) : patients
                    .filter(p => p.basicInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.patientId && p.patientId.toLowerCase().includes(searchQuery.toLowerCase())))
                        .map((p, idx) => (
                    <tr key={p._id || idx}>
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontWeight: 500, color: '#2563eb' }}>{p.patientId}</td>
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{p.basicInfo.name}</td>
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{p.basicInfo.age}</td>
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          <span className="badge rounded-pill" style={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 500, fontSize: 14 }}>{p.basicInfo.sex}</span>
                        </td>
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{p.basicInfo.tel1 || p.basicInfo.tel2 || p.basicInfo.tel3 || 'N/A'}</td>
                        <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'left', minWidth: 140 }}>
                          <button className="btn btn-primary btn-sm patient-action-btn"
                            style={{ minWidth: 120, fontWeight: 600, letterSpacing: 0.5, borderRadius: 8, boxShadow: '0 1px 2px rgba(37,99,235,0.08)', transition: 'background 0.2s, color 0.2s' }}
                          onClick={() => {
                            setForm(f => ({
                              ...f,
                              name: p.basicInfo.name || '',
                              contact: p.basicInfo.tel1 || p.basicInfo.tel2 || p.basicInfo.tel3 || 'N/A',
                              patientId: p._id,
                              date: new Date().toISOString().slice(0, 10),
                              time: '12:00',
                              purpose: '',
                            }));
                            setLockedFields({ name: true, contact: true });
                            setShowAppointmentForm(true);
                            fetchAppointments();
                          }}
                        >Add Appointment</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <style>{`
          .patient-action-btn:hover {
            filter: brightness(0.95);
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 4px 12px rgba(37,99,235,0.10);
          }
        `}</style>
          </div>
        )}
      </div>
    );
  }

  // Modal/Form view
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
        {/* Modal Header */}
        <div style={{ padding: '24px 32px 0 32px', borderBottom: '1px solid #f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '16px 16px 0 0', background: '#f8fafc' }}>
          <div>
            <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: 18 }}>Add Appointment</h5>
            <div className="d-flex align-items-center text-muted" style={{ fontSize: 13 }}>
              <span>{formatDateDDMMYYYY(form.date)}</span>
              <span className="mx-2">•</span>
              <span>Patient ID: </span>
              <span className="text-primary fw-semibold ms-1">{(() => {
                const patient = patients.find(p => p._id === form.patientId);
                return patient?.patientId || 'N/A';
              })()}</span>
            </div>
          </div>
          <button onClick={() => { setShowAppointmentForm(false); setLockedFields({ name: false, contact: false }); }} style={{ background: 'none', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer', color: '#6b7280', fontSize: 22, fontWeight: 700 }}>×</button>
        </div>
        {/* Modal Body */}
        <form style={{ padding: '32px' }} onSubmit={e => { 
          e.preventDefault(); 
          if (selectedIdx !== null) {
            handleChangeRow();
          } else {
            handleAdd();
          }
        }}>
          <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Appointment Information
          </h6>
          <div className="row g-3 mb-3">
            <div className="col-md-12">
              <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Patient's Name *</label>
              <input type="text" className={`form-control${formErrors.name ? ' is-invalid' : ''}`} value={form.name || ''} readOnly={lockedFields.name} style={{ borderRadius: 8, fontSize: 13, background: lockedFields.name ? '#f3f4f6' : undefined }} />
              {formErrors.name && <div className="invalid-feedback" style={{ fontSize: 12 }}>{formErrors.name}</div>}
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Date</label>
              <input type="date" className={`form-control${formErrors.date ? ' is-invalid' : ''}`} value={form.date || ''} onChange={e => handleChange('date', e.target.value)} style={{ borderRadius: 8, fontSize: 13 }} min={new Date().toISOString().slice(0, 10)} />
              {formErrors.date && <div className="invalid-feedback d-block" style={{ fontSize: 12 }}>{formErrors.date}</div>}
              <div>
                <span style={{ fontWeight: 700, fontSize: 15, background: '#2563eb', color: 'white', borderRadius: 6, padding: '2px 10px', marginTop: 4, display: 'inline-block' }}>{getDayOfWeek(form.date)}</span>
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Time</label>
              <input type="time" className={`form-control${formErrors.time ? ' is-invalid' : ''}`} value={form.time || ''} onChange={e => handleChange('time', e.target.value)} style={{ borderRadius: 8, fontSize: 13 }} />
              {formErrors.time && <div className="invalid-feedback d-block" style={{ fontSize: 12 }}>{formErrors.time}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Purpose *</label>
              <select className={`form-select${formErrors.purpose ? ' is-invalid' : ''}`} value={form.purpose || ''} onChange={e => handleChange('purpose', e.target.value)} style={{ borderRadius: 8, fontSize: 13 }}>
                <option value="">Select</option>
                {purposes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {formErrors.purpose && <div className="invalid-feedback" style={{ fontSize: 12 }}>{formErrors.purpose}</div>}
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Contact *</label>
              <input type="text" className={`form-control${formErrors.contact ? ' is-invalid' : ''}`} value={form.contact || ''} readOnly={lockedFields.contact} style={{ borderRadius: 8, fontSize: 13, background: lockedFields.contact ? '#f3f4f6' : undefined }} />
              {formErrors.contact && <div className="invalid-feedback" style={{ fontSize: 12 }}>{formErrors.contact}</div>}
            </div>
          </div>
          <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-outline-secondary px-4 py-2"
              style={{ borderRadius: 8, border: '1px solid #d1d5db', color: '#6b7280', fontWeight: 500, fontSize: 13 }}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2"
              style={{ borderRadius: 8, backgroundColor: '#2563eb', border: 'none', fontWeight: 500, fontSize: 13 }}
            >
              {selectedIdx !== null ? 'Update' : 'Add'}
            </button>
          </div>
          {/* Remove or conditionally render the "This day's schedule" table */}
          {false && (
            <>
              <div style={{ fontSize: 14, fontWeight: 500, margin: '32px 0 8px 0' }}>This day's schedule</div>
              <div className="table-responsive">
                <table className="table table-bordered" style={{ fontSize: 13, minWidth: 500 }}>
                  <thead style={{ background: '#e0f2fe' }}>
                    <tr>
                      <th>Sl</th>
                      <th>Name</th>
                      <th>Dt</th>
                      <th>Time</th>
                      <th>Contact</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-muted">No appointments</td></tr>
                    ) : schedule.map((item, idx) => (
                      <tr key={idx} style={{ cursor: 'pointer', background: selectedIdx === idx ? '#e0e7ff' : undefined }} onClick={() => handleRowClick(idx)}>
                        <td>{idx + 1}</td>
                        <td>{patients.find(p => p._id === (item.patientId?.$oid || item.patientId))?.basicInfo?.name || 'N/A'}</td>
                        <td>{formatDateDDMMYYYY(item.date)}</td>
                        <td>{formatTime12Hour(item.time)}</td>
                        <td>{patients.find(p => p._id === (item.patientId?.$oid || item.patientId))?.basicInfo?.tel1 || 'N/A'}</td>
                        <td>{item.purpose || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Appointments;