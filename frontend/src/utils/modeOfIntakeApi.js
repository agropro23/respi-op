// Utility for reading and writing modeOfIntake.json
import { apiFetch } from './api';

const API_BASE_URL = `${process.env.REACT_APP_CLIENT_BASE_URL}/api/prescriptions`;

export async function getModesOfIntake() {
    const response = await apiFetch(`${API_BASE_URL}/mode-of-intake`, {
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to load modes of intake');
    return response.json();
}

export async function addModeOfIntake(newMode) {
    const response = await apiFetch(`${API_BASE_URL}/mode-of-intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add mode of intake');
    }
    return response.json();
}

export async function deleteModeOfIntake(mode) {
    const response = await apiFetch(`${API_BASE_URL}/mode-of-intake/${encodeURIComponent(mode)}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete mode of intake');
    }
    return response.json();
}