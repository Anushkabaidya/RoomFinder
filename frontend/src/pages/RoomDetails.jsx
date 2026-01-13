import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRoomDetails = useCallback(async () => {
        try {
            const response = await fetch(`/api/rooms/${id}/`);
            if (!response.ok) {
                throw new Error('Room not found');
            }
            const data = await response.json();
            setRoom(data);
        } catch (err) {
            console.error("Error fetching room details:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRoomDetails();
    }, [fetchRoomDetails]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
            try {
                const response = await fetch(`/api/rooms/${id}/`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    navigate('/my-rooms');
                } else {
                    alert("Failed to delete room. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting room:", error);
                alert("An error occurred while deleting.");
            }
        }
    };

    if (isLoading) return <div className="loading-container">Loading room details...</div>;
    if (error) return <div className="error-container">Error: {error} <br /><Link to="/">Return Home</Link></div>;
    if (!room) return null;

    const isOwner = user && user.id === room.owner_id;

    return (
        <div className="room-details-container">
            <Link to="/" className="back-btn">← Back to Rooms</Link>

            <div className="details-card">
                {room.image ? (
                    <img src={room.image} alt={room.title} className="details-image" />
                ) : (
                    <div className="details-image-placeholder">No Image Available</div>
                )}

                <div className="details-info">
                    {isOwner && <span className="owner-badge">Posted by You</span>}

                    <h1 className="details-title">{room.title}</h1>
                    <p className="details-location">📍 {room.location}</p>

                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="detail-label">Price</span>
                            <span className="detail-value price">${room.price}/mo</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Type</span>
                            <span className="detail-value">{room.type}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Preference</span>
                            <span className="detail-value">{room.preference}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Contact</span>
                            <span className="detail-value">{room.contact}</span>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="owner-actions">
                            <button onClick={handleDelete} className="delete-btn-large">
                                Delete Listing
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;
