import React, { useState } from 'react';
import { Search, Filter, History, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Ledger = () => {
  const { ledger, products, locations } = useInventory();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Filtered Ledger Calculation (sorted newest first)
  const filteredLedger = ledger.filter(entry => {
    const matchesSearch = 
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'All' || entry.type === selectedType;
    const matchesProduct = selectedProduct === 'All' || entry.productId === selectedProduct;
    const matchesLocation = 
      selectedLocation === 'All' || 
      entry.source === selectedLocation || 
      entry.destination === selectedLocation;

    return matchesSearch && matchesType && matchesProduct && matchesLocation;
  });

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'RECEIPT':
        return { color: 'var(--accent-green)', borderColor: 'var(--accent-green)', icon: ArrowDownLeft };
      case 'DELIVERY':
        return { color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', icon: ArrowUpRight };
      case 'INTERNAL TRANSFER':
        return { color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', icon: ArrowLeftRight };
      case 'ADJUSTMENT':
        return { color: 'var(--accent-yellow)', borderColor: 'var(--accent-yellow)', icon: SlidersHorizontal };
      default:
        return { color: 'var(--text-secondary)', borderColor: 'var(--text-secondary)', icon: History };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>
            STOCK LEDGER & AUDIT TRAIL ({filteredLedger.length})
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Complete double-entry stock movement log tracking receipts, deliveries, transfers, and adjustments.
          </p>
        </div>
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
            placeholder="SEARCH REF #, PRODUCT OR SKU..."
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

        {/* Movement Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>TYPE:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
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
            <option value="All">ALL MOVEMENTS</option>
            <option value="RECEIPT">RECEIPT</option>
            <option value="DELIVERY">DELIVERY</option>
            <option value="INTERNAL TRANSFER">INTERNAL TRANSFER</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
          </select>
        </div>

        {/* Product Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PRODUCT:</span>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
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
            <option value="All">ALL PRODUCTS</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
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

      {/* Stock Ledger Data Table */}
      <div className="gsharp-card" style={{ padding: '0', overflowX: 'auto' }}>
        {filteredLedger.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <History size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No stock ledger entries found.</p>
            <p style={{ fontSize: '0.75rem' }}>Validated receipts, deliveries, and adjustments will automatically populate this ledger.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
                <th style={{ padding: '12px 16px' }}>TYPE</th>
                <th style={{ padding: '12px 16px' }}>REFERENCE</th>
                <th style={{ padding: '12px 16px' }}>PRODUCT</th>
                <th style={{ padding: '12px 16px' }}>SKU</th>
                <th style={{ padding: '12px 16px' }}>QTY</th>
                <th style={{ padding: '12px 16px' }}>SOURCE &rarr; DESTINATION</th>
                <th style={{ padding: '12px 16px' }}>BEFORE STOCK</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>AFTER STOCK</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((entry) => {
                const badge = getTypeBadgeStyle(entry.type);
                const isPositive = entry.quantity.startsWith('+');
                const isNegative = entry.quantity.startsWith('-');

                return (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {entry.timestamp}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className="gsharp-badge" style={{ color: badge.color, borderColor: badge.borderColor }}>
                        {entry.type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--accent-primary)', fontWeight: 800, fontFamily: 'monospace', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {entry.reference}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {entry.productName}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                      {entry.sku}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: isPositive ? 'var(--accent-green)' : isNegative ? 'var(--accent-red)' : 'var(--text-primary)', verticalAlign: 'middle' }}>
                      {entry.quantity} {entry.uom}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {entry.source} &rarr; {entry.destination}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, verticalAlign: 'middle' }}>
                      {entry.beforeStock} {entry.uom}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)', verticalAlign: 'middle' }}>
                      {entry.afterStock} {entry.uom}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
