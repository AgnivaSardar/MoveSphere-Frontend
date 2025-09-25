import React, { useState, useEffect } from 'react';
import '../styles/style.css';

const EditPage = ({ isOpen, onClose, onSave, editData, resourceType }) => {
  const [id, setId] = useState(editData?.id || '');
  const [name, setName] = useState(editData?.name || '');
  const [type, setType] = useState(editData?.type || 'Warehouse');
  const [location, setLocation] = useState(editData?.location || '');
  const [capacity, setCapacity] = useState(editData?.capacity || '');
  const [price, setPrice] = useState(editData?.price || '');
  const [quantity, setQuantity] = useState(editData?.quantity || '');
  const [description, setDescription] = useState(editData?.description || '');

  // Legal support specific states
  const [city, setCity] = useState(editData?.city || '');
  const [caseType, setCaseType] = useState(editData?.caseType || 'contract');
  const [courtName, setCourtName] = useState(editData?.courtName || '');
  const [lawyerName, setLawyerName] = useState(editData?.lawyerName || '');
  const [lawyerContact, setLawyerContact] = useState(editData?.lawyerContact || '');
  const [applicableActs, setApplicableActs] = useState(editData?.applicableActs || '');

  useEffect(() => {
    setId(editData?.id || '');
    setName(editData?.name || '');
    setType(editData?.type || 'Warehouse');
    setLocation(editData?.location || '');
    setCapacity(editData?.capacity || '');
    setPrice(editData?.price || '');
    setQuantity(editData?.quantity || '');
    setDescription(editData?.description || '');
    setCity(editData?.city || '');
    setCaseType(editData?.caseType || 'contract');
    setCourtName(editData?.courtName || '');
    setLawyerName(editData?.lawyerName || '');
    setLawyerContact(editData?.lawyerContact || '');
    setApplicableActs(editData?.applicableActs || '');
  }, [editData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = { id, name };

    if (resourceType === 'inventory') {
      data = {
        itemId: id,
        description,
        quantity: Number(quantity),
        reorderThreshold: 10, // optional to add input
      };
    } else if (resourceType === 'fleet') {
      data = {
        vehicleId: id,
        type,
        status: name, // map accordingly
      };
    } else if (resourceType === 'storage') {
      data = {
        warehouseId: id,
        name,
        type,
        location,
        capacity: Number(capacity),
        price: Number(price),
      };
    } else if (resourceType === 'legalSupport') {
      data = {
        id,
        city,
        caseType,
        courtName,
        lawyerName,
        lawyerContact,
        applicableActs,
        description,
      };
    }

    onSave(data);
    onClose();
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <h2>{editData ? 'Edit Entry' : 'Add New Entry'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Render inputs conditionally based on resourceType */}

          {(resourceType === 'storage' || resourceType === 'fleet') && (
            <>
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </>
          )}

          {resourceType === 'storage' && (
            <>
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option>Warehouse</option>
                <option>Harbour</option>
                <option>Depot</option>
              </select>

              <label>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} required />

              <label>Capacity</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />

              <label>Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </>
          )}

          {resourceType === 'inventory' && (
            <>
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} required />

              <label>Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </>
          )}

          {resourceType === 'legalSupport' && (
            <>
              <label>City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} required />

              <label>Case Type</label>
              <select value={caseType} onChange={(e) => setCaseType(e.target.value)} required>
                <option value="contract">Contract disputes</option>
                <option value="customs">Customs & trade</option>
                <option value="transport">Transport compliance</option>
                <option value="environment">Environment & NOC</option>
              </select>

              <label>Court Name</label>
              <input value={courtName} onChange={(e) => setCourtName(e.target.value)} required />

              <label>Lawyer Name</label>
              <input value={lawyerName} onChange={(e) => setLawyerName(e.target.value)} required />

              <label>Lawyer Contact</label>
              <input value={lawyerContact} onChange={(e) => setLawyerContact(e.target.value)} required />

              <label>Applicable Acts</label>
              <input value={applicableActs} onChange={(e) => setApplicableActs(e.target.value)} required />

              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </>
          )}

          <div className="edit-modal-buttons">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPage;
