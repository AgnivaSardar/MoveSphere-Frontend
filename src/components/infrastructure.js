import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/style.css';

// Create axios instance with base URL from environment variable
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

const Infrastructure = () => {
  const [city, setCity] = useState('');
  const [type, setType] = useState('any'); // 'any' means no filter for type
  const [ownership, setOwnership] = useState('any'); // 'any' means no filter
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.city && filters.city.trim() !== '') {
        params.city = filters.city.trim();
      }
      if (filters.type && filters.type !== 'any') {
        params.type = filters.type;
      }
      if (filters.ownership && filters.ownership !== 'any') {
        params.ownership = filters.ownership;
      }

      const response = await API.get('/api/infrastructure', { params });
      setResults(response.data);
    } catch (err) {
      setError('Failed to load infrastructure data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load all data on initial mount
  useEffect(() => {
    handleSearch({});
  }, []);

  // Trigger search with current filters
  const onSearchClick = () => {
    handleSearch({ city, type, ownership });
  };

  return (
    <section className="section">
      <h2>Infrastructure directory</h2>
      <p className="muted">Search warehouses, hangars, ports, and depots by city and filters.</p>

      <div className="filters">
        <input
          id="infraCity"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <select
          id="infraType"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="any">Any type</option>
          <option value="warehouse">Warehouse</option>
          <option value="hangar">Airport Hangar</option>
          <option value="port">Port/Harbour</option>
          <option value="depot">Truck Depot</option>
        </select>

        <select
          id="ownership"
          value={ownership}
          onChange={(e) => setOwnership(e.target.value)}
        >
          <option value="any">Any ownership</option>
          <option value="government">Government</option>
          <option value="private">Private</option>
        </select>

        <button className="btn btn-primary" id="searchInfra" onClick={onSearchClick}>
          Search
        </button>
      </div>

      <div id="infraResults" className="cards grid-list">
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : results.length > 0 ? (
          results.map(({ id, name, ownership, description }) => (
            <div key={id} className="card">
              <h3>{name}</h3>
              <p><strong>Ownership:</strong> {ownership}</p>
              <p>{description}</p>
            </div>
          ))
        ) : (
          <p>No results to display.</p>
        )}
      </div>
    </section>
  );
};

export default Infrastructure;
