import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const INITIAL_STATE = {
    title: '',
    location: '',
    price: '',
    type: '1 BHK',
    preference: 'Bachelor',
    contact: '',
    images: null
};

const AddRoom = () => {
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // New state for explicit success flow
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!user) {
            setMessage({ type: 'error', text: 'You must be logged in to add a room.' });
        }
    }, [user]);

    const resetForm = () => {
        setFormData(INITIAL_STATE);
        setIsSuccess(false);
        setMessage({ type: '', text: '' });
        // Reset the file input manually
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            images: e.target.files
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        console.log("Submit triggered. Current Role:", role);

        if (!user) {
            setMessage({ type: 'error', text: 'Please login to add a room.' });
            return;
        }

        if (!role || role !== 'room_owner') {
            console.error("RBAC Check failed. Role is:", role);
            setMessage({ type: 'error', text: 'Authorization error: Only room owners can list rooms.' });
            return;
        }

        if (!formData.title || !formData.location || !formData.price || !formData.contact) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }

        setIsSubmitting(true);
        let imageUrl = '';

        try {
            console.log("Step 1: Checking for image upload...");
            // 1. Upload Image to Supabase Storage
            if (formData.images && formData.images.length > 0) {
                const file = formData.images[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                console.log("Uploading to 'Room Images' bucket...");
                const { error: uploadError } = await supabase.storage
                    .from('Room Images')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Supabase Upload Error:", uploadError);
                    throw new Error(`Failed to upload image: ${uploadError.message}`);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('Room Images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
                console.log("Image uploaded. URL:", imageUrl);
            }

            // 2. Submit Data to Backend
            const payload = {
                title: formData.title,
                location: formData.location,
                price: formData.price,
                type: formData.type,
                preference: formData.preference,
                contact: formData.contact,
                owner_id: user.id,
                image: imageUrl,
                role: role
            };

            console.log("Step 2: Sending payload to backend:", payload);
            const response = await fetch('/api/rooms/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Backend Error Details:", errorData);
                throw new Error('Failed to save room details on server');
            }

            // SUCCESS FLOW
            console.log("SUCCESS: Room added.");
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Submission HANG or FAILURE:", error);
            setMessage({ type: 'error', text: `Failed to add room: ${error.message}. Please check if you are connected to the database.` });
        } finally {
            console.log("Process complete. Resetting submission state.");
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="add-room-container">
                <div className="login-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ color: '#4caf50', marginBottom: '1rem' }}>🎉 Room Added Successfully!</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>
                        Your listing "<strong>{formData.title}</strong>" is now live.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="search-btn" onClick={resetForm}>
                            Add Another Room
                        </button>
                        <button
                            className="nav-btn"
                            style={{ backgroundColor: '#eee', color: '#333' }}
                            onClick={() => navigate('/my-rooms')}
                        >
                            View My Rooms
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="add-room-container">
            <h2>Add New Room</h2>

            {message.text && (
                <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Room Title *</label>
                    <input
                        type="text"
                        name="title"
                        className="form-input"
                        placeholder="e.g. Sunny Apartment with Balcony"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Location / Address *</label>
                    <input
                        type="text"
                        name="location"
                        className="form-input"
                        placeholder="e.g. 123 Main St, Downtown"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Rent Price ($/month) *</label>
                    <input
                        type="number"
                        name="price"
                        className="form-input"
                        placeholder="e.g. 1200"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Property Type</label>
                    <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="Studio">Studio</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Tenant Preference</label>
                    <select name="preference" className="form-select" value={formData.preference} onChange={handleChange}>
                        <option value="Bachelor">Bachelor</option>
                        <option value="Family">Family</option>
                        <option value="Girls">Girls</option>
                        <option value="Working Professionals">Working Professionals</option>
                        <option value="Any">Any</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Contact Number *</label>
                    <input
                        type="text"
                        name="contact"
                        className="form-input"
                        placeholder="e.g. +1 555-0199"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Room Image (Optional)</label>
                    <input
                        type="file"
                        name="images"
                        className="form-input"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Room'}
                </button>
            </form>
        </div>
    );
};

export default AddRoom;
