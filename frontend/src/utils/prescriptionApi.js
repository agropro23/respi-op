import { apiFetch } from './api';

const API_BASE_URL = `${process.env.REACT_APP_CLIENT_BASE_URL}/api`;

export const prescriptionApi = {
    create: async (prescriptionData) => {
        const response = await apiFetch(`${API_BASE_URL}/prescriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prescriptionData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create prescription');
        }
        
        return response.json();
    },

    getByPatient: async (patientId) => {
        const response = await apiFetch(`${API_BASE_URL}/prescriptions/patient/${patientId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch prescriptions');
        }
        
        return response.json();
    },

    getById: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/prescriptions/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch prescription');
        }
        
        return response.json();
    }
};