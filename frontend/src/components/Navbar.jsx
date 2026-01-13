import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, role, signOut } = useAuth();
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span>Room Finder</span>
            </div>
            <div className="navbar-links">
                <Link to="/" className="nav-btn">Home</Link>

                {user && role === 'room_owner' && (
                    <>
                        <Link to="/add-room" className="nav-btn">Add Room</Link>
                        <Link to="/my-rooms" className="nav-btn">My Rooms</Link>
                    </>
                )}

                {!user ? (
                    <>
                        <Link to="/login" className="nav-btn">Login</Link>
                        <Link to="/register" className="nav-btn">Register</Link>
                    </>
                ) : (
                    <button onClick={signOut} className="nav-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
