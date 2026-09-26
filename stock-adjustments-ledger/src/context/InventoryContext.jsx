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

const defaultSuppliers = [
  { id: 'SUP-001', name: 'ABC Supplies', contact: 'sales@abcsupplies.com' },
  { id: 'SUP-002', name: 'Global Industrial', contact: 'orders@globalind.com' },
  { id: 'SUP-003', name: 'Prime Traders', contact: 'info@primetraders.in' }
];

const defaultCustomers = [
  { id: 'CUST-001', name: 'XYZ Retail', contact: 'orders@xyzretail.com' },
  { id: 'CUST-002', name: 'Metro Distributors', contact: 'supply@metrodist.com' },
  { id: 'CUST-003', name: 'Prime Retailers', contact: 'contact@primeretailers.in' }
];

const defaultReceipts = [
  { 
    id: 'WH/IN/0001', 
    supplier: 'ABC Supplies', 
    date: '2026-09-26', 
    destination: 'Main Warehouse', 
    status: 'PENDING',
    lines: [
      { productId: 'PROD-001', productName: 'Steel Rods', sku: 'MAT-001', uom: 'Kg', quantity: 50 }
    ]
  },
  { 
    id: 'WH/IN/0002', 
    supplier: 'Global Industrial', 
    date: '2026-09-25', 
    destination: 'Main Warehouse', 
    status: 'VALIDATED',
    lines: [
      { productId: 'PROD-002', productName: 'Office Chairs', sku: 'FUR-001', uom: 'Units', quantity: 20 }
    ]
  }
];

const defaultDeliveries = [
  { 
    id: 'WH/OUT/0001', 
    customer: 'XYZ Retail', 
    date: '2026-09-26', 
    source: 'Main Warehouse', 
    status: 'PACKED',
    lines: [
      { productId: 'PROD-001', productName: 'Steel Rods', sku: 'MAT-001', uom: 'Kg', quantity: 20 },
      { productId: 'PROD-002', productName: 'Office Chairs', sku: 'FUR-001', uom: 'Units', quantity: 5 }
    ]
  },
  { 
    id: 'WH/OUT/0002', 
    customer: 'Metro Distributors', 
    date: '2026-09-25', 
    source: 'Main Warehouse', 
    status: 'VALIDATED',
    lines: [
      { productId: 'PROD-002', productName: 'Office Chairs', sku: 'FUR-001', uom: 'Units', quantity: 5 }
    ]
  }
];

const initialTransfers = [
  { id: 'TR-2026-014', fromLocation: 'Main Warehouse', toLocation: 'Production Floor', itemsCount: 25, status: 'Pending', createdAt: '2026-09-26 08:30' }
];

