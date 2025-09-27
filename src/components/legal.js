import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditPage from './Edit';
import '../styles/style.css';

// Axios instance configured with backend base URL from environment variable
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

const LegalSupport = () => {
  const [city, setCity] = useState('');
  const [caseType, setCaseType] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch data with optional filters
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/api/legal-support', {
        params: {
          city: city.trim(),
          caseType: caseType.trim(),
        },
      });
      setResults(response.data);
    } catch (err) {
      setError('Failed to load legal support data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modal handlers
  const openAddModal = () => {
    setEditData(null);
    setIsEditOpen(true);
  };

  const openEditModal = (data) => {
    setEditData(data);
    setIsEditOpen(true);
  };

  // Save handler
  const handleSave = async (data) => {
    try {
      if (data.id) {
        await API.put(`/api/legal-support/${data.id}`, data);
      } else {
        await API.post('/api/legal-support', data);
      }
      await fetchData();
      setIsEditOpen(false);
    } catch {
      setError('Failed to save legal support data');
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/api/legal-support/${id}`);
      setResults(results.filter(item => item.id !== id));
    } catch {
      setError('Failed to delete legal support data');
    }
  };

  return (
    <section className="section">
      <h2>Legal & Court Support</h2>
      <p className="muted">
        Find relevant courts, hall numbers, lawyers, and related acts for trade disputes.
      </p>

      <div className="filters">
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <select value={caseType} onChange={(e) => setCaseType(e.target.value)}>
          <option value="">-- All Case Types --</option>
          <option value="Contract Disputes">Contract Disputes</option>
          <option value="Customs and Trades">Customs and Trades</option>
          <option value="Transport Compliance">Transport Compliance</option>
          <option value="Environment and NOC">Environment and NOC</option>
        </select>
        <button className="btn btn-primary" onClick={fetchData}>Search</button>
        <button className="btn btn-secondary" onClick={openAddModal}>Add New Entry</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : results.length ? (
        <div className="legal-list">
          {results.map(item => (
            <div key={item.id} className="legal-card">
              <div className="legal-head">
                <div className="legal-title">
                  <span className="ico">🏛️</span>
                  <div>
                    <div className="name">{item.caseType || 'Case'}</div>
                    <div className="meta">
                      <span className="pill">{item.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="legal-body">
                <p><strong>Court:</strong> {item.courtName}</p>
                <p><strong>Lawyer:</strong> {item.lawyerName} - {item.lawyerContact}</p>
                <p><strong>Acts:</strong> {item.applicableActs}</p>
                <p><strong>Description:</strong> {item.description}</p>
              </div>

              <div className="legal-actions">
                <button className="btn btn-primary" onClick={() => openEditModal(item)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No search results yet.</p>
      )}

      <EditPage
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        editData={editData}
        resourceType="legalSupport"
      />
    </section>
  );
};

export default LegalSupport;
