import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Patients from './components/patients/Patients';
import PatchTest from './components/PatchTest';
import Appointments from './components/appointment/Appointments';
import Allergy from './components/allergy/Allergy';
import PatientPhotos from './components/patients/PatientPhoto';
import PatientPrescriptions from './components/prescription/ViewPatientPrescriptions';
import AddInstruction from './components/instructions/AddInstruction';
import DisplayInstruction from './components/instructions/DisplayInstruction';
import ViewInstructionReport from './components/instructions/ViewInstructionReport';
import FollowUp from './components/patients/FollowUp';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewPatient from './components/patients/viewPatient';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import NewAdmin from './components/patientForms/NewAdmin';
import Medicine from './components/medicine/Medicine';
import ActualPatchTest from './components/ActualPatchTest';
import Login from './components/Login';
import AllergyReportPage from './components/allergy/AllergyReportPage';
import PatchTestReportPage from './components/patchTest/PatchTestReportPage';
import { isAuthenticated } from './utils/auth';
import Settings from './components/user/Settings';

function PrivateRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}> {/* All protected routes below */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="patients" element={<Patients />} />
          {/* Removed old dashboard prescription routes */}
          {/* <Route path="prescription" element={<ViewPrescription />} /> */}
          {/* <Route path="/prescription/:patientId" element={<Prescription />} /> */}

           <Route path="settings" element={<Settings />} />
           
          {/* New Medicine Module Route */}
          <Route path="medicines" element={<Medicine />} />

          {/* Patient-specific Prescriptions Route (kept) */}
          <Route path="/patients/:patientId/prescriptions" element={<PatientPrescriptions />} />
          
          <Route path="patients/:patientId/test" element={<PatchTest />} />
          <Route path="patients/:patientId/patch-test" element={<ActualPatchTest />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="patients/:patientId/add-instruction" element={<AddInstruction />} />
          <Route path="display-instruction/:patientId" element={<DisplayInstruction />} />
          <Route path="allergy" element={<Allergy />} />
          <Route path="/patients/:patientId/photos" element={<PatientPhotos />} />
          <Route path="patients/:patientId" element={<ViewPatient />} />
          
          <Route path="patients/:patientId/instruction-report" element={<ViewInstructionReport />} />
          {/* <Route path="/patients/:patientId/follow-up" element={<FollowUp />} /> */}
          <Route path="/patients/:patientId/followup" element={<FollowUp />} />
          <Route path="/allergy-report/:patientId" element={<AllergyReportPage />} />
          <Route path="/patch-test-report/:patientId" element={<PatchTestReportPage />} />
        
        </Route>
        </Route>
        {/* Redirect all other routes to login if not authenticated */}
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />} />
        <Route path="/newAdmin" element={<NewAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;