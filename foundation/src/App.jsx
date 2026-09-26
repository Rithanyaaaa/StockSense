import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Placeholder } from './components/Placeholder';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
        return (
          <Placeholder 
            title="Products" 
            description="Manage stock keeping units (SKUs), categories, reorder levels, unit prices, and warehouse locations."
            nextHourScope="Hour 2 Milestone"
          />
        );
      case 'receipts':
        return (
          <Placeholder 
            title="Incoming Stock Receipts" 
            description="Process incoming purchase orders, receive supplier shipments, and update inventory counts."
            nextHourScope="Hour 3 Milestone"
          />
        );
      case 'deliveries':
        return (
          <Placeholder 
            title="Delivery Orders" 
            description="Pick, pack, ship outgoing customer orders, and subtract stock from designated locations."
            nextHourScope="Hour 3 Milestone"
          />
        );
      case 'transfers':
        return (
          <Placeholder 
            title="Internal Stock Transfers" 
            description="Relocate inventory between internal zones, aisles, and separate warehouse facilities."
            nextHourScope="Hour 4 Milestone"
          />
        );
      case 'adjustments':
        return (
          <Placeholder 
            title="Stock Adjustments" 
            description="Perform physical inventory counts, reconcile discrepancies, and record scrap/damage."
            nextHourScope="Hour 4 Milestone"
          />
        );
      case 'ledger':
        return (
          <Placeholder 
            title="Move History / Stock Ledger" 
            description="Full immutable double-entry stock movement log tracking all historical receipts, deliveries, and transfers."
            nextHourScope="Hour 5 Milestone"
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <InventoryProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header title={getTabTitle()} />
          <main style={{ padding: '32px', flex: 1 }}>
            {renderContent()}
          </main>
        </div>
      </div>
    </InventoryProvider>
  );
}

export default App;
