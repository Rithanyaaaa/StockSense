import React, { useState } from 'react';
import { Plus, Search, Eye, CheckCircle2, Filter, AlertTriangle, ArrowUpRight, Trash2, Package, Check, Box } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Deliveries = () => {
  const { deliveries, products, customers, locations, addDelivery, updateDeliveryStatus, validateDelivery } = useInventory();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState('All');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingDelivery, setViewingDelivery] = useState(null);
  const [validatingDelivery, setValidatingDelivery] = useState(null);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customer: customers[0]?.name || 'XYZ Retail',
    source: 'Main Warehouse',
    lines: [
      { productId: products[0]?.id || '', quantity: 5 }
    ]
  });

  // Filtered Deliveries Calculation
  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = 
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || d.status === selectedStatus;
    const matchesLocation = selectedLocation === 'All' || d.source === selectedLocation;
    const matchesCustomer = selectedCustomer === 'All' || d.customer === selectedCustomer;

    return matchesSearch && matchesStatus && matchesLocation && matchesCustomer;
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
      lines: [...formData.lines, { productId: nextProdId, quantity: 5 }]
    });
  };

  // Remove line item
  const handleRemoveLine = (index) => {
    if (formData.lines.length <= 1) {
      setFormError('A delivery order must have at least one product line.');
      return;
    }
    const updatedLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: updatedLines });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      customer: customers[0]?.name || 'XYZ Retail',
      source: 'Main Warehouse',
      lines: [
        { productId: products[0]?.id || '', quantity: 5 }
      ]
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  // Submit Create Delivery
  const handleSubmitCreate = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.customer || !formData.source) {
      setFormError('Customer and Source Location are required.');
      return;
    }

    if (formData.lines.length === 0) {
      setFormError('Please add at least one product line.');
      return;
    }

    // Check duplicate products
    const selectedProdIds = formData.lines.map(l => l.productId);
    if (new Set(selectedProdIds).size !== selectedProdIds.length) {
      setFormError('Duplicate products found in delivery lines. Please merge quantities.');
      return;
    }

    // Validate quantities & source location stock availability
    for (const line of formData.lines) {
      const prod = products.find(p => p.id === line.productId);
      const reqQty = parseInt(line.quantity, 10);

      if (!line.productId) {
        setFormError('Please select a valid product for all lines.');
        return;
      }
      if (reqQty <= 0 || isNaN(reqQty)) {
        setFormError('Delivery quantity must be greater than 0.');
        return;
      }

      const availableLocStock = prod?.stockByLocation?.[formData.source] || 0;
      if (reqQty > availableLocStock) {
        setFormError(`Insufficient stock for '${prod.name}' at ${formData.source}. Available: ${availableLocStock} ${prod.uom}, Requested: ${reqQty}.`);
        return;
      }
    }

    // Formatted line payload
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

    const res = addDelivery({
      customer: formData.customer,
      source: formData.source,
      lines: formattedLines
    });

    if (res.success) {
      setIsCreateOpen(false);
    }
  };

  // Confirm Validate Action
  const handleConfirmValidate = () => {
    if (validatingDelivery) {
      const res = validateDelivery(validatingDelivery.id);
      if (!res.success) {
        setFormError(res.message);
      } else {
        setValidatingDelivery(null);
      }
    }
  };

  // Render Workflow Status Action Button
  const renderWorkflowButton = (delivery) => {
    switch (delivery.status) {
      case 'READY':
        return (
          <button
            onClick={() => updateDeliveryStatus(delivery.id, 'PICKED')}
            style={{
              backgroundColor: 'var(--accent-blue)',
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
            <Package size={13} />
            PICK
          </button>
        );
      case 'PICKED':
        return (
          <button
            onClick={() => updateDeliveryStatus(delivery.id, 'PACKED')}
            style={{
              backgroundColor: 'var(--accent-purple)',
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
            <Box size={13} />
            PACK
          </button>
        );
      case 'PACKED':
        return (
          <button
            onClick={() => { setFormError(''); setValidatingDelivery(delivery); }}
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
        );
      case 'VALIDATED':
        return (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingRight: '4px' }}>
            DELIVERED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>
            DELIVERY ORDERS ({filteredDeliveries.length})
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Pick, pack, ship outgoing customer orders, and validate stock subtractions.
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
          + CREATE DELIVERY
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
            placeholder="SEARCH DELIVERY # OR CUSTOMER..."
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
            <option value="READY">READY</option>
            <option value="PICKED">PICKED</option>
            <option value="PACKED">PACKED</option>
            <option value="VALIDATED">VALIDATED</option>
          </select>
        </div>

        {/* Location Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SOURCE:</span>
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

        {/* Customer Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>CUSTOMER:</span>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
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
            <option value="All">ALL CUSTOMERS</option>
            {customers.map(cust => <option key={cust.id} value={cust.name}>{cust.name.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || selectedStatus !== 'All' || selectedLocation !== 'All' || selectedCustomer !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('All');
              setSelectedLocation('All');
              setSelectedCustomer('All');
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

      {/* Deliveries Data Table */}
      <div className="gsharp-card" style={{ padding: '0', overflowX: 'auto' }}>
        {filteredDeliveries.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ArrowUpRight size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No delivery orders found.</p>
            <p style={{ fontSize: '0.75rem' }}>Create a new delivery order to process customer shipments.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <th style={{ padding: '12px 16px' }}>DELIVERY #</th>
                <th style={{ padding: '12px 16px' }}>CUSTOMER</th>
                <th style={{ padding: '12px 16px' }}>SOURCE LOCATION</th>
                <th style={{ padding: '12px 16px' }}>PRODUCTS</th>
                <th style={{ padding: '12px 16px' }}>TOTAL QTY</th>
                <th style={{ padding: '12px 16px' }}>CREATED DATE</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map((d) => {
                const totalQty = d.lines.reduce((acc, l) => acc + l.quantity, 0);

                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--accent-primary)', fontWeight: 800, fontFamily: 'monospace', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {d.id}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {d.customer}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {d.source}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 600, verticalAlign: 'middle' }}>
                      {d.lines.length} Line(s)
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-blue)', verticalAlign: 'middle' }}>
                      -{totalQty}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                      {d.date}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className="gsharp-badge" style={{
                        color: d.status === 'VALIDATED' ? 'var(--accent-green)' : d.status === 'PACKED' ? 'var(--accent-purple)' : d.status === 'PICKED' ? 'var(--accent-blue)' : 'var(--accent-yellow)',
                        borderColor: d.status === 'VALIDATED' ? 'var(--accent-green)' : d.status === 'PACKED' ? 'var(--accent-purple)' : d.status === 'PICKED' ? 'var(--accent-blue)' : 'var(--accent-yellow)'
                      }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setViewingDelivery(d)}
                          title="View Delivery Details"
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}
                        >
                          <Eye size={15} />
                        </button>
                        
                        {renderWorkflowButton(d)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE DELIVERY MODAL */}
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
              CREATE DELIVERY ORDER
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
                    SELECT CUSTOMER *
                  </label>
                  <select
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
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
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

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
              </div>

              {/* Product Lines */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                    DELIVERY PRODUCT LINES
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
                    const availStock = selectedProd?.stockByLocation?.[formData.source] || 0;

                    return (
                      <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 100px 30px',
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
                                  {p.name} ({p.sku}) — Avail: {locStock} {p.uom}
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
                            max={availStock}
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

                        {/* Available Stock Indicator */}
                        <div style={{ fontSize: '0.7rem', color: availStock < line.quantity ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600 }}>
                          Avail: {availStock} {selectedProd?.uom}
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
                  CREATE DELIVERY ORDER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VALIDATE CONFIRMATION MODAL */}
      {validatingDelivery && (
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
              <CheckCircle2 size={18} /> VALIDATE DELIVERY #{validatingDelivery.id}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Validate and dispatch this delivery order to <strong>{validatingDelivery.customer}</strong>?
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Validating will immediately reduce physical stock from <strong>{validatingDelivery.source}</strong>.
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
              {validatingDelivery.lines.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{l.productName} ({l.sku}):</span>
                  <strong style={{ color: 'var(--accent-red)' }}>-{l.quantity} {l.uom}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setValidatingDelivery(null)}
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
                CONFIRM & DISPATCH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingDelivery && (
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
                  DELIVERY ORDER {viewingDelivery.id}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created on {viewingDelivery.date}</span>
              </div>
              <span className="gsharp-badge" style={{
                color: viewingDelivery.status === 'VALIDATED' ? 'var(--accent-green)' : 'var(--accent-purple)',
                borderColor: viewingDelivery.status === 'VALIDATED' ? 'var(--accent-green)' : 'var(--accent-purple)'
              }}>
                {viewingDelivery.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8rem', marginBottom: '20px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CUSTOMER</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingDelivery.customer}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>SOURCE LOCATION</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingDelivery.source}</strong>
              </div>
            </div>

            {/* Line items list */}
            <div style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                // DISPATCH ITEM LINES
              </span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.68rem', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '6px' }}>PRODUCT</th>
                    <th style={{ paddingBottom: '6px' }}>SKU</th>
                    <th style={{ paddingBottom: '6px', textAlign: 'right' }}>QTY DISPATCHED</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingDelivery.lines.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #33415530' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-primary)', fontWeight: 600 }}>{l.productName}</td>
                      <td style={{ padding: '8px 0', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{l.sku}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, color: 'var(--accent-red)' }}>
                        -{l.quantity} {l.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setViewingDelivery(null)}
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
