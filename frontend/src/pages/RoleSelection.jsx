import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const RoleSelection = () => {
    const { user, refreshRole } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRoleSelect = async (selectedRole) => {
        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from('profiles')
                .insert([{ id: user.id, role: selectedRole }]);

            if (insertError) {
                setError(insertError.message);
            } else {
                await refreshRole();
                navigate('/');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: '600px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Welcome to Room Finder!</h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
                    Please tell us how you would like to use the app.
                </p>

                {error && <div className="error-message">{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div
                        className="role-card"
                        onClick={() => !loading && handleRoleSelect('room_finder')}
                        style={{
                            border: '2px solid #ffccbc',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#fffaf8'
                        }}
                    >
                        <h3 style={{ color: '#e65100', marginBottom: '0.5rem' }}>I am looking for a room</h3>
                        <p style={{ fontSize: '0.9rem', color: '#757575' }}>
                            Browse listings, use filters, and find your perfect place to stay.
                        </p>
                    </div>

                    <div
                        className="role-card"
                        onClick={() => !loading && handleRoleSelect('room_owner')}
                        style={{
                            border: '2px solid #ffccbc',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#fffaf8'
                        }}
                    >
                        <h3 style={{ color: '#e65100', marginBottom: '0.5rem' }}>I want to list my room</h3>
                        <p style={{ fontSize: '0.9rem', color: '#757575' }}>
                            Create room listings, manage your properties, and find tenants.
                        </p>
                    </div>
                </div>

                {loading && (
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#ff9800' }}>
                        Setting up your profile...
                    </p>
                )}
            </div>
        </div>
    );
};

export default RoleSelection;
