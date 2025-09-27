import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/style.css';
import EditPage from './Edit';

// Create axios instance with base URL from environment variable
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState(''); // Search state

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Data states
  const [inventory, setInventory] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [storage, setStorage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data by tab
  const loadData = async (tab) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (tab === 'inventory') {
        response = await API.get('/api/inventory');
        setInventory(response.data);
      } else if (tab === 'fleet') {
        response = await API.get('/api/vehicles');
        setFleet(response.data);
      } else if (tab === 'storage') {
        response = await API.get('/api/warehouses');
        setStorage(response.data);
      }
    } catch (err) {
      setError(`Failed to load ${tab} data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
    setSearchQuery(''); // reset search on tab change
  }, [activeTab]);

  // Tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Generate next auto-increment ID
  const getNextId = (data, key) => {
    if (!data || data.length === 0) return '1';
    const ids = data.map(item => parseInt(item[key]) || 0);
    return String(Math.max(...ids) + 1);
  };

  // Save handler for create/update
  const handleSave = async (data) => {
    try {
      if (activeTab === 'inventory') {
        if (!data.itemId) data.itemId = getNextId(inventory, 'itemId'); // auto-increment
        if (data.itemId && inventory.some(i => i.itemId === data.itemId)) {
          await API.put(`/api/inventory/${data.itemId}`, data);
          setInventory(prev => prev.map(item => (item.itemId === data.itemId ? data : item)));
        } else {
          const response = await API.post('/api/inventory', data);
          setInventory(prev => [...prev, response.data]);
        }
      } else if (activeTab === 'fleet') {
        if (!data.vehicleId) data.vehicleId = getNextId(fleet, 'vehicleId');
        if (data.vehicleId && fleet.some(v => v.vehicleId === data.vehicleId)) {
          await API.put(`/api/vehicles/${data.vehicleId}`, data);
          setFleet(prev => prev.map(item => (item.vehicleId === data.vehicleId ? data : item)));
        } else {
          const response = await API.post('/api/vehicles', data);
          setFleet(prev => [...prev, response.data]);
        }
      } else if (activeTab === 'storage') {
        if (!data.id) data.id = getNextId(storage, 'id');
        if (data.id && storage.some(w => w.id === data.id)) {
          await API.put(`/api/warehouses/${data.id}`, data);
          setStorage(prev => prev.map(item => (item.id === data.id ? data : item)));
        } else {
          const response = await API.post('/api/warehouses', data);
          setStorage(prev => [...prev, response.data]);
        }
      }

      setIsEditOpen(false);
    } catch {
      setError('Failed to save data.');
    }
  };

  // Edit button handler
  const handleEdit = (item, index) => {
    setEditData({ ...item, index });
    setIsEditOpen(true);
  };

  // Filter data by search
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    const data = activeTab === 'inventory' ? inventory :
                 activeTab === 'fleet' ? fleet :
                 storage;

    if (!query) return data;

    return data.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(query))
    );
  };

  // Render data table
  const renderTable = (data, fields) => (
    <table className="table">
      <thead>
        <tr>
          {fields.map((f, idx) => <th key={idx}>{f}</th>)}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {fields.map((f, idx) => <td key={idx}>{row[f.toLowerCase()]}</td>)}
            <td>
              <button className="btn btn-primary" onClick={() => handleEdit(row, i)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <section className="section">
      <h2>Company Dashboard</h2>
      <p className="muted">
        Connect a Google Sheet or use the in-app table to track inventory, fleet, and storage.
      </p>

      <div className="tabs">
        {['inventory', 'fleet', 'storage'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ margin: '10px 0' }}>
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ padding: '5px', width: '250px' }}
        />
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={() => { setEditData(null); setIsEditOpen(true); }}>
          Add {activeTab === 'inventory' ? 'Item' : activeTab === 'fleet' ? 'Vehicle' : 'Warehouse'}
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {activeTab === 'inventory' && renderTable(getFilteredData(), ['Item', 'Description', 'Quantity'])}
      {activeTab === 'fleet' && renderTable(getFilteredData(), ['Type', 'Id', 'Status'])}
      {activeTab === 'storage' && renderTable(getFilteredData(), ['Id', 'Type', 'Name', 'City', 'State'])}

      <EditPage
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        editData={editData}
        resourceType={activeTab}
      />
    </section>
  );
};

export default CompanyDashboard;
