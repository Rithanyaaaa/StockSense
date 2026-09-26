import React, { createContext, useContext, useState } from 'react';

// Sample initial inventory data
const initialProducts = [
  { id: 'PROD-001', name: 'Ergonomic Desk Chair', sku: 'FUR-DESK-001', category: 'Furniture', quantity: 45, reorderPoint: 15, unitPrice: 199.99, location: 'WH-MAIN-A1' },
  { id: 'PROD-002', name: 'Mechanical Gaming Keyboard', sku: 'ELE-KEY-002', category: 'Electronics', quantity: 8, reorderPoint: 10, unitPrice: 89.99, location: 'WH-MAIN-B2' },
  { id: 'PROD-003', name: 'Ultra-wide Monitor 34"', sku: 'ELE-MON-003', category: 'Electronics', quantity: 0, reorderPoint: 5, unitPrice: 449.99, location: 'WH-MAIN-B1' },
  { id: 'PROD-004', name: 'USB-C Docking Station', sku: 'ELE-DOC-004', category: 'Electronics', quantity: 18, reorderPoint: 5, unitPrice: 129.99, location: 'WH-MAIN-B3' },
  { id: 'PROD-005', name: 'Standing Desk Frame', sku: 'FUR-DESK-005', category: 'Furniture', quantity: 3, reorderPoint: 8, unitPrice: 299.99, location: 'WH-MAIN-A2' },
  { id: 'PROD-006', name: 'Noise-Canceling Headphones', sku: 'ELE-AUD-006', category: 'Electronics', quantity: 62, reorderPoint: 20, unitPrice: 179.99, location: 'WH-SEC-C1' }
];

const initialReceipts = [
  { id: 'REC-2026-001', supplier: 'TechParts Direct', date: '2026-09-27', itemsCount: 150, status: 'Pending', expectedLocation: 'WH-MAIN-B2' },
  { id: 'REC-2026-002', supplier: 'ErgoComfort Inc', date: '2026-09-28', itemsCount: 40, status: 'Pending', expectedLocation: 'WH-MAIN-A1' },
  { id: 'REC-2026-003', supplier: 'Global Audio Supplies', date: '2026-09-25', itemsCount: 100, status: 'Received', expectedLocation: 'WH-SEC-C1' }
];

const initialDeliveries = [
  { id: 'DEL-2026-089', customer: 'Acme Corp', date: '2026-09-26', itemsCount: 12, status: 'Pending', destination: 'New York, NY' },
  { id: 'DEL-2026-090', customer: 'Starlight Tech', date: '2026-09-27', itemsCount: 5, status: 'Pending', destination: 'San Francisco, CA' },
  { id: 'DEL-2026-091', customer: 'Nexus Solutions', date: '2026-09-26', itemsCount: 20, status: 'Shipped', destination: 'Austin, TX' }
];

const initialTransfers = [
  { id: 'TR-2026-014', fromLocation: 'WH-MAIN-A1', toLocation: 'WH-SEC-A1', itemsCount: 25, status: 'Pending', createdAt: '2026-09-26 08:30' },
  { id: 'TR-2026-015', fromLocation: 'WH-SEC-C1', toLocation: 'WH-MAIN-B3', itemsCount: 10, status: 'Completed', createdAt: '2026-09-25 14:15' }
];

const initialMovements = [
  { id: 'MOV-1001', type: 'Receipt', reference: 'REC-2026-003', productName: 'Noise-Canceling Headphones', qty: '+100', from: 'Supplier', to: 'WH-SEC-C1', timestamp: '2026-09-25 16:20' },
  { id: 'MOV-1002', type: 'Delivery', reference: 'DEL-2026-091', productName: 'Ergonomic Desk Chair', qty: '-20', from: 'WH-MAIN-A1', to: 'Customer (Nexus)', timestamp: '2026-09-26 09:10' },
  { id: 'MOV-1003', type: 'Transfer', reference: 'TR-2026-015', productName: 'USB-C Docking Station', qty: '10', from: 'WH-SEC-C1', to: 'WH-MAIN-B3', timestamp: '2026-09-25 14:15' },
  { id: 'MOV-1004', type: 'Adjustment', reference: 'ADJ-2026-004', productName: 'Mechanical Gaming Keyboard', qty: '-2', from: 'WH-MAIN-B2', to: 'Audit Correction', timestamp: '2026-09-24 11:45' }
];

// Warehouse Locations Data
const initialLocations = [
  { id: 'WH-MAIN-A1', name: 'Main Warehouse - Zone A1', totalCapacity: 500, usedCapacity: 320, activeProducts: 14, status: 'Optimal' },
  { id: 'WH-MAIN-B1', name: 'Main Warehouse - Zone B1', totalCapacity: 400, usedCapacity: 380, activeProducts: 18, status: 'Near Full' },
  { id: 'WH-SEC-C1', name: 'Secondary Hub - Zone C1', totalCapacity: 600, usedCapacity: 210, activeProducts: 8, status: 'Optimal' }
];

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [products] = useState(initialProducts);
  const [receipts] = useState(initialReceipts);
  const [deliveries] = useState(initialDeliveries);
  const [transfers] = useState(initialTransfers);
  const [movements] = useState(initialMovements);
  const [locations] = useState(initialLocations);

  // Computed KPIs
  const totalProducts = products.length;
  const totalStockQuantity = products.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalValuation = products.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.reorderPoint);
  const outOfStockItems = products.filter(p => p.quantity === 0);
  const pendingReceiptsCount = receipts.filter(r => r.status === 'Pending').length;
  const pendingDeliveriesCount = deliveries.filter(d => d.status === 'Pending').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Pending').length;

  return (
    <InventoryContext.Provider value={{
      products,
      receipts,
      deliveries,
      transfers,
      movements,
      locations,
      kpis: {
        totalProducts,
        totalStockQuantity,
        totalValuation,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        pendingReceiptsCount,
        pendingDeliveriesCount,
        pendingTransfersCount,
      },
      lowStockItems,
      outOfStockItems
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
