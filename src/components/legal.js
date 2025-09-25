import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditPage from './Edit';
import '../styles/style.css';

const LegalSupport = () => {
  const [city, setCity] = useState('');
  const [caseType, setCaseType] = useState('contract');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch legal support data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/legal-support', {
        params: { city, caseType }
      });
      setResults(response.data);
    } catch (err) {
      setError('Failed to load legal support data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal for adding new entry
  const openAddModal = () => {
    setEditData(null);
    setIsEditOpen(true);
  };

  // Open modal for editing existing entry
  const openEditModal = (data) => {
    setEditData(data);
    setIsEditOpen(true);
  };

  // Save handler for create/update
  const handleSave = async (data) => {
    try {
      if (data.id) {
        // Update existing record
        await axios.put(`/api/legal-support/${data.id}`, data);
      } else {
        // Create new record
        await axios.post('/api/legal-support', data);
      }
      await fetchData();
      setIsEditOpen(false);
    } catch (err) {
      setError('Failed to save legal support data');
    }
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/legal-support/${id}`);
      setResults(results.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete legal support data');
    }
  };

  return (
    <section className="section">
      <h2>Legal & court support</h2>
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
          <option value="contract">Contract disputes</option>
          <option value="customs">Customs & trade</option>
          <option value="transport">Transport compliance</option>
          <option value="environment">Environment & NOC</option>
        </select>
        <button className="btn btn-primary" onClick={fetchData}>Search</button>
        <button className="btn btn-secondary" onClick={openAddModal}>Add New Entry</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : results.length ? (
        <ul className="list">
          {results.map(item => (
            <li key={item.id}>
              <p><b>City:</b> {item.city}</p>
              <p><b>Case Type:</b> {item.caseType}</p>
              <p><b>Court:</b> {item.courtName}</p>
              <p><b>Lawyer:</b> {item.lawyerName} - {item.lawyerContact}</p>
              <p><b>Acts:</b> {item.applicableActs}</p>
              <p><b>Description:</b> {item.description}</p>
              <button className="btn btn-primary" onClick={() => openEditModal(item)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
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
