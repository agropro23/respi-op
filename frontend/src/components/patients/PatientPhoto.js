import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image, Upload, X, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import styles from './PatientPhoto.module.css';

const API_BASE_URL = `${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients`;

const PatientPhoto = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPatientAndPhotos = async () => {
        try {
            // Fetch patient data
            const patientResponse = await apiFetch(`${API_BASE_URL}/${patientId}`);
            if (!patientResponse.ok) throw new Error('Failed to fetch patient');
            const patientData = await patientResponse.json();
            setPatient(patientData);

            // Fetch patient photos
            const photosResponse = await apiFetch(`${API_BASE_URL}/fori/${patientId}`);
            if (!photosResponse.ok) throw new Error('Failed to fetch photos');
            const photosData = await photosResponse.json();
            setPhotos(photosData.images || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientAndPhotos();
    }, [patientId]);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);

        if (files.length === 0) return;
        if (files.length + photos.length > 12) {
            setError('Maximum 12 photos allowed');
            return;
        }

        // Check file sizes on frontend (5MB limit)
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > maxFileSize);

        if (oversizedFiles.length > 0) {
            const oversizedNames = oversizedFiles
                .map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`)
                .join(', ');
            setError(`File size exceeds 5MB limit. Please optimize your images. Oversized: ${oversizedNames}`);
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await apiFetch(`${API_BASE_URL}/fori/${patientId}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload images');
            }

            const successData = await response.json();
            console.log('[Image Upload Success]', successData);

            await fetchPatientAndPhotos(); // Refresh images after upload
        } catch (err) {
            console.error('[Image Upload Error]', err);
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await apiFetch(`${API_BASE_URL}/fori/${patientId}/${imageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete image');

            await fetchPatientAndPhotos(); // Refresh images after deletion
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <button
                                className="btn btn-link text-secondary p-0 me-3"
                                onClick={() => navigate(`/patients/${patientId}`)}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h5 className="card-title mb-1">Patient Photos</h5>
                                <p className="text-muted mb-0 small">
                                    Upload and manage patient photos ({photos.length}/12)
                                </p>
                            </div>
                        </div>
                        <div>
                            <input
                                type="file"
                                id="photo-upload"
                                multiple
                                accept="image/*"
                                className="d-none"
                                onChange={handleFileUpload}
                                disabled={uploading || photos.length >= 12}
                            />
                            <label
                                htmlFor="photo-upload"
                                className={`btn d-flex align-items-center gap-2 ${
                                    uploading || photos.length >= 12 
                                        ? 'btn-secondary disabled' 
                                        : 'btn-primary'
                                }`}
                                style={{ 
                                    cursor: (uploading || photos.length >= 12) ? 'not-allowed' : 'pointer' 
                                }}
                            >
                                <Upload size={16} />
                                {uploading ? 'Uploading...' : 
                                 photos.length >= 12 ? 'Limit Reached' : 'Add Photos'}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    {loading ? (
                        <div className="text-center py-4">Loading images...</div>
                    ) : photos.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <Image size={48} className="mb-3 opacity-50" />
                            <p>No photos uploaded yet</p>
                        </div>
                    ) : (
                        <div className={styles.photoGrid}>
                            {photos.map((image, index) => (
                                <div key={image._id} className={styles.photoContainer}>
                                    <img
                                        src={`data:${image.contentType};base64,${image.data}`}
                                        alt={`Patient photo ${index + 1}`}
                                        className={styles.photo}
                                    />
                                    <div className={styles.imageInfo}>
                                        <span className={styles.uploadDate}>
                                            {new Date(image.uploadedAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteImage(image._id)}
                                            title="Delete photo"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientPhoto;