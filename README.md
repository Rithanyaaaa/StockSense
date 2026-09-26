# StockSense — Inventory Management System

StockSense is a modern, high-performance, centralized Inventory Management System designed to track products, multi-warehouse stock levels, incoming receipts, outgoing delivery orders, internal location transfers, physical stock adjustments, and double-entry stock ledger movement history.

---

## 🚀 Key Features

- **📊 Metrics & KPI Dashboard**: Real-time total inventory valuation, total stock quantity, low-stock warnings, and warehouse location capacity utilization.
- **📦 Product Master Catalog**: Manage SKUs, product categories, unit prices, UOMs, primary locations, and minimum reorder points.
- **📥 Incoming Stock Receipts**: Process purchase orders from suppliers with multi-product line items and validate stock increments into specific destination locations.
- **📤 Outgoing Delivery Orders**: Handle customer order dispatch workflows (**Ready → Pick → Pack → Validate**) with stock availability checks and dynamic subtractions.
- **🔄 Internal Warehouse Transfers**: Relocate inventory across warehouses, racks, and production floors with **zero net inventory mutation** guarantee.
- **⚖️ Stock Adjustments**: Reconcile system recorded stock against physical audit counts with automatic variance calculations.
- **📜 Stock Ledger & Audit Trail**: Real-time double-entry movement log tracking before/after inventory levels for every validated transaction.
- **🔔 Dynamic Low-Stock Alerts**: Instant notification bell badge and detailed watchlist for items reaching or dropping below reorder thresholds.
- **🔍 Smart Search & Multi-Filters**: Instant filtering by SKU, product name, status, supplier, customer, and warehouse location with quick **Clear Filters** reset.

---

## 🔄 Core Inventory Flow & Source of Truth

All modules in StockSense consume and update a single centralized React context (`InventoryContext.jsx`) backed by `localStorage` persistence.

```
Products Master
      ↓
Inventory Central State
      ↓
┌───────────────┬────────────────┬───────────────────┬──────────────────┐
│   Receipts    │   Deliveries   │  Internal Moves   │   Adjustments    │
│  (+ Stock)    │   (- Stock)    │ (Relocate Stock)  │ (Reconcile Qty)  │
└───────┬───────┴────────┬───────┴─────────┬─────────┴────────┬─────────┘
        │                │                 │                  │
        └────────────────┼─────────────────┴──────────────────┘
                         ↓
               Stock Ledger Audit Log
                         ↓
             Real-Time Dashboard & KPIs
```

---

## 🛠️ Main Workflows

### 1. Incoming Receipt Flow
`Create Receipt` → Select Supplier & Destination Location → Add Line Items & Quantities → **Validate** → Inventory increases & Ledger entry created.

### 2. Delivery Order Flow
`Create Delivery` → Select Customer & Source Location → Add Line Items → **Pick** → **Pack** → **Validate** → Inventory decreases & Dispatch logged.

### 3. Internal Warehouse Transfer
`Create Transfer` → Select Source & Destination Location → Add Line Items → **Validate** → Source location stock decreases, Destination location stock increases (**Total stock balance unchanged**).

### 4. Physical Stock Adjustment
`Create Adjustment` → Select Product & Location → Input Physical Count → **Validate** → Inventory reconciles to physical count & Variance logged.

---

## 🧪 Integration & Scenario Test Verification

The application has been verified against the following cross-module scenario test:

```
[INITIAL STATE]
Steel Rods (MAT-001):
- Main Warehouse: 100 Kg
- Production Floor: 20 Kg
Total Global Stock: 120 Kg

[STEP 1: RECEIPT WH/IN/0001]
Receive +50 Kg at Main Warehouse
Result: Main Warehouse = 150 Kg, Production Floor = 20 Kg (Total = 170 Kg)
Ledger: RECEIPT +50 Kg

[STEP 2: DELIVERY WH/OUT/0001]
Dispatch -20 Kg from Main Warehouse
Result: Main Warehouse = 130 Kg, Production Floor = 20 Kg (Total = 150 Kg)
Ledger: DELIVERY -20 Kg

[STEP 3: INTERNAL TRANSFER INT/0001]
Relocate 30 Kg from Main Warehouse → Production Floor
Result: Main Warehouse = 100 Kg, Production Floor = 50 Kg (Total = 150 Kg)
Ledger: INTERNAL TRANSFER 30 Kg

[STEP 4: STOCK ADJUSTMENT ADJ/0001]
Physical Count at Main Warehouse = 97 Kg (-3 Kg Variance)
Result: Main Warehouse = 97 Kg, Production Floor = 50 Kg
FINAL VERIFIED TOTAL GLOBAL STOCK: 147 Kg
```

---

## 💻 Technology Stack

- **Core Framework**: React 19 + Vite 8
- **State Management**: Centralized React Context (`InventoryContext`)
- **Icons**: Lucide React
- **Styling**: Modern dark glassmorphism CSS design system (`index.css`)
- **Persistence**: Browser `localStorage`

---

## ⚡ Quick Start & Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/Rithanyaaaa/StockSense.git

# 2. Navigate to project folder
cd StockSense

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev

# 5. Build production bundle
npm run build
```

---

## 📋 Hackathon Presentation Checklist

- [x] Dashboard KPI cards (Total Products, Total Stock Qty, Valuation, Low Stock, Pending Operations) update dynamically.
- [x] Product search by SKU, Name, Category, Location works seamlessly across modules.
- [x] Low stock alerts badge and modal drawer show real-time stock shortages.
- [x] Receipts increment location stock on validation.
- [x] Deliveries decrement location stock on validation with negative stock prevention.
- [x] Transfers shift stock between locations without mutating total balance.
- [x] Adjustments reconcile system stock to physical counts.
- [x] Stock Ledger logs every validated movement with timestamp and audit history.
- [x] LocalStorage keeps inventory intact across page refreshes.
