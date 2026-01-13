import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const MyRooms = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myRooms, setMyRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyRooms = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`/api/rooms/?owner_id=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch rooms');
            const data = await response.json();
            setMyRooms(data.results || data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchMyRooms();
        } else {
            setIsLoading(false);
            setMyRooms([]);
        }
    }, [user, fetchMyRooms]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this room?")) {
            try {
                const response = await fetch(`http://localhost:8000/api/rooms/${id}/`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setMyRooms(prevRooms => prevRooms.filter(room => room.id !== id));
                } else {
                    alert("Failed to delete room. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting room:", error);
                alert("An error occurred while deleting.");
            }
        }
    };

    return (
        <div className="home-container">
            <h1 className="hero-title" style={{ fontSize: '2rem' }}>My Rooms</h1>

            {isLoading ? (
                <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>Loading your rooms...</div>
            ) : (
                <>
                    {myRooms.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            fontSize: '1.2rem',
                            color: '#666',
                            marginTop: '3rem'
                        }}>
                            {!user ? (
                                <div>
                                    <p>Please <Link to="/login" style={{ color: 'var(--primary-color)' }}>login</Link> to view your rooms.</p>
                                </div>
                            ) : (
                                "You have not added any rooms yet."
                            )}
                        </div>
                    ) : (
                        <div className="room-grid">
                            {myRooms.map(room => (
                                <div key={room.id} className="room-card">
                                    <h3>{room.title}</h3>
                                    <p className="room-info">📍 {room.location}</p>
                                    <p className="room-info">🏠 {room.type}</p>
                                    <p className="room-info">👥 {room.preference}</p>
                                    <p className="room-price">${room.price}/mo</p>

                                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                        <button
                                            className="search-btn"
                                            onClick={() => handleDelete(room.id)}
                                            style={{
                                                padding: '0.6rem 1.2rem',
                                                fontSize: '0.9rem',
                                                backgroundColor: 'var(--primary-color)'
                                            }}
                                        >
                                            Delete
                                        </button>

                                        <button
                                            className="search-btn"
                                            onClick={() => navigate(`/edit-room/${room.id}`)}
                                            style={{
                                                padding: '0.6rem 1.2rem',
                                                fontSize: '0.9rem',
                                                opacity: 0.8
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyRooms;
