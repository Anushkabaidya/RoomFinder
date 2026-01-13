import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const INITIAL_STATE = {
    title: '',
    location: '',
    price: '',
    type: '1 BHK',
    preference: 'Bachelor',
    contact: '',
    image: ''
};

const EditRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, role } = useAuth();

    const [formData, setFormData] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [newImage, setNewImage] = useState(null);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/rooms/${id}/`);
                if (!response.ok) throw new Error('Room not found');
                const data = await response.json();

                // Verify ownership (optional but good practice)
                if (data.owner_id !== user.id) {
                    setMessage({ type: 'error', text: 'You do not have permission to edit this room.' });
                    setLoading(false);
                    return;
                }

                setFormData({
                    title: data.title,
                    location: data.location,
                    price: data.price,
                    type: data.type,
                    preference: data.preference,
                    contact: data.contact,
                    image: data.image
                });
            } catch (error) {
                console.error("Fetch error:", error);
                setMessage({ type: 'error', text: 'Failed to load room details.' });
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchRoomDetails();
    }, [id, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);

        try {
            let imageUrl = formData.image;

            // 1. Upload new image if provided
            if (newImage) {
                const fileExt = newImage.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('Room Images')
                    .upload(filePath, newImage);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('Room Images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // 2. Update Backend
            const payload = {
                ...formData,
                image: imageUrl,
                owner_id: user.id,
                role: role
            };

            const response = await fetch(`http://localhost:8000/api/rooms/${id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to update room');

            setMessage({ type: 'success', text: 'Listing updated successfully!' });
            setTimeout(() => navigate('/my-rooms'), 1500);

        } catch (error) {
            console.error("Update error:", error);
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="add-room-container"><h3>Loading room data...</h3></div>;

    return (
        <div className="add-room-container">
            <h2>Edit Room Listing</h2>

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
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input
                        type="text"
                        name="location"
                        className="form-input"
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
                        value={formData.contact}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Current Image</label>
                    {formData.image && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <img src={formData.image} alt="Room" style={{ width: '100px', borderRadius: '4px' }} />
                        </div>
                    )}
                    <label className="form-label" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Change Image (Optional):</label>
                    <input
                        type="file"
                        className="form-input"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ flex: 2 }}>
                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        className="nav-btn"
                        onClick={() => navigate('/my-rooms')}
                        style={{ flex: 1, backgroundColor: '#eee', color: '#333' }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditRoom;
