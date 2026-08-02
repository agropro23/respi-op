import { pdf } from '@react-pdf/renderer';
import AllergyReport from './AllergyReport';

const useReportDownload = () => {
  const downloadReport = async (reportData, patientId, allAllergies = [], selectedDoctor = null) => {
    if (!reportData) {
      console.error('No report data provided for download.');
      return;
    }

    try {
      const blob = await pdf(<AllergyReport data={reportData} allAllergies={allAllergies} selectedDoctor={selectedDoctor} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `allergy_test_report-${patientId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating or downloading PDF:', error);
      // You might want to show a user-friendly error message here
    }
  };

  return { downloadReport };
};

export default useReportDownload; 