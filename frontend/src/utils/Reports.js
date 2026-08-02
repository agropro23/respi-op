import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AllergyReport from './AllergyReport';
import { translateAllergens } from '../utils/translationUtils';

const dummyReportData = [{
  "allergens": {
    "Pollens": [
      { "allergenId": "1", "name": "Grass Pollen", "val": 1, "isChecked": false, "_id": "a1" },
      { "allergenId": "2", "name": "Tree Pollen", "val": 2, "isChecked": false, "_id": "a2" }
    ],
    "Fungi": [
      { "allergenId": "3", "name": "Alternaria", "val": 1, "isChecked": true, "_id": "a3" }
    ],
    "Mites": [],
    "Dusts": [],
    "Insects": [],
    "Dander/Epithelia": [],
    "Foods": [],
    "Miscellaneous": []
  },
  "_id": "report123",
  "patientId": {
    "basicInfo": { "name": "Harshil", "age": 20, "sex": "Male" },
    "_id": "patient001"
  },
  "reportType": "Patch Test",
  "positive": 10,
  "negative": 10,
  "createdAt": "2025-05-29T09:07:31.659Z",
  "updatedAt": "2025-05-29T09:07:31.659Z",
  "__v": 0
}];

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDownloadLink, setShowDownloadLink] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setShowDownloadLink(false);

    try {
      const enriched = { ...dummyReportData[0] };
      console.log('Starting translation process...');
      enriched.allergens = await translateAllergens(enriched.allergens);
      console.log('Translation completed:', enriched.allergens);
      setReportData(enriched);
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Failed to generate report with translations. Please try again.');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (reportData) {
      setShowDownloadLink(true);
    }
  }, [reportData]);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1 fw-semibold">Reports</h5>
            <p className="text-muted mb-0 small">View and generate reports</p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        {!reportData && (
          <button
            className="btn btn-primary px-4 py-2"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? 'Translating and generating...' : '📄 Generate PDF Report'}
          </button>
        )}

        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}

        {reportData && showDownloadLink && (
          <div className="mt-3">
            <PDFDownloadLink
              document={<AllergyReport data={reportData} />}
              fileName={`Allergy_Report_${reportData.patientId?.basicInfo?.name?.replace(/\s+/g, '_') || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`}
              className="btn btn-success px-4 py-2"
            >
              {({ loading }) => loading ? 'Preparing document...' : '📥 Download PDF'}
            </PDFDownloadLink>
            
            <button
              className="btn btn-secondary px-4 py-2 ms-2"
              onClick={() => {
                setReportData(null);
                setShowDownloadLink(false);
              }}
            >
              🔄 Generate New Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;