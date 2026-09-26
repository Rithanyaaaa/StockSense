import React, { useState } from 'react';
import { Plus, Search, Eye, CheckCircle2, Filter, AlertTriangle, ArrowDownLeft, Trash2, Package } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Receipts = () => {
  const { receipts, products, suppliers, locations, addReceipt, validateReceipt } = useInventory();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [validatingReceipt, setValidatingReceipt] = useState(null);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    supplier: suppliers[0]?.name || 'ABC Supplies',
    destination: 'Main Warehouse',
    lines: [
      { productId: products[0]?.id || '', quantity: 10 }
    ]
  });

  // Filtered Receipts Calculation
  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = 
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    const matchesLocation = selectedLocation === 'All' || r.destination === selectedLocation;
    const matchesSupplier = selectedSupplier === 'All' || r.supplier === selectedSupplier;

    return matchesSearch && matchesStatus && matchesLocation && matchesSupplier;
  });

  // Handle line item changes
  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index][field] = value;
    setFormData({ ...formData, lines: updatedLines });
  };

  // Add line item
  const handleAddLine = () => {
    // Find a product not yet selected if possible
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
      setFormError('A receipt must have at least one product line.');
      return;
    }
    const updatedLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: updatedLines });
  };

  // Open Create Receipt Modal
  const handleOpenCreate = () => {
    setFormData({
      supplier: suppliers[0]?.name || 'ABC Supplies',
      destination: 'Main Warehouse',
      lines: [
        { productId: products[0]?.id || '', quantity: 10 }
      ]
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  // Submit Receipt Form (Save as PENDING)
  const handleSubmitCreate = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.supplier || !formData.destination) {
      setFormError('Supplier and Destination Location are required.');
      return;
    }

    if (formData.lines.length === 0) {
      setFormError('Please add at least one product line.');
      return;
    }

    // Check duplicate products within the same receipt
    const selectedProdIds = formData.lines.map(l => l.productId);
    const hasDuplicate = new Set(selectedProdIds).size !== selectedProdIds.length;
    if (hasDuplicate) {
      setFormError('Duplicate products found in receipt lines. Please merge line quantities.');
      return;
    }

    // Validate quantities > 0
    for (const line of formData.lines) {
      if (!line.productId) {
        setFormError('Please select a valid product for all lines.');
        return;
      }
      if (parseInt(line.quantity, 10) <= 0 || isNaN(parseInt(line.quantity, 10))) {
        setFormError('Quantity received must be greater than 0.');
        return;
      }
    }

    // Prepare line payload with full product details snapshot
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

    const res = addReceipt({
      supplier: formData.supplier,
      destination: formData.destination,
      lines: formattedLines
    });

    if (res.success) {
      setIsCreateOpen(false);
    }
  };

  // Confirm Validate Receipt Action
  const handleConfirmValidate = () => {
    if (validatingReceipt) {
      validateReceipt(validatingReceipt.id);
      setValidatingReceipt(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>
            INCOMING STOCK RECEIPTS ({filteredReceipts.length})
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Process incoming purchase orders from suppliers and validate inventory additions.
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
          + CREATE RECEIPT
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
            placeholder="SEARCH RECEIPT # OR SUPPLIER..."
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
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>DEST:</span>
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

        {/* Supplier Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SUPPLIER:</span>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
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
            <option value="All">ALL SUPPLIERS</option>
            {suppliers.map(sup => <option key={sup.id} value={sup.name}>{sup.name.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || selectedStatus !== 'All' || selectedLocation !== 'All' || selectedSupplier !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('All');
              setSelectedLocation('All');
              setSelectedSupplier('All');
            }}
            style={{
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-red)',
              padding: '8px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            CLEAR FILTERS
          </button>
        )}
      </div>

      {/* Receipts Table */}
      <div className="gsharp-card" style={{ padding: '0', overflowX: 'auto' }}>
        {filteredReceipts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ArrowDownLeft size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No incoming stock receipts found.</p>
            <p style={{ fontSize: '0.75rem' }}>Create a new receipt to record incoming supplier shipments.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <th style={{ padding: '12px 16px' }}>RECEIPT #</th>
                <th style={{ padding: '12px 16px' }}>SUPPLIER</th>
                <th style={{ padding: '12px 16px' }}>DESTINATION</th>
                <th style={{ padding: '12px 16px' }}>PRODUCTS</th>
                <th style={{ padding: '12px 16px' }}>TOTAL QTY</th>
                <th style={{ padding: '12px 16px' }}>CREATED DATE</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((r) => {
                const totalQty = r.lines.reduce((acc, l) => acc + l.quantity, 0);
                const isValidated = r.status === 'VALIDATED';

                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--accent-primary)', fontWeight: 800, fontFamily: 'monospace', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {r.id}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {r.supplier}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {r.destination}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 600, verticalAlign: 'middle' }}>
                      {r.lines.length} Line(s)
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-green)', verticalAlign: 'middle' }}>
                      +{totalQty}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                      {r.date}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className="gsharp-badge" style={{
                        color: isValidated ? 'var(--accent-green)' : 'var(--accent-yellow)',
                        borderColor: isValidated ? 'var(--accent-green)' : 'var(--accent-yellow)'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setViewingReceipt(r)}
                          title="View Receipt Details"
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}
                        >
                          <Eye size={15} />
                        </button>
                        
                        {!isValidated ? (
                          <button
                            onClick={() => setValidatingReceipt(r)}
                            title="Validate Receipt & Update Stock"
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

      {/* CREATE RECEIPT MODAL */}
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
              CREATE INCOMING STOCK RECEIPT
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
                    SELECT SUPPLIER *
                  </label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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
                    {suppliers.map(sup => <option key={sup.id} value={sup.name}>{sup.name}</option>)}
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

              {/* Product Lines Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                    RECEIPT PRODUCT LINES
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
                    return (
                      <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 80px 30px',
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
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — Stock: {p.quantity} {p.uom}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Input */}
                        <div>
                          <input
                            type="number"
                            min="1"
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

                        {/* UOM Badge */}
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {selectedProd?.uom || 'Units'}
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
                  SAVE RECEIPT (PENDING)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VALIDATE CONFIRMATION MODAL */}
      {validatingReceipt && (
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
              <CheckCircle2 size={18} /> VALIDATE RECEIPT #{validatingReceipt.id}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Are you sure you want to validate this receipt from <strong>{validatingReceipt.supplier}</strong>?
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Validating will immediately increase physical inventory quantities at <strong>{validatingReceipt.destination}</strong> for all line items.
            </p>

            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '10px', border: '1px solid var(--border-color)', marginBottom: '20px', fontSize: '0.75rem' }}>
              {validatingReceipt.lines.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{l.productName} ({l.sku}):</span>
                  <strong style={{ color: 'var(--accent-green)' }}>+{l.quantity} {l.uom}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setValidatingReceipt(null)}
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
                CONFIRM & VALIDATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT DETAILS MODAL */}
      {viewingReceipt && (
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
                  RECEIPT {viewingReceipt.id}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created on {viewingReceipt.date}</span>
              </div>
              <span className="gsharp-badge" style={{
                color: viewingReceipt.status === 'VALIDATED' ? 'var(--accent-green)' : 'var(--accent-yellow)',
                borderColor: viewingReceipt.status === 'VALIDATED' ? 'var(--accent-green)' : 'var(--accent-yellow)'
              }}>
                {viewingReceipt.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8rem', marginBottom: '20px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>SUPPLIER</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingReceipt.supplier}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>DESTINATION LOCATION</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingReceipt.destination}</strong>
              </div>
            </div>

            {/* Receipt Line Items Table */}
            <div style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                // RECEIPT ITEM LINES
              </span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.68rem', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '6px' }}>PRODUCT</th>
                    <th style={{ paddingBottom: '6px' }}>SKU</th>
                    <th style={{ paddingBottom: '6px', textAlign: 'right' }}>QTY RECEIVED</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingReceipt.lines.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #33415530' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-primary)', fontWeight: 600 }}>{l.productName}</td>
                      <td style={{ padding: '8px 0', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{l.sku}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, color: 'var(--accent-green)' }}>
                        +{l.quantity} {l.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setViewingReceipt(null)}
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
