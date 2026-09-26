import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Receipts } from './components/Receipts';
import { Deliveries } from './components/Deliveries';
import { Transfers } from './components/Transfers';
import { Adjustments } from './components/Adjustments';
import { Ledger } from './components/Ledger';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { notification } = useInventory();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Inventory Overview & Dashboard';
      case 'products': return 'Product Master Catalog';
      case 'receipts': return 'Incoming Stock Receipts';
      case 'deliveries': return 'Delivery Orders / Outgoing';
      case 'transfers': return 'Internal Warehouse Transfers';
      case 'adjustments': return 'Stock Quantity Adjustments';
      case 'ledger': return 'Move History & Audit Ledger';
      default: return 'StockSense';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'receipts':
        return <Receipts />;
      case 'deliveries':
        return <Deliveries />;
      case 'transfers':
        return <Transfers />;
      case 'adjustments':
        return <Adjustments />;
      case 'ledger':
        return <Ledger />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={getTabTitle()} />

        {/* Global Toast Notification */}
        {notification && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: notification.type === 'info' ? 'var(--accent-blue)' : 'var(--accent-green)',
            color: '#ffffff',
            padding: '12px 20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 999
          }}>
            {notification.msg}
          </div>
        )}

        <main style={{ padding: '28px', flex: 1 }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <InventoryProvider>
      <MainLayout />
    </InventoryProvider>
  );
}

export default App;
