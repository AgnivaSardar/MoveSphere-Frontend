import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/style.css';
import EditPage from './Edit';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');

  // State for modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null); // null for add, object for edit

  // Data states
  const [inventory, setInventory] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [storage, setStorage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to load data based on active tab
  const loadData = async (tab) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (tab === 'inventory') {
        response = await axios.get('/api/inventory');
        setInventory(response.data);
      } else if (tab === 'fleet') {
        response = await axios.get('/api/vehicle'); // Adjust route name as needed
        setFleet(response.data);
      } else if (tab === 'storage') {
        response = await axios.get('/api/warehouse'); // Adjust route name as needed
        setStorage(response.data);
      }
    } catch (err) {
      setError(`Failed to load ${tab} data`);
    } finally {
      setLoading(false);
    }
  };

  // Load data every time active tab changes
  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Save handler updated to call backend APIs accordingly
  const handleSave = async (data) => {
    try {
      if (activeTab === 'inventory') {
        if (data.itemId) {
          // Update existing item
          await axios.put(`/api/inventory/${data.itemId}`, data);
          setInventory((prev) =>
            prev.map((item) => (item.itemId === data.itemId ? data : item))
          );
        } else {
          // Add new item
          const response = await axios.post('/api/inventory', data);
          setInventory((prev) => [...prev, response.data]);
        }
      } else if (activeTab === 'fleet') {
        if (data.vehicleId) {
          await axios.put(`/api/vehicle/${data.vehicleId}`, data);
          setFleet((prev) =>
            prev.map((item) => (item.vehicleId === data.vehicleId ? data : item))
          );
        } else {
          const response = await axios.post('/api/vehicle', data);
          setFleet((prev) => [...prev, response.data]);
        }
      } else if (activeTab === 'storage') {
        if (data.warehouseId) {
          await axios.put(`/api/warehouse/${data.warehouseId}`, data);
          setStorage((prev) =>
            prev.map((item) => (item.warehouseId === data.warehouseId ? data : item))
          );
        } else {
          const response = await axios.post('/api/warehouse', data);
          setStorage((prev) => [...prev, response.data]);
        }
      }
      setIsEditOpen(false);
    } catch (err) {
      setError('Failed to save data.');
    }
  };

  const handleEdit = (item, index) => {
    setEditData({ ...item, index });
    setIsEditOpen(true);
  };

  const renderTable = (data, fields) => {
    return (
      <table className="table">
        <thead>
          <tr>
            {fields.map((f, idx) => (
              <th key={idx}>{f}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {fields.map((f, idx) => (
                <td key={idx}>{row[f.toLowerCase()]}</td>
              ))}
              <td>
                <button className="btn btn-primary" onClick={() => handleEdit(row, i)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <section className="section">
      <h2>Company dashboard</h2>
      <p className="muted">
        Connect a Google Sheet or use the in-app table to track inventory, fleet, and storage.
      </p>

      <div className="tabs">
        {['inventory', 'fleet', 'storage'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={() => { setEditData(null); setIsEditOpen(true); }}>
          Add {activeTab === 'inventory' ? 'Item' : activeTab === 'fleet' ? 'Vehicle' : 'Allocation'}
        </button>
      </div>

      {/* Loading and Error messages */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Tables */}
      {activeTab === 'inventory' && renderTable(inventory, ['Item', 'Description', 'Quantity'])}
      {activeTab === 'fleet' && renderTable(fleet, ['Type', 'Id', 'Status'])}
      {activeTab === 'storage' && renderTable(storage, ['Facility', 'Capacity', 'Used'])}

      {/* Edit Modal */}
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
