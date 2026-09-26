import React, { useState } from 'react';
import { Bell, Search, Terminal, AlertTriangle, XCircle, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Header = ({ title }) => {
  const { lowStockItems, outOfStockItems, kpis } = useInventory();
  const [showAlertModal, setShowAlertModal] = useState(false);

  const totalAlerts = (kpis?.lowStockCount || 0) + (kpis?.outOfStockCount || 0);

  return (
    <header style={{
      height: '60px',
      backgroundColor: 'var(--bg-dark)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Terminal size={18} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>
          {title.toUpperCase()}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '6px 12px',
          color: 'var(--text-muted)'
        }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="SEARCH PRODUCTS, SKUS..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              outline: 'none',
              width: '180px',
              fontFamily: 'inherit',
              letterSpacing: '0.5px'
            }}
          />
        </div>

        {/* System Alert Bell */}
        <button 
          onClick={() => setShowAlertModal(true)}
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${totalAlerts > 0 ? 'var(--accent-yellow)' : 'var(--border-color)'}`,
            color: totalAlerts > 0 ? 'var(--accent-yellow)' : 'var(--text-secondary)',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Bell size={14} color={totalAlerts > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)'} />
          <span>ALERTS ({totalAlerts})</span>
        </button>

        {/* User Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ADMIN
          </div>
        </div>
      </div>

      {/* ALERT DETAILS MODAL */}
      {showAlertModal && (
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
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="var(--accent-yellow)" />
                INVENTORY ALERTS ({totalAlerts})
              </h3>
              <button onClick={() => setShowAlertModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {totalAlerts === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                All products are sufficiently stocked.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                {outOfStockItems.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      OUT OF STOCK ({outOfStockItems.length})
                    </div>
                    {outOfStockItems.map(item => (
                      <div key={item.id} style={{ padding: '10px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-red)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKU: {item.sku} | Loc: {item.location}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-red)' }}>Stock: 0 {item.uom}</span>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Reorder Level: {item.reorderPoint}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {lowStockItems.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-yellow)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      LOW STOCK ({lowStockItems.length})
                    </div>
                    {lowStockItems.map(item => (
                      <div key={item.id} style={{ padding: '10px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-yellow)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKU: {item.sku} | Loc: {item.location}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-yellow)' }}>Stock: {item.quantity} {item.uom}</span>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Reorder Level: {item.reorderPoint}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setShowAlertModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
