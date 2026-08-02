import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFViewer } from '@react-pdf/renderer';
import AllergyReport from '../utils/AllergyReport';
import { translateAllergens } from '../utils/translationUtils';
import { apiFetch } from '../utils/api';  

const PatchTestReport = () => {
  const [patchTestData, setPatchTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allAllergies, setAllAllergies] = useState([]);

  useEffect(() => {
    fetchPatchTestData();
    fetchAllAllergies();
  }, []);

  const fetchAllAllergies = async () => {
    try {
      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/all`);
      const data = await response.json();
      setAllAllergies(data.data || []);
    } catch (err) {
      setAllAllergies([]);
    }
  };

  const fetchPatchTestData = async () => {
    try {
      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patch-testing/`);
      if (response.data && response.data.length > 0) {
        setPatchTestData(response.data[0]);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch patch test data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Merge user-filled values into allAllergies for the report
  function getMergedAllergens() {
    if (!patchTestData || !patchTestData.allergens || !allAllergies.length) return {};
    const merged = {};
    Object.keys(patchTestData.allergens).forEach(category => {
      // All DB allergies for this category
      const dbAlls = allAllergies.filter(a => (a.category || '').toLowerCase() === category.toLowerCase());
      // Map user-filled by name (case-insensitive)
      const userFilled = (patchTestData.allergens[category] || []);
      const userMap = {};
      userFilled.forEach(u => {
        userMap[(u.name || '').trim().toLowerCase()] = u;
      });
      merged[category] = dbAlls.map(dbA => {
        const key = (dbA.name?.english || '').trim().toLowerCase();
        const userVal = userMap[key];
        return {
          ...dbA,
          val: userVal ? userVal.val : '',
          isChecked: userVal ? userVal.isChecked : false,
        };
      });
    });
    return merged;
  }

  const mergedAllergens = getMergedAllergens();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <PDFViewer style={{ flexGrow: 1, width: '100%' }}>
        {patchTestData && (
          <AllergyReport data={{ ...patchTestData, allergens: mergedAllergens }} allAllergies={allAllergies} />
        )}
      </PDFViewer>
    </div>
  );
};

export default PatchTestReport; 