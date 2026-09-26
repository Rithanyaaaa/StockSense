import React from 'react';
import { Clock } from 'lucide-react';

export const Placeholder = ({ title, description, nextHourScope }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '48px 32px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '16px'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#6366f120',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-primary)'
      }}>
        <Clock size={32} />
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {title} Module
      </h3>

      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.5 }}>
        {description}
      </p>

      <div style={{
        marginTop: '12px',
        padding: '10px 18px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-dark)',
        border: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--accent-primary)',
        fontWeight: 600
      }}>
        Scheduled for Development: {nextHourScope}
      </div>
    </div>
  );
};
