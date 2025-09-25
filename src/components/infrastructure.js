import React, { useState } from 'react';
import axios from 'axios';
import '../styles/style.css';

const Infrastructure = () => {
  const [city, setCity] = useState('');
  const [type, setType] = useState('warehouse');
  const [ownership, setOwnership] = useState('any');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/infrastructure', {
        params: { city, type, ownership },
      });
      setResults(response.data);
    } catch (err) {
      setError('Failed to load infrastructure data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h2>Infrastructure directory</h2>
      <p className="muted">
        Search warehouses, hangars, ports, and depots by city and filters.
      </p>

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

        <button className="btn btn-primary" id="searchInfra" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div id="infraResults" className="cards grid-list">
        {error && <p style={{ color:'red' }}>{error}</p>}
        {loading ? <p>Loading...</p> : (results.length > 0 ? (
          results.map(({ id, name, ownership, description }) => (
            <div key={id} className="card">
              <h3>{name}</h3>
              <p><strong>Ownership:</strong> {ownership}</p>
              <p>{description}</p>
            </div>
          ))
        ) : (
          <p>No results to display.</p>
        ))}
      </div>
    </section>
  );
};

export default Infrastructure;
