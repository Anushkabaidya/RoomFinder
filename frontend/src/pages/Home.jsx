import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Filter States
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [propertyType, setPropertyType] = useState('Any');
    const [preference, setPreference] = useState('Any');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async (query = '', min = '', max = '', type = 'Any', pref = 'Any') => {
        setIsLoading(true);
        try {
            // Build Query Params
            const params = new URLSearchParams();
            if (query) params.append('location', query);
            if (min) params.append('min_price', min);
            if (max) params.append('max_price', max);
            if (type !== 'Any') params.append('type', type);
            if (pref !== 'Any') params.append('preference', pref);

            const url = `/api/rooms/?${params.toString()}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }
            const data = await response.json();
            setRooms(data.results || data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setHasSearched(true);
        fetchRooms(searchTerm, minPrice, maxPrice, propertyType, preference);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1 className="hero-title">Find Rooms Easily</h1>
                <p className="hero-subtitle">Search verified rooms by location, price, and preferences.</p>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by location"
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="search-btn" onClick={handleSearch}>Search</button>
                </div>

                {/* Filter Section */}
                <div className="filter-container">
                    <div className="filter-group">
                        <input
                            type="number"
                            placeholder="Min Price"
                            className="filter-input"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span style={{ color: '#666' }}>-</span>
                        <input
                            type="number"
                            placeholder="Max Price"
                            className="filter-input"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                        >
                            <option value="Any">Any Type</option>
                            <option value="1 BHK">1 BHK</option>
                            <option value="2 BHK">2 BHK</option>
                            <option value="3 BHK">3 BHK</option>
                            <option value="Studio">Studio</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={preference}
                            onChange={(e) => setPreference(e.target.value)}
                        >
                            <option value="Any">Any Preference</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Family">Family</option>
                            <option value="Girls">Girls</option>
                            <option value="Working Professionals">Working Professionals</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>Loading...</div>
            ) : (
                <>
                    {rooms.length === 0 ? (
                        <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
                            {hasSearched ? "No rooms match the selected filters." : "No rooms available."}
                        </div>
                    ) : (
                        <div className="room-grid">
                            {rooms.map(room => (
                                <Link to={`/room/${room.id}`} key={room.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="room-card">
                                        <h3>{room.title}</h3>
                                        <p className="room-info">📍 {room.location}</p>
                                        <p className="room-info">🏠 {room.type}</p>
                                        <p className="room-info">👥 {room.preference}</p>
                                        <p className="room-price">${room.price}/mo</p>
                                        <div className="room-contact">
                                            📞 {room.contact}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;
