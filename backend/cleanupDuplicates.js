const mongoose = require('mongoose');
const PatientPatchTest = require('./models/PatientPatchTest');
require('dotenv').config();

async function cleanupDuplicates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find all patch tests and group by patientId
    const allPatchTests = await PatientPatchTest.find().sort({ date: -1 });
    console.log(`Found ${allPatchTests.length} total patch tests`);

    const patientGroups = {};
    const duplicatesToDelete = [];

    // Group by patientId and identify duplicates
    allPatchTests.forEach(patchTest => {
      const patientId = patchTest.patientId.toString();
      if (!patientGroups[patientId]) {
        patientGroups[patientId] = patchTest;
      } else {
        // This is a duplicate, mark for deletion
        duplicatesToDelete.push(patchTest._id);
      }
    });

    console.log(`Found ${Object.keys(patientGroups).length} unique patients`);
    console.log(`Found ${duplicatesToDelete.length} duplicate entries to delete`);

    if (duplicatesToDelete.length > 0) {
      // Delete duplicates
      const deleteResult = await PatientPatchTest.deleteMany({
        _id: { $in: duplicatesToDelete }
      });
      console.log(`Deleted ${deleteResult.deletedCount} duplicate entries`);
    }

    // Create unique index
    try {
      await PatientPatchTest.collection.createIndex(
        { patientId: 1 }, 
        { unique: true }
      );
      console.log('Unique index created successfully on patientId');
    } catch (error) {
      console.log('Index creation error (might already exist):', error.message);
    }

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDuplicates(); 