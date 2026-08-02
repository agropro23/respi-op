const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const multer = require('multer');
const app = express();
const authenticateToken = require('./middleware/auth');


// CORS configuration
const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 12 // Maximum 12 files
    }
});

// Always use CORS first
app.use(cors(corsOptions));
app.use(express.json());

// Import routes
const saveInstructionRoutes = require('./routes/saveinstruction');

const patientRoutes = require('./routes/patient');
const patchTestingRoutes = require('./routes/patchTesting');
const prescriptionRoutes = require('./routes/prescription');
const allergyRoutes = require('./routes/allergy');
const appointmentsRoutes = require('./routes/appointments');
const allergyDetailsRoutes = require('./routes/allergyDetails');
const medicineRoutes = require('./routes/medicine');
const translationRoutes = require('./routes/translations');
const followUpRoutes = require('./routes/followup');
const actualPatchTestingRoutes = require('./routes/actualPatchTesting');
const patientPatchTestRoutes = require('./routes/patientPatchTest');
const saveRoutes = require('./routes/save');
const userRoutes = require('./routes/user');



app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Public route for login/register
app.use('/api/user', userRoutes);
app.use('/api/save', saveRoutes);

// Protect all other API routes
app.use('/api/patients', authenticateToken, patientRoutes);
app.use('/api/patch-testing', authenticateToken, patchTestingRoutes);
app.use('/api/allergies', authenticateToken, allergyRoutes);
app.use('/api/appointments', authenticateToken, appointmentsRoutes);
app.use('/api/prescriptions', authenticateToken, prescriptionRoutes);
app.use('/api/translations', authenticateToken, translationRoutes);
app.use('/api/medicine', authenticateToken, medicineRoutes);
app.use('/api/allergy-details', authenticateToken, allergyDetailsRoutes);
app.use('/api/save-instruction', authenticateToken, saveInstructionRoutes);
app.use('/api/followup', authenticateToken, followUpRoutes);
app.use('/api/actual-patch-testing', authenticateToken, actualPatchTestingRoutes);
app.use('/api/patient-patch-test', authenticateToken, patientPatchTestRoutes);

// Add this route for recent activity feed
app.get('/api/activity', async (req, res) => {
  try {
    const limit = 10;
    // Fetch recent patients
    const patients = await mongoose.model('Patient').find({}, 'patientId basicInfo.name createdAt').sort({ createdAt: -1 }).limit(limit).lean();
    // Fetch recent appointments with patient name
    const appointments = await mongoose.model('Appointment').find({}, 'patientId date time purpose createdAt')
      .sort({ createdAt: -1 }).limit(limit)
      .populate('patientId', 'basicInfo.name patientId').lean();
    // Fetch recent prescriptions with medicine details
    const prescriptions = await mongoose.model('Prescription').find({}, 'patientId patientName prescriptionDate createdAt medicines')
      .sort({ createdAt: -1 }).limit(limit).lean();
    // Fetch recent allergies
    const allergies = await mongoose.model('Allergy').find({}, 'name createdAt').sort({ createdAt: -1 }).limit(limit).lean();
    // Fetch recent patch tests with patient name
    const patchTests = await mongoose.model('PatchTesting').find({}, 'patientId createdAt')
      .sort({ createdAt: -1 }).limit(limit)
      .populate('patientId', 'basicInfo.name patientId').lean();
    // Fetch recent actual patch tests (PatientPatchTest) with patient name
    const actualPatchTests = await mongoose.model('PatientPatchTest').find({}, 'patientId date createdAt updatedAt')
      .sort({ updatedAt: -1 }).limit(limit)
      .populate('patientId', 'basicInfo.name patientId').lean();
    // Fetch recent instructions with patient name
    const instructions = await mongoose.model('SaveInstruction').find({}, 'patient createdAt')
      .sort({ createdAt: -1 }).limit(limit)
      .populate('patient', 'basicInfo.name patientId').lean();
    // Fetch recent follow-ups
    const followups = await mongoose.model('FollowUp').find({}, 'patientId visitDate createdAt').sort({ createdAt: -1 }).limit(limit).lean();
    // Fetch recent medicines
    const medicines = await mongoose.model('Medicine').find({}, 'name createdAt').sort({ createdAt: -1 }).limit(limit).lean();

    // Map and tag each type
    const activity = [
      ...patients.map(item => ({
        type: 'patient',
        date: item.createdAt,
        patientId: item.patientId,
        name: item.basicInfo?.name,
        details: `New patient: ${item.basicInfo?.name}`
      })),
      ...appointments.map(item => ({
        type: 'appointment',
        date: item.createdAt,
        patientId: item.patientId?._id || item.patientId,
        name: item.patientId?.basicInfo?.name || '',
        details: `Appointment scheduled for ${item.patientId?.basicInfo?.name || 'Unknown'} (ID: ${item.patientId?.patientId || item.patientId}) on ${item.date} at ${item.time}`
      })),
      ...prescriptions.map(item => ({
        type: 'prescription',
        date: item.createdAt,
        patientId: item.patientId,
        details: `Prescription for ${item.patientName}. Medicines: ${Array.isArray(item.medicines) ? item.medicines.map(m => m.medicineName + (m.dosage ? ` (${m.dosage})` : '')).join(', ') : ''}`
      })),
      ...allergies.map(item => ({
        type: 'allergy',
        date: item.createdAt,
        details: `Allergy added: ${item.name?.english || ''}`
      })),
      ...patchTests.map(item => ({
        type: 'patchTest',
        date: item.createdAt,
        patientId: item.patientId?._id || item.patientId,
        name: item.patientId?.basicInfo?.name || '',
        details: `New allergy test for ${item.patientId?.basicInfo?.name || 'Unknown'} (ID: ${item.patientId?.patientId || item.patientId})`
      })),
      ...actualPatchTests.map(item => {
        const isUpdate = new Date(item.updatedAt) > new Date(item.createdAt);
        return {
          type: 'actualPatchTest',
          date: item.updatedAt || item.createdAt,
          patientId: item.patientId?._id || item.patientId,
          name: item.patientId?.basicInfo?.name || '',
          details: `${isUpdate ? 'Updated' : 'New'} patch test for ${item.patientId?.basicInfo?.name || 'Unknown'} (ID: ${item.patientId?.patientId || item.patientId})`
        };
      }),
      ...instructions.map(item => ({
        type: 'instruction',
        date: item.createdAt,
        patientId: item.patient?._id || item.patient,
        name: item.patient?.basicInfo?.name || '',
        details: `Instruction saved for ${item.patient?.basicInfo?.name || 'Unknown'} (ID: ${item.patient?.patientId || item.patient})`
      })),
      ...medicines.map(item => ({
        type: 'medicine',
        date: item.createdAt,
        details: `Medicine added: ${item.name}`
      })),
      ...followups.map(item => ({
        type: 'followup',
        date: item.createdAt,
        patientId: item.patientId,
        details: `Follow-up for patient ${item.patientId}`
      })),
    ];

    activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(activity.slice(0, 20));
  } catch (err) {
    console.error('Error fetching activity feed:', err);
    res.status(500).json({ error: 'Failed to fetch activity feed', details: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: err.message 
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = require('os').networkInterfaces();
  const localIP = Object.values(networkInterfaces)
    .flat()
    .find(interface => interface.family === 'IPv4' && !interface.internal)?.address;

  console.log('\n=== Server Started ===');
  console.log(`Local URL: http://localhost:${PORT}`);
  if (localIP) {
    console.log(`Network URL: http://${localIP}:${PORT}`);
  }
  console.log('=====================\n');
});