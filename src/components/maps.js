import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import '../styles/style.css';

// Axios instance with backend base URL from environment variable
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

const Maps = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [mapCenter, setMapCenter] = useState(INDIA_CENTER);
  const [zoom, setZoom] = useState(5);
  const [activeMarker, setActiveMarker] = useState(null);

  useEffect(() => {
    fetchLocations(''); // Load all locations initially
  }, []);

  const fetchLocations = async (search) => {
    try {
      const response = await API.get('/api/maps', {
        params: { q: search || '' },
      });

      const data = response.data || [];
      setResults(data);

      if (data.length > 0 && data[0].position) {
        setMapCenter(data[0].position);
        setZoom(12);
        setActiveMarker(data[0].id);
        setTimeout(() => setActiveMarker(null), 3000);
      } else {
        // No data: fallback center, zoom out
        setMapCenter(INDIA_CENTER);
        setZoom(5);
        setActiveMarker(null);
      }
    } catch (error) {
      console.error('Failed to load map locations', error.response || error.message);
      setResults([]);
      setMapCenter(INDIA_CENTER);
      setZoom(5);
      setActiveMarker(null);
    }
  };

  const handleSearch = () => fetchLocations(query);

  const handleResultClick = (item) => {
    if (!item.position) return;
    setMapCenter(item.position);
    setZoom(12);
    setActiveMarker(item.id);
    setTimeout(() => setActiveMarker(null), 3000);
  };

  return (
    <section className="section">
      <h2>GPS & Maps</h2>
      <p className="muted">Use live maps to find nearest harbours, hangars, or warehouses.</p>

      <div className="filters">
        <input
          id="mapsQuery"
          placeholder="Search by name or type"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      <div className="map-layout">
        <div className="results-panel">
          <h3>Search Results</h3>
          {results.length > 0 ? (
            <ul>
              {results.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleResultClick(item)}
                  style={{
                    cursor: 'pointer',
                    margin: '6px 0',
                    padding: '6px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                  }}
                >
                  <strong>{item.name}</strong> ({item.type})
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </div>

        <div className="map-container">
          <LoadScript googleMapsApiKey="AIzaSyAQdYKsx9bubs4hEs9SqwQPyYyQralHPBo">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '600px', borderRadius: '12px' }}
              center={mapCenter}
              zoom={zoom}
            >
              {results.length > 0 &&
                results.map((loc) =>
                  loc.position ? (
                    <Marker
                      key={loc.id}
                      position={loc.position}
                      title={`${loc.name} (${loc.type})`}
                      icon={{
                        url:
                          loc.type === 'port'
                            ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                            : loc.type === 'hangar'
                            ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                            : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      }}
                      animation={activeMarker === loc.id ? window.google.maps.Animation.BOUNCE : null}
                    />
                  ) : null
                )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </section>
  );
};

export default Maps;
