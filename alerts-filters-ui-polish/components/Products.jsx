import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Filter, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Products = () => {
  const { products, addProduct, editProduct, deleteProduct, getStockStatus } = useInventory();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for add, object for edit
  const [deletingProduct, setDeletingProduct] = useState(null); // object for confirm modal
  const [viewingProduct, setViewingProduct] = useState(null); // object for details modal
  const [formError, setFormError] = useState('');

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    uom: 'Units',
    quantity: '0',
    location: 'Main Warehouse',
    reorderPoint: '10',
    unitPrice: '100'
  });

  // Unique categories and locations for filters
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const locations = ['All', 'Main Warehouse', 'Production Floor', 'Production Rack', 'Secondary Hub'];

  // Filtered Products Calculation
  const filteredProducts = products.filter(product => {
    const status = getStockStatus(product.quantity, product.reorderPoint);
    
    // Smart Search match (Name, SKU, Category, or Location)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.location.toLowerCase().includes(searchLower);

    // Category match
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    // Location match
    const matchesLocation = selectedLocation === 'All' || product.location === selectedLocation;

    // Status match
    const matchesStatus = 
      selectedStatus === 'All' ||
      (selectedStatus === 'IN STOCK' && status === 'IN STOCK') ||
      (selectedStatus === 'LOW STOCK' && status === 'LOW STOCK') ||
      (selectedStatus === 'OUT OF STOCK' && status === 'OUT OF STOCK');

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSelectedStatus('All');
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Electronics',
      uom: 'Units',
      quantity: '10',
      location: 'Main Warehouse',
      reorderPoint: '10',
      unitPrice: '500'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      uom: product.uom,
      quantity: product.quantity.toString(),
      location: product.location,
      reorderPoint: product.reorderPoint.toString(),
      unitPrice: product.unitPrice.toString()
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Submit Add or Edit Form
  const handleSubmitForm = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.sku.trim()) {
      setFormError('Product Name and SKU are required.');
      return;
    }

    if (editingProduct) {
      const res = editProduct(editingProduct.id, formData);
      if (res.success) {
        setIsFormOpen(false);
      } else {
        setFormError(res.message);
      }
    } else {
      const res = addProduct(formData);
      if (res.success) {
        setIsFormOpen(false);
      } else {
        setFormError(res.message);
      }
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>
            PRODUCT MASTER CATALOG ({filteredProducts.length})
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Manage inventory items, SKUs, reorder levels, and location assignments.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
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
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Plus size={16} />
          + ADD PRODUCT
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
            placeholder="SEARCH BY NAME OR SKU (E.G. MAT-001)..."
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

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>CAT:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
            {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Location Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>LOC:</span>
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
            {locations.map(loc => <option key={loc} value={loc}>{loc.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <option value="IN STOCK">IN STOCK</option>
            <option value="LOW STOCK">LOW STOCK</option>
            <option value="OUT OF STOCK">OUT OF STOCK</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || selectedCategory !== 'All' || selectedLocation !== 'All' || selectedStatus !== 'All') && (
          <button
            onClick={handleClearFilters}
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

      {/* Products Data Table */}
      <div className="gsharp-card" style={{ padding: '0', overflowX: 'auto' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No products found matching filters.</p>
            <p style={{ fontSize: '0.75rem' }}>Try clearing search or filters to see all items.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <th style={{ padding: '12px 16px' }}>PRODUCT NAME</th>
                <th style={{ padding: '12px 16px' }}>SKU / CODE</th>
                <th style={{ padding: '12px 16px' }}>CATEGORY</th>
                <th style={{ padding: '12px 16px' }}>UOM</th>
                <th style={{ padding: '12px 16px' }}>STOCK QTY</th>
                <th style={{ padding: '12px 16px' }}>REORDER</th>
                <th style={{ padding: '12px 16px' }}>LOCATION</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const status = getStockStatus(p.quantity, p.reorderPoint);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'monospace', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {p.category}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {p.uom}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', verticalAlign: 'middle' }}>
                      {p.quantity}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', verticalAlign: 'middle' }}>
                      {p.reorderPoint}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {p.location}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className="gsharp-badge" style={{
                        color: status === 'IN STOCK' ? 'var(--accent-green)' : status === 'LOW STOCK' ? 'var(--accent-yellow)' : 'var(--accent-red)',
                        borderColor: status === 'IN STOCK' ? 'var(--accent-green)' : status === 'LOW STOCK' ? 'var(--accent-yellow)' : 'var(--accent-red)'
                      }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setViewingProduct(p)}
                          title="View Details"
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px' }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', padding: '4px' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          title="Delete Product"
                          style={{ background: 'none', border: 'none', color: 'var(--accent-red)', padding: '4px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="gsharp-card" style={{ width: '100%', maxWidth: '520px', padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              {editingProduct ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
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

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  PRODUCT NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steel Rods"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    SKU / CODE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAT-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
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
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    UNIT OF MEASURE (UOM)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kg, Units, Sheets"
                    value={formData.uom}
                    onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
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
                    PRIMARY LOCATION
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="Production Floor">Production Floor</option>
                    <option value="Production Rack">Production Rack</option>
                    <option value="Secondary Hub">Secondary Hub</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {!editingProduct && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      INITIAL STOCK
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
                )}

                <div style={{ gridColumn: editingProduct ? 'span 2' : 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    REORDER LEVEL
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
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
                    UNIT PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
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
              </div>

              {editingProduct && (
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Note: Stock quantity is modified via Inventory Operations (Receipts, Deliveries, Adjustments).
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
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
                  {editingProduct ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingProduct && (
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
          <div className="gsharp-card" style={{ width: '100%', maxWidth: '420px', padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> CONFIRM DELETION
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Are you sure you want to delete product <strong>{deletingProduct.name}</strong> (SKU: {deletingProduct.sku})?
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              This action cannot be undone and will update dashboard stock metrics immediately.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeletingProduct(null)}
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
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent-red)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                DELETE PRODUCT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS DRAWER / MODAL */}
      {viewingProduct && (
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{viewingProduct.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'monospace' }}>SKU: {viewingProduct.sku}</span>
              </div>
              <span className="gsharp-badge" style={{
                color: getStockStatus(viewingProduct.quantity, viewingProduct.reorderPoint) === 'IN STOCK' ? 'var(--accent-green)' : 'var(--accent-red)',
                borderColor: getStockStatus(viewingProduct.quantity, viewingProduct.reorderPoint) === 'IN STOCK' ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>
                {getStockStatus(viewingProduct.quantity, viewingProduct.reorderPoint)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8rem', marginBottom: '20px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CATEGORY</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingProduct.category}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>UOM</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingProduct.uom}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>TOTAL CURRENT STOCK</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{viewingProduct.quantity} {viewingProduct.uom}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>REORDER THRESHOLD</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingProduct.reorderPoint} {viewingProduct.uom}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>UNIT PRICE</span>
                <strong style={{ color: 'var(--accent-green)' }}>₹{viewingProduct.unitPrice.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>PRIMARY LOCATION</span>
                <strong style={{ color: 'var(--text-primary)' }}>{viewingProduct.location}</strong>
              </div>
            </div>

            {/* Location breakdown */}
            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                // LOCATION STOCK AVAILABILITY BREAKDOWN
              </span>
              {viewingProduct.stockByLocation ? (
                Object.entries(viewingProduct.stockByLocation).map(([loc, qty]) => (
                  <div key={loc} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{loc}:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{qty} {viewingProduct.uom}</strong>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{viewingProduct.location}:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{viewingProduct.quantity} {viewingProduct.uom}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewingProduct(null)}
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
