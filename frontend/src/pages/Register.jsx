import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Register = () => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('room_finder'); // Default role
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Supabase Magic Link handles both Login and Registration
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: 'http://localhost:3000/',
                    data: {
                        role: role
                    }
                }
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Magic link sent! Check your email to sign up.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Sign Up for Room Finder</h1>

                {message && (
                    <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <select
                            className="form-input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="room_finder">Room Finder (Looking for a room)</option>
                            <option value="room_owner">Room Owner (Want to list a room)</option>
                        </select>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
