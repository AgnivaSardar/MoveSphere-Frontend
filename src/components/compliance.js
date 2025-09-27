import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/style.css';

// Badge component for conditional or required
const Badge = ({ kind, children }) => (
  <span className={`cmp-badge ${kind === 'required' ? 'required' : 'conditional'}`}>
    {children}
  </span>
);

// New Badge style for city (blue box)
const CityBadge = ({ city }) => (
  <span className="city-badge">{city}</span>
);

// Create axios instance with base URL from env var
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

const Compliance = () => {
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [records, setRecords] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadComplianceRecords();
  }, []);

  const loadComplianceRecords = async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const params = {};
      if (category && category.trim() !== '') params.category = category.trim();
      if (city && city.trim() !== '') params.city = city.trim();

      const response = await API.get('/api/compliance', { params });
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        setRecords(data);
      } else {
        setInfo('No compliance records found for selected filters.');
        setRecords([]);
      }
    } catch (err) {
      console.error('Failed to load compliance records:', err);
      setError('Failed to load compliance records from server.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Parse steps string into array for display
  const parseSteps = (stepsString) => {
    if (typeof stepsString !== 'string') return [];
    const stepsArray = stepsString.split(/\d+\.\s*/).filter(Boolean);
    return stepsArray.map((desc) => desc.trim());
  };

  return (
    <section className="section">
      <h2>Compliance Management</h2>
      <p className="muted">Navigate regulatory requirements with step-by-step guidance and official links.</p>

      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          loadComplianceRecords();
        }}
      >
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="export">Export logistics</option>
          <option value="road">Road transport (RTO/trucking)</option>
          <option value="aviation">Aviation cargo</option>
          <option value="ports">Ports & customs</option>
          <option value="environment">Pollution NOCs</option>
        </select>

        <input
          placeholder="City or PIN (optional)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading…' : 'Load steps'}
        </button>
      </form>

      {error && <div className="alert warn">{error}</div>}
      {info && <div className="alert success">{info}</div>}

      <h3 className="cmp-subtitle">Compliance Records</h3>

      <div className="cmp-list">
        {records.map((record) => (
          <div className="cmp-card record" key={record.id} style={{ marginBottom: '20px' }}>
            <h4>{record.category}</h4>
            <CityBadge city={record.city} />
            <div className="step-desc">
              <ol>
                {parseSteps(record.steps).map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Compliance;
