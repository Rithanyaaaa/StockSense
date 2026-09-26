import React from 'react';
import { Bell, Search, Terminal } from 'lucide-react';

export const Header = ({ title }) => {
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
        <button style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.7rem',
          fontWeight: 700
        }}>
          <Bell size={14} color="var(--accent-yellow)" />
          <span>ALERTS (2)</span>
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
    </header>
  );
};
