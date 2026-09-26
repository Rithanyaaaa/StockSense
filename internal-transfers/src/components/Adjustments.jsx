import React, { useState } from 'react';
import { Plus, Search, Eye, CheckCircle2, Filter, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Adjustments = () => {
  const { adjustments, products, locations, addAdjustment, validateAdjustment } = useInventory();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingAdj, setViewingAdj] = useState(null);
  const [validatingAdj, setValidatingAdj] = useState(null);
  const [formError, setFormError] = useState('');

  // Form State
  const initialProd = products[0];
  const initialLoc = 'Main Warehouse';
  const initialSysQty = initialProd?.stockByLocation?.[initialLoc] || 0;

  const [formData, setFormData] = useState({
    productId: initialProd?.id || '',
    location: initialLoc,
    physicalQty: initialSysQty.toString(),
    reason: 'Physical stock count'
  });

  // Dynamic system quantity calculation for form
  const selectedProductObj = products.find(p => p.id === formData.productId);
  const currentSystemQty = selectedProductObj?.stockByLocation?.[formData.location] || 0;
  const currentDiff = (parseInt(formData.physicalQty, 10) || 0) - currentSystemQty;

  // Filtered Adjustments
  const filteredAdjustments = adjustments.filter(a => {
    const matchesSearch = 
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus;
    const matchesLocation = selectedLocation === 'All' || a.location === selectedLocation;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Handle product change in form
  const handleProductChange = (prodId) => {
    const p = products.find(prod => prod.id === prodId);
    const sys = p?.stockByLocation?.[formData.location] || 0;
    setFormData({
      ...formData,
      productId: prodId,
      physicalQty: sys.toString()
    });
  };

  // Handle location change in form
  const handleLocationChange = (loc) => {
    const sys = selectedProductObj?.stockByLocation?.[loc] || 0;
    setFormData({
      ...formData,
      location: loc,
      physicalQty: sys.toString()
    });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const p = products[0];
    const loc = 'Main Warehouse';
    const sys = p?.stockByLocation?.[loc] || 0;

    setFormData({
      productId: p?.id || '',
      location: loc,
      physicalQty: sys.toString(),
      reason: 'Physical stock count'
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  // Submit Create Adjustment
  const handleSubmitCreate = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.productId || !formData.location) {
      setFormError('Product and Location are required.');
      return;
    }

    const pQty = parseInt(formData.physicalQty, 10);
    if (isNaN(pQty) || pQty < 0) {
      setFormError('Physical quantity cannot be negative.');
      return;
    }

    const res = addAdjustment(formData);
    if (res.success) {
      setIsCreateOpen(false);
    }
  };

  // Confirm Validate Action
  const handleConfirmValidate = () => {
    if (validatingAdj) {
      const res = validateAdjustment(validatingAdj.id);
      if (!res.success) {
        setFormError(res.message);
      } else {
        setValidatingAdj(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>
            STOCK ADJUSTMENTS ({filteredAdjustments.length})
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Reconcile physical stock counts with system recorded inventory.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            padding: '10px 18px',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none'
          }}
        >
          <Plus size={16} />
          + CREATE ADJUSTMENT
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="gsharp-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-dark)',
          border: '1px solid var(--border-color)',
          padding: '8px 12px',
          flex: '1 1 240px',
          minWidth: '220px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="SEARCH ADJ #, PRODUCT OR SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              outline: 'none',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>STATUS:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-dark)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '8px',
              fontSize: '0.75rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            <option value="All">ALL STATUSES</option>
            <option value="PENDING">PENDING</option>
            <option value="VALIDATED">VALIDATED</option>
          </select>
        </div>

        {/* Location Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>LOCATION:</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-dark)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '8px',
              fontSize: '0.75rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            <option value="All">ALL LOCATIONS</option>
            {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="gsharp-card" style={{ padding: '0', overflowX: 'auto' }}>
        {filteredAdjustments.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <SlidersHorizontal size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No stock adjustments found.</p>
            <p style={{ fontSize: '0.75rem' }}>Create an adjustment to reconcile physical audit counts.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <th style={{ padding: '12px 16px' }}>ADJUSTMENT #</th>
                <th style={{ padding: '12px 16px' }}>PRODUCT</th>
                <th style={{ padding: '12px 16px' }}>LOCATION</th>
                <th style={{ padding: '12px 16px' }}>SYSTEM QTY</th>
                <th style={{ padding: '12px 16px' }}>PHYSICAL QTY</th>
                <th style={{ padding: '12px 16px' }}>DIFFERENCE</th>
                <th style={{ padding: '12px 16px' }}>REASON</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.map((a) => {
                const isValidated = a.status === 'VALIDATED';
                const diffFormatted = a.difference > 0 ? `+${a.difference}` : `${a.difference}`;

                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--accent-primary)', fontWeight: 800, fontFamily: 'monospace', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {a.id}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {a.productName} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>({a.sku})</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {a.location}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)', verticalAlign: 'middle' }}>
                      {a.systemQty} {a.uom}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', verticalAlign: 'middle' }}>
                      {a.physicalQty} {a.uom}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: a.difference > 0 ? 'var(--accent-green)' : a.difference < 0 ? 'var(--accent-red)' : 'var(--text-secondary)', verticalAlign: 'middle' }}>
                      {diffFormatted} {a.uom}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                      {a.reason}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className="gsharp-badge" style={{
                        color: isValidated ? 'var(--accent-green)' : 'var(--accent-yellow)',
                        borderColor: isValidated ? 'var(--accent-green)' : 'var(--accent-yellow)'
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setViewingAdj(a)}
                          title="View Details"
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}
                        >
                          <Eye size={15} />
                        </button>
                        
                        {!isValidated ? (
                          <button
                            onClick={() => { setFormError(''); setValidatingAdj(a); }}
                            title="Validate Adjustment & Reconcile Stock"
                            style={{
                              backgroundColor: 'var(--accent-green)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '4px 10px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle2 size={13} />
                            VALIDATE
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingRight: '4px' }}>
                            DONE
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE ADJUSTMENT MODAL */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="gsharp-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              CREATE STOCK ADJUSTMENT
            </h3>

            {formError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: 'var(--accent-red)',
                border: '1px solid var(--accent-red)',
                padding: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  SELECT PRODUCT *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  TARGET LOCATION *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    SYSTEM QTY (READ ONLY)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentSystemQty} ${selectedProductObj?.uom || ''}`}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontFamily: 'inherit',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    PHYSICAL COUNT *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.physicalQty}
                    onChange={(e) => setFormData({ ...formData, physicalQty: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    DIFFERENCE
                  </label>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    color: currentDiff > 0 ? 'var(--accent-green)' : currentDiff < 0 ? 'var(--accent-red)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 800
                  }}>
                    {currentDiff > 0 ? `+${currentDiff}` : `${currentDiff}`} {selectedProductObj?.uom}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  ADJUSTMENT REASON
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="Physical stock count">Physical stock count</option>
                  <option value="Damaged goods">Damaged goods</option>
                  <option value="Missing stock">Missing stock</option>
                  <option value="Counting error">Counting error</option>
                  <option value="Audit correction">Audit correction</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  CREATE ADJUSTMENT (PENDING)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VALIDATE CONFIRMATION MODAL */}
      {validatingAdj && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="gsharp-card" style={{ width: '100%', maxWidth: '440px', padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> VALIDATE ADJUSTMENT #{validatingAdj.id}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Reconcile stock for <strong>{validatingAdj.productName}</strong> at <strong>{validatingAdj.location}</strong>?
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Validating will set physical inventory to <strong>{validatingAdj.physicalQty} {validatingAdj.uom}</strong> and write an audit entry to the Stock Ledger.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setValidatingAdj(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmValidate}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent-green)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                CONFIRM & RECONCILE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingAdj && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="gsharp-card" style={{ width: '100%', maxWidth: '480px', padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  ADJUSTMENT {viewingAdj.id}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created on {viewingAdj.date}</span>
              </div>
              <span className="gsharp-badge" style={{
                color: viewingAdj.status === 'VALIDATED' ? 'var(--accent-green)' : 'var(--accent-yellow)',
                borderColor: viewingAdj.status === 'VALIDATED' ? 'var(--accent-green)' : 'var(--accent-yellow)'
              }}>
                {viewingAdj.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8rem', marginBottom: '20px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>PRODUCT</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingAdj.productName} ({viewingAdj.sku})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>LOCATION</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingAdj.location}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>SYSTEM QTY</span>
                <strong style={{ color: 'var(--text-secondary)' }}>{viewingAdj.systemQty} {viewingAdj.uom}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>PHYSICAL QTY</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingAdj.physicalQty} {viewingAdj.uom}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>REASON</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingAdj.reason}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewingAdj(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
