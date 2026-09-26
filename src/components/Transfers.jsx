import React, { useState } from 'react';
import { Plus, Search, Eye, CheckCircle2, Filter, AlertTriangle, ArrowLeftRight, Trash2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Transfers = () => {
  const { transfers, products, locations, addTransfer, validateTransfer } = useInventory();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedDestination, setSelectedDestination] = useState('All');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingTransfer, setViewingTransfer] = useState(null);
  const [validatingTransfer, setValidatingTransfer] = useState(null);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    source: 'Main Warehouse',
    destination: 'Production Floor',
    lines: [
      { productId: products[0]?.id || '', quantity: 10 }
    ]
  });

  // Filtered Transfers
  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesSource = selectedSource === 'All' || t.source === selectedSource;
    const matchesDestination = selectedDestination === 'All' || t.destination === selectedDestination;

    return matchesSearch && matchesStatus && matchesSource && matchesDestination;
  });

  // Handle line item changes
  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index][field] = value;
    setFormData({ ...formData, lines: updatedLines });
  };

  // Add line item
  const handleAddLine = () => {
    const unusedProduct = products.find(p => !formData.lines.some(l => l.productId === p.id));
    const nextProdId = unusedProduct ? unusedProduct.id : products[0]?.id || '';

    setFormData({
      ...formData,
      lines: [...formData.lines, { productId: nextProdId, quantity: 10 }]
    });
  };

  // Remove line item
  const handleRemoveLine = (index) => {
    if (formData.lines.length <= 1) {
      setFormError('A transfer order must have at least one product line.');
      return;
    }
    const updatedLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: updatedLines });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      source: 'Main Warehouse',
      destination: 'Production Floor',
      lines: [
        { productId: products[0]?.id || '', quantity: 10 }
      ]
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  // Submit Create Transfer
  const handleSubmitCreate = (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.source === formData.destination) {
      setFormError('Source and destination locations must be different.');
      return;
    }

    if (formData.lines.length === 0) {
      setFormError('Please add at least one product line.');
      return;
    }

    // Check duplicate products
    const selectedProdIds = formData.lines.map(l => l.productId);
    if (new Set(selectedProdIds).size !== selectedProdIds.length) {
      setFormError('Duplicate products found in transfer lines. Please merge quantities.');
      return;
    }

    // Validate quantities & source stock availability
    for (const line of formData.lines) {
      const prod = products.find(p => p.id === line.productId);
      const reqQty = parseInt(line.quantity, 10);

      if (!line.productId) {
        setFormError('Please select a valid product for all lines.');
        return;
      }
      if (reqQty <= 0 || isNaN(reqQty)) {
        setFormError('Transfer quantity must be greater than 0.');
        return;
      }

      const availableSourceStock = prod?.stockByLocation?.[formData.source] || 0;
      if (reqQty > availableSourceStock) {
        setFormError(`Insufficient stock for '${prod.name}' at ${formData.source}. Available: ${availableSourceStock} ${prod.uom}, Requested: ${reqQty}.`);
        return;
      }
    }

    // Formatted lines payload
    const formattedLines = formData.lines.map(line => {
      const prod = products.find(p => p.id === line.productId);
      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        uom: prod.uom,
        quantity: parseInt(line.quantity, 10)
      };
    });

    const res = addTransfer({
      source: formData.source,
      destination: formData.destination,
      lines: formattedLines
    });

    if (res.success) {
      setIsCreateOpen(false);
    } else {
      setFormError(res.message);
    }
  };

  // Confirm Validate Action
  const handleConfirmValidate = () => {
    if (validatingTransfer) {
      const res = validateTransfer(validatingTransfer.id);
      if (!res.success) {
        setFormError(res.message);
      } else {
        setValidatingTransfer(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>
            INTERNAL WAREHOUSE TRANSFERS ({filteredTransfers.length})
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Relocate stock between internal warehouse zones, racks, and facilities without mutating total inventory balance.
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
          + CREATE TRANSFER
        </button>
      </div>

      {/* Filter Toolbar */}
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
            placeholder="SEARCH INT #, SOURCE OR DESTINATION..."
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

        {/* Source Location Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SOURCE:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
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

        {/* Destination Location Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>DEST:</span>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
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

      {/* Transfers Data Table */}
      <div className="gsharp-card" style={{ padding: '0', overflowX: 'auto' }}>
        {filteredTransfers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ArrowLeftRight size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No internal transfers found.</p>
            <p style={{ fontSize: '0.75rem' }}>Create a new transfer to relocate stock between zones.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <th style={{ padding: '12px 16px' }}>TRANSFER #</th>
                <th style={{ padding: '12px 16px' }}>SOURCE &rarr; DESTINATION</th>
                <th style={{ padding: '12px 16px' }}>PRODUCTS</th>
                <th style={{ padding: '12px 16px' }}>TOTAL QTY</th>
                <th style={{ padding: '12px 16px' }}>DATE</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((t) => {
                const totalQty = t.lines.reduce((acc, l) => acc + l.quantity, 0);
                const isValidated = t.status === 'VALIDATED';

                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--accent-primary)', fontWeight: 800, fontFamily: 'monospace', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {t.id}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {t.source} <span style={{ color: 'var(--accent-primary)' }}>&rarr;</span> {t.destination}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 600, verticalAlign: 'middle' }}>
                      {t.lines.length} Line(s)
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-purple)', verticalAlign: 'middle' }}>
                      {totalQty}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                      {t.date}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className="gsharp-badge" style={{
                        color: isValidated ? 'var(--accent-green)' : 'var(--accent-yellow)',
                        borderColor: isValidated ? 'var(--accent-green)' : 'var(--accent-yellow)'
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setViewingTransfer(t)}
                          title="View Details"
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}
                        >
                          <Eye size={15} />
                        </button>
                        
                        {!isValidated ? (
                          <button
                            onClick={() => { setFormError(''); setValidatingTransfer(t); }}
                            title="Validate Transfer"
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

      {/* CREATE TRANSFER MODAL */}
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
          <div className="gsharp-card" style={{ width: '100%', maxWidth: '640px', padding: '24px', backgroundColor: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              CREATE INTERNAL TRANSFER
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

            <form onSubmit={handleSubmitCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    SOURCE LOCATION *
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    DESTINATION LOCATION *
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
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
              </div>

              {/* Product Lines */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                    TRANSFER PRODUCT LINES
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    style={{
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--accent-primary)',
                      padding: '4px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={12} /> ADD LINE
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.lines.map((line, index) => {
                    const selectedProd = products.find(p => p.id === line.productId);
                    const availSourceStock = selectedProd?.stockByLocation?.[formData.source] || 0;

                    return (
                      <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 110px 30px',
                        gap: '8px',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-dark)',
                        padding: '8px 10px',
                        border: '1px solid var(--border-color)'
                      }}>
                        {/* Product Selector */}
                        <div>
                          <select
                            value={line.productId}
                            onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              fontSize: '0.75rem',
                              outline: 'none',
                              fontFamily: 'inherit'
                            }}
                          >
                            {products.map(p => {
                              const locStock = p.stockByLocation?.[formData.source] || 0;
                              return (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku}) — Src Avail: {locStock} {p.uom}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Quantity Input */}
                        <div>
                          <input
                            type="number"
                            min="1"
                            max={availSourceStock}
                            placeholder="Qty"
                            value={line.quantity}
                            onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              fontSize: '0.75rem',
                              outline: 'none',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>

                        {/* Available Source Stock Indicator */}
                        <div style={{ fontSize: '0.7rem', color: availSourceStock < line.quantity ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600 }}>
                          Src Avail: {availSourceStock} {selectedProd?.uom}
                        </div>

                        {/* Remove Line */}
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
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
                  CREATE TRANSFER (PENDING)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VALIDATE CONFIRMATION MODAL */}
      {validatingTransfer && (
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
              <CheckCircle2 size={18} /> VALIDATE TRANSFER #{validatingTransfer.id}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Relocate stock from <strong>{validatingTransfer.source}</strong> to <strong>{validatingTransfer.destination}</strong>?
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Validating will decrease source location stock and increase destination location stock. Total inventory balance remains unchanged.
            </p>

            {formError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: 'var(--accent-red)',
                border: '1px solid var(--accent-red)',
                padding: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '14px'
              }}>
                {formError}
              </div>
            )}

            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '10px', border: '1px solid var(--border-color)', marginBottom: '20px', fontSize: '0.75rem' }}>
              {validatingTransfer.lines.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{l.productName} ({l.sku}):</span>
                  <strong style={{ color: 'var(--accent-purple)' }}>{l.quantity} {l.uom}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setValidatingTransfer(null)}
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
                CONFIRM & RELOCATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingTransfer && (
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
          <div className="gsharp-card" style={{ width: '100%', maxWidth: '520px', padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  TRANSFER ORDER {viewingTransfer.id}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created on {viewingTransfer.date}</span>
              </div>
              <span className="gsharp-badge" style={{
                color: viewingTransfer.status === 'VALIDATED' ? 'var(--accent-green)' : 'var(--accent-yellow)',
                borderColor: viewingTransfer.status === 'VALIDATED' ? 'var(--accent-green)' : 'var(--accent-yellow)'
              }}>
                {viewingTransfer.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8rem', marginBottom: '20px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>SOURCE LOCATION</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingTransfer.source}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>DESTINATION LOCATION</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingTransfer.destination}</strong>
              </div>
            </div>

            {/* Line items table */}
            <div style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                // RELOCATION ITEM LINES
              </span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.68rem', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '6px' }}>PRODUCT</th>
                    <th style={{ paddingBottom: '6px' }}>SKU</th>
                    <th style={{ paddingBottom: '6px', textAlign: 'right' }}>QTY MOVED</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingTransfer.lines.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #33415530' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-primary)', fontWeight: 600 }}>{l.productName}</td>
                      <td style={{ padding: '8px 0', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{l.sku}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, color: 'var(--accent-purple)' }}>
                        {l.quantity} {l.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setViewingTransfer(null)}
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
