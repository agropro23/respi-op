import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiFetch } from '../utils/api';  

const AllergyImages = () => {
  const [allergyDetails, setAllergyDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllergyDetails();
  }, []);

  const fetchAllergyDetails = async () => {
    try {
      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergy-details`);
      console.log('Fetched details:', response.data);
      
      if (response.data.success) {
        setAllergyDetails(response.data.data);
      } else {
        setError('Failed to fetch allergy details');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching allergy details:', err);
      setError('Failed to fetch allergy details');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Allergy Images</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allergyDetails.map((detail) => {
          const hasValidImage = detail.image && detail.image.data && detail.image.contentType;
          
          return (
            <div key={detail._id} className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm">
              {hasValidImage && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={`data:${detail.image.contentType};base64,${detail.image.data}`}
                    alt={detail.allergenId?.name || 'Allergy image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      console.log('Image data:', detail.image);
                      e.target.style.display = 'none';
                    }}
                    style={{
                      width: '30%',
                      height: '30%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {detail.allergenId?.name || 'Unknown Allergen'}
                </h2>
                <div className="space-y-2">
                  {detail.instructions.map((instruction, index) => (
                    <p key={index} className="text-gray-600 text-sm">
                      • {instruction}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllergyImages; 