const defaultMovements = [
  { id: 'MOV-1001', type: 'Receipt', reference: 'WH/IN/0002', productName: 'Office Chairs', qty: '+20', from: 'Global Industrial', to: 'Main Warehouse', timestamp: '2026-09-25 16:20' },
  { id: 'MOV-1002', type: 'Delivery', reference: 'WH/OUT/0002', productName: 'Office Chairs', qty: '-5', from: 'Main Warehouse', to: 'Metro Distributors', timestamp: '2026-09-25 17:10' }
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

  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem('stocksense_receipts');
    return saved ? JSON.parse(saved) : defaultReceipts;
  });

  const [deliveries, setDeliveries] = useState(() => {
    const saved = localStorage.getItem('stocksense_deliveries');
    return saved ? JSON.parse(saved) : defaultDeliveries;
  });

  const [suppliers] = useState(defaultSuppliers);
  const [customers] = useState(defaultCustomers);
  const [transfers] = useState(initialTransfers);
  const [movements, setMovements] = useState(() => {
    const saved = localStorage.getItem('stocksense_movements');
    return saved ? JSON.parse(saved) : defaultMovements;
  });
  const [locations] = useState(initialLocations);
  const [notification, setNotification] = useState(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('stocksense_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('stocksense_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('stocksense_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('stocksense_movements', JSON.stringify(movements));
  }, [movements]);

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

  // Receipt Actions
  const addReceipt = (receiptData) => {
    const count = receipts.length + 1;
    const newId = `WH/IN/${count.toString().padStart(4, '0')}`;

    const newReceipt = {
      id: newId,
      supplier: receiptData.supplier,
      destination: receiptData.destination,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      lines: receiptData.lines
    };

    setReceipts(prev => [newReceipt, ...prev]);
    showNotification(`Receipt '${newId}' created as PENDING.`);
    return { success: true, receipt: newReceipt };
  };

  const validateReceipt = (receiptId) => {
    const targetReceipt = receipts.find(r => r.id === receiptId);
    if (!targetReceipt) return { success: false, message: 'Receipt not found.' };

    if (targetReceipt.status === 'VALIDATED') {
      return { success: false, message: 'Receipt is already validated.' };
    }

    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const line = targetReceipt.lines.find(l => l.productId === product.id);
        if (!line) return product;

        const qtyToAdd = parseInt(line.quantity, 10) || 0;
        const currentLocQty = product.stockByLocation?.[targetReceipt.destination] || 0;

        return {
          ...product,
          quantity: product.quantity + qtyToAdd,
          stockByLocation: {
            ...(product.stockByLocation || {}),
            [targetReceipt.destination]: currentLocQty + qtyToAdd
          }
        };
      });
    });

    setReceipts(prevReceipts => prevReceipts.map(r => r.id === receiptId ? { ...r, status: 'VALIDATED' } : r));

    const newMovements = targetReceipt.lines.map((line, idx) => ({
      id: `MOV-${Date.now().toString().slice(-4)}-${idx}`,
      type: 'Receipt',
      reference: targetReceipt.id,
      productName: line.productName,
      qty: `+${line.quantity}`,
      from: targetReceipt.supplier,
      to: targetReceipt.destination,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }));

    setMovements(prev => [...newMovements, ...prev]);
    showNotification(`Receipt '${receiptId}' validated! Stock updated successfully.`);
    return { success: true };
  };

  // Delivery Actions (DRAFT -> READY -> PICKED -> PACKED -> VALIDATED)
  const addDelivery = (deliveryData) => {
    const count = deliveries.length + 1;
    const newId = `WH/OUT/${count.toString().padStart(4, '0')}`;

    const newDelivery = {
      id: newId,
      customer: deliveryData.customer,
      source: deliveryData.source,
      date: new Date().toISOString().split('T')[0],
      status: 'READY', // Starts as READY for Pick/Pack workflow
      lines: deliveryData.lines
    };

    setDeliveries(prev => [newDelivery, ...prev]);
    showNotification(`Delivery Order '${newId}' created as READY.`);
    return { success: true, delivery: newDelivery };
  };

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d));
    showNotification(`Delivery '${deliveryId}' status updated to ${newStatus}.`);
  };

  const validateDelivery = (deliveryId) => {
    const targetDelivery = deliveries.find(d => d.id === deliveryId);
    if (!targetDelivery) return { success: false, message: 'Delivery order not found.' };

    if (targetDelivery.status === 'VALIDATED') {
      return { success: false, message: 'Delivery order is already validated.' };
    }

    // Safety check: Re-verify current stock at source location before validation
    for (const line of targetDelivery.lines) {
      const prod = products.find(p => p.id === line.productId);
      const availableLocStock = prod?.stockByLocation?.[targetDelivery.source] || 0;
      if (!prod || availableLocStock < line.quantity) {
        return {
          success: false,
          message: `Insufficient stock for '${line.productName}' at ${targetDelivery.source}. Available: ${availableLocStock} ${line.uom}, Requested: ${line.quantity}.`
        };
      }
    }

    // 1. Subtract stock specifically from selected source location and total quantity
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const line = targetDelivery.lines.find(l => l.productId === product.id);
        if (!line) return product;

        const qtyToSubtract = parseInt(line.quantity, 10) || 0;
        const currentLocQty = product.stockByLocation?.[targetDelivery.source] || 0;

        return {
          ...product,
          quantity: Math.max(0, product.quantity - qtyToSubtract),
          stockByLocation: {
            ...(product.stockByLocation || {}),
            [targetDelivery.source]: Math.max(0, currentLocQty - qtyToSubtract)
          }
        };
      });
    });

    // 2. Mark delivery status as VALIDATED
    setDeliveries(prevDeliveries => prevDeliveries.map(d => d.id === deliveryId ? { ...d, status: 'VALIDATED' } : d));

    // 3. Log movement for future Stock Ledger audit trail
    const newMovements = targetDelivery.lines.map((line, idx) => ({
      id: `MOV-${Date.now().toString().slice(-4)}-${idx}`,
      type: 'Delivery',
      reference: targetDelivery.id,
      productName: line.productName,
      qty: `-${line.quantity}`,
      from: targetDelivery.source,
      to: targetDelivery.customer,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }));

    setMovements(prev => [...newMovements, ...prev]);
    showNotification(`Delivery '${deliveryId}' validated! Stock dispatched successfully.`);
    return { success: true };
  };

  // Computed KPIs dynamically derived from current state
  const totalProducts = products.length;
  const totalStockQuantity = products.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalValuation = products.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.reorderPoint);
  const outOfStockItems = products.filter(p => p.quantity === 0);
  const pendingReceiptsCount = receipts.filter(r => r.status === 'PENDING').length;
  const pendingDeliveriesCount = deliveries.filter(d => d.status !== 'VALIDATED').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Pending').length;

  return (
    <InventoryContext.Provider value={{
      products,
      receipts,
      deliveries,
      suppliers,
      customers,
      transfers,
      movements,
      locations,
      notification,
      addProduct,
      editProduct,
      deleteProduct,
      addReceipt,
      validateReceipt,
      addDelivery,
      updateDeliveryStatus,
      validateDelivery,
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
