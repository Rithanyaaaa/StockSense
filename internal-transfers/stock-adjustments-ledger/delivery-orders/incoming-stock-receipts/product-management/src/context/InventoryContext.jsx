import React, { createContext, useContext, useState, useEffect } from 'react';

// Sample initial inventory data
const defaultProducts = [
  { 
    id: 'PROD-001', 
    name: 'Steel Rods', 
    sku: 'MAT-001', 
    category: 'Raw Materials', 
    uom: 'Kg', 
    quantity: 100, 
    reorderPoint: 20, 
    unitPrice: 450.00, 
    location: 'Main Warehouse',
    stockByLocation: { 'Main Warehouse': 70, 'Production Rack': 30 }
  },
  { 
    id: 'PROD-002', 
    name: 'Office Chairs', 
    sku: 'FUR-001', 
    category: 'Furniture', 
    uom: 'Units', 
    quantity: 8, 
    reorderPoint: 10, 
    unitPrice: 3499.00, 
    location: 'Main Warehouse',
    stockByLocation: { 'Main Warehouse': 8 }
  },
  { 
    id: 'PROD-003', 
    name: 'Wireless Keyboard', 
    sku: 'ELE-001', 
    category: 'Electronics', 
    uom: 'Units', 
    quantity: 0, 
    reorderPoint: 5, 
    unitPrice: 1299.00, 
    location: 'Production Floor',
    stockByLocation: { 'Production Floor': 0 }
  },
  { 
    id: 'PROD-004', 
    name: 'Ergonomic Desk Chair', 
    sku: 'FUR-DESK-001', 
    category: 'Furniture', 
    uom: 'Units', 
    quantity: 45, 
    reorderPoint: 15, 
    unitPrice: 4999.00, 
    location: 'Main Warehouse',
    stockByLocation: { 'Main Warehouse': 45 }
  },
  { 
    id: 'PROD-005', 
    name: 'Ultra-wide Monitor 34"', 
    sku: 'ELE-MON-003', 
    category: 'Electronics', 
    uom: 'Units', 
    quantity: 0, 
    reorderPoint: 5, 
    unitPrice: 32999.00, 
    location: 'Secondary Hub',
    stockByLocation: { 'Secondary Hub': 0 }
  },
  { 
    id: 'PROD-006', 
    name: 'Aluminum Sheets 4x8', 
    sku: 'MAT-002', 
    category: 'Raw Materials', 
    uom: 'Sheets', 
    quantity: 12, 
    reorderPoint: 15, 
    unitPrice: 2200.00, 
    location: 'Main Warehouse',
    stockByLocation: { 'Main Warehouse': 12 }
  }
];

const initialReceipts = [
  { id: 'REC-2026-001', supplier: 'TechParts Direct', date: '2026-09-27', itemsCount: 150, status: 'Pending', expectedLocation: 'Main Warehouse' },
  { id: 'REC-2026-002', supplier: 'ErgoComfort Inc', date: '2026-09-28', itemsCount: 40, status: 'Pending', expectedLocation: 'Main Warehouse' }
];

const initialDeliveries = [
  { id: 'DEL-2026-089', customer: 'Acme Corp', date: '2026-09-26', itemsCount: 12, status: 'Pending', destination: 'New York, NY' }
];

const initialTransfers = [
  { id: 'TR-2026-014', fromLocation: 'Main Warehouse', toLocation: 'Production Floor', itemsCount: 25, status: 'Pending', createdAt: '2026-09-26 08:30' }
];

const initialMovements = [
  { id: 'MOV-1001', type: 'Receipt', reference: 'REC-2026-003', productName: 'Wireless Keyboard', qty: '+50', from: 'Supplier', to: 'Production Floor', timestamp: '2026-09-25 16:20' },
  { id: 'MOV-1002', type: 'Delivery', reference: 'DEL-2026-091', productName: 'Steel Rods', qty: '-20', from: 'Main Warehouse', to: 'Customer (Nexus)', timestamp: '2026-09-26 09:10' }
];

const initialLocations = [
  { id: 'LOC-01', name: 'Main Warehouse', totalCapacity: 1000, usedCapacity: 450, status: 'Optimal' },
  { id: 'LOC-02', name: 'Production Floor', totalCapacity: 500, usedCapacity: 120, status: 'Optimal' },
  { id: 'LOC-03', name: 'Secondary Hub', totalCapacity: 800, usedCapacity: 350, status: 'Optimal' }
];

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('stocksense_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [receipts] = useState(initialReceipts);
  const [deliveries] = useState(initialDeliveries);
  const [transfers] = useState(initialTransfers);
  const [movements] = useState(initialMovements);
  const [locations] = useState(initialLocations);
  const [notification, setNotification] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('stocksense_products', JSON.stringify(products));
  }, [products]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Product CRUD actions
  const addProduct = (newProd) => {
    const existing = products.find(p => p.sku.toLowerCase() === newProd.sku.toLowerCase());
    if (existing) {
      return { success: false, message: `SKU '${newProd.sku}' already exists.` };
    }

    const initialQty = parseInt(newProd.quantity, 10) || 0;
    const loc = newProd.location || 'Main Warehouse';

    const createdProduct = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      name: newProd.name.trim(),
      sku: newProd.sku.trim().toUpperCase(),
      category: newProd.category,
      uom: newProd.uom || 'Units',
      quantity: initialQty,
      reorderPoint: parseInt(newProd.reorderPoint, 10) || 0,
      unitPrice: parseFloat(newProd.unitPrice) || 0,
      location: loc,
      stockByLocation: { [loc]: initialQty }
    };

    setProducts(prev => [createdProduct, ...prev]);
    showNotification(`Product '${createdProduct.name}' created successfully!`);
    return { success: true };
  };

  const editProduct = (id, updatedFields) => {
    // Check duplicate SKU if changed
    const existing = products.find(p => p.id !== id && p.sku.toLowerCase() === updatedFields.sku.toLowerCase());
    if (existing) {
      return { success: false, message: `SKU '${updatedFields.sku}' is used by another product.` };
    }

    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: updatedFields.name.trim(),
          sku: updatedFields.sku.trim().toUpperCase(),
          category: updatedFields.category,
          uom: updatedFields.uom,
          location: updatedFields.location,
          reorderPoint: parseInt(updatedFields.reorderPoint, 10) || 0,
          unitPrice: parseFloat(updatedFields.unitPrice) || p.unitPrice
          // Note: Stock quantity is preserved and not edited directly in product edit
        };
      }
      return p;
    }));

    showNotification('Product updated successfully!');
    return { success: true };
  };

  const deleteProduct = (id) => {
    const prod = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showNotification(`Product '${prod?.name || 'Item'}' deleted successfully.`, 'info');
  };

  // Helper to calculate stock status dynamically
  const getStockStatus = (quantity, reorderPoint) => {
    if (quantity === 0) return 'OUT OF STOCK';
    if (quantity <= reorderPoint) return 'LOW STOCK';
    return 'IN STOCK';
  };

  // Computed KPIs dynamically derived from current products state
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
      notification,
      addProduct,
      editProduct,
      deleteProduct,
      getStockStatus,
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
