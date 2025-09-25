import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import '../styles/style.css';

const GPSMaps = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const [zoom, setZoom] = useState(5);
  const [activeMarker, setActiveMarker] = useState(null);

  // Load all locations initially
  useEffect(() => {
    fetchLocations('');
  }, []);

  const fetchLocations = async (search) => {
    try {
      const response = await axios.get('/api/warehouses', { params: { q: search } });
      setResults(response.data);
      if (response.data.length > 0) {
        setMapCenter(response.data[0].position);
        setZoom(12);
        setActiveMarker(response.data[0].id);
        setTimeout(() => setActiveMarker(null), 3000);
      }
    } catch (error) {
      console.error('Failed to load warehouse locations', error);
      setResults([]);
    }
  };

  const handleSearch = () => {
    fetchLocations(query);
  };

  const handleResultClick = (item) => {
    setMapCenter(item.position);
    setZoom(12);
    setActiveMarker(item.id);
    setTimeout(() => setActiveMarker(null), 3000);
  };

  return (
    <section className="section">
      <h2>GPS & Maps</h2>
      <p className="muted">
        Use live maps to find nearest offices, warehouses, ports, or depots.
      </p>

      <div className="filters">
        <input
          id="mapsQuery"
          placeholder="Search e.g., warehouse Mumbai"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" id="searchMaps" onClick={handleSearch}>
          Search
        </button>
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
                  {item.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No search results yet.</p>
          )}
        </div>

        <div className="map-container">
          <LoadScript googleMapsApiKey="AIzaSyAQdYKsx9bubs4hEs9SqwQPyYyQralHPBo">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '600px', borderRadius: '12px' }}
              center={mapCenter}
              zoom={zoom}
            >
              {results.map((loc) => (
                <Marker
                  key={loc.id}
                  position={loc.position}
                  title={loc.name}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  }}
                  animation={
                    activeMarker === loc.id ? window.google.maps.Animation.BOUNCE : null
                  }
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </section>
  );
};

export default GPSMaps;
