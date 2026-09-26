import React from 'react';
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  XCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  DollarSign,
  MapPin,
  PieChart,
  CheckCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Dashboard = () => {
  const { kpis, lowStockItems, outOfStockItems, ledger, locations, products } = useInventory();

  const kpiCards = [
    { title: 'TOTAL PRODUCTS', value: kpis.totalProducts, icon: Package, color: 'var(--accent-blue)' },
    { title: 'TOTAL STOCK QTY', value: kpis.totalStockQuantity, icon: Boxes, color: 'var(--accent-purple)' },
    { title: 'INVENTORY VALUATION', value: `₹${kpis.totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'var(--accent-green)' },
    { title: 'LOW STOCK ITEMS', value: kpis.lowStockCount, icon: AlertTriangle, color: 'var(--accent-yellow)' },
    { title: 'OUT OF STOCK', value: kpis.outOfStockCount, icon: XCircle, color: 'var(--accent-red)' },
    { title: 'PENDING RECEIPTS', value: kpis.pendingReceiptsCount, icon: ArrowDownLeft, color: 'var(--accent-green)' },
    { title: 'PENDING DELIVERIES', value: kpis.pendingDeliveriesCount, icon: ArrowUpRight, color: 'var(--accent-blue)' },
    { title: 'INTERNAL TRANSFERS', value: kpis.pendingTransfersCount, icon: ArrowLeftRight, color: 'var(--accent-yellow)' }
  ];

  // Category distribution calculation
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.quantity;
    return acc;
  }, {});

  const watchlistItems = [...outOfStockItems, ...lowStockItems];
  const recentLedger = ledger.slice(0, 8); // top 8 recent validated movements

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards Grid */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '12px' }}>
          // METRICS & VALUATION OVERVIEW
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px'
        }}>
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                className="gsharp-card"
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: `3px solid ${card.color}`
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {card.value}
                  </div>
                </div>
                <div style={{ color: card.color }}>
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid: Stock Attention & Location Utilization */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* Stock Attention Watchlist */}
        <div className="gsharp-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="var(--accent-yellow)" />
              STOCK ATTENTION WATCHLIST
            </h3>
            <span className="gsharp-badge" style={{ color: watchlistItems.length > 0 ? 'var(--accent-yellow)' : 'var(--accent-green)', borderColor: watchlistItems.length > 0 ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
              {watchlistItems.length > 0 ? `${watchlistItems.length} ACTION REQUIRED` : 'ALL GOOD'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {watchlistItems.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={32} color="var(--accent-green)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-green)' }}>All products are sufficiently stocked.</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No items are currently low or out of stock.</span>
              </div>
            ) : (
              watchlistItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${item.quantity === 0 ? 'var(--accent-red)' : 'var(--accent-yellow)'}`
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      SKU: {item.sku} | LOC: {item.location}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 800, 
                      color: item.quantity === 0 ? 'var(--accent-red)' : 'var(--accent-yellow)' 
                    }}>
                      {item.quantity === 0 ? '[OUT OF STOCK]' : `${item.quantity} ${item.uom || 'UNITS'} LEFT`}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      THRESHOLD: {item.reorderPoint}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warehouse Locations Capacity Utilization */}
        <div className="gsharp-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--accent-blue)" />
              LOCATION CAPACITY UTILIZATION
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WAREHOUSE ZONES</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {locations.map((loc) => {
              const usagePercent = Math.round((loc.usedCapacity / loc.totalCapacity) * 100);
              return (
                <div key={loc.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{loc.name}</span>
                    <span style={{ color: usagePercent > 85 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                      {loc.usedCapacity} / {loc.totalCapacity} ({usagePercent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)' }}>
                    <div style={{
                      height: '100%',
                      width: `${usagePercent}%`,
                      backgroundColor: usagePercent > 85 ? 'var(--accent-red)' : 'var(--accent-primary)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Stock Distribution */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PieChart size={14} /> CATEGORY STOCK BREAKDOWN
            </h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat} style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{cat}:</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{count} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements Log (Stock Ledger Integration) */}
      <div className="gsharp-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.8px' }}>
            RECENT STOCK MOVEMENTS (LEDGER AUDIT)
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LIVE SYSTEM AUDIT</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {recentLedger.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No recent validated stock movements recorded.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  <th style={{ padding: '6px 12px 10px 0' }}>TYPE</th>
                  <th style={{ padding: '6px 12px 10px' }}>REFERENCE</th>
                  <th style={{ padding: '6px 12px 10px' }}>PRODUCT</th>
                  <th style={{ padding: '6px 12px 10px' }}>FROM / TO</th>
                  <th style={{ padding: '6px 12px 10px' }}>QTY</th>
                  <th style={{ padding: '6px 0 10px 12px', textAlign: 'right' }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {recentLedger.map((mov) => (
                  <tr key={mov.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 12px 10px 0' }}>
                      <span className="gsharp-badge" style={{
                        color: mov.type === 'RECEIPT' ? 'var(--accent-green)' : mov.type === 'DELIVERY' ? 'var(--accent-blue)' : mov.type === 'INTERNAL TRANSFER' ? 'var(--accent-purple)' : 'var(--accent-yellow)',
                        borderColor: mov.type === 'RECEIPT' ? 'var(--accent-green)' : mov.type === 'DELIVERY' ? 'var(--accent-blue)' : mov.type === 'INTERNAL TRANSFER' ? 'var(--accent-purple)' : 'var(--accent-yellow)'
                      }}>
                        {mov.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--accent-primary)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {mov.reference}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {mov.productName}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                      {mov.source} &rarr; {mov.destination}
                    </td>
                    <td style={{ 
                      padding: '10px', 
                      fontWeight: 800,
                      color: mov.quantity.startsWith('+') ? 'var(--accent-green)' : mov.quantity.startsWith('-') ? 'var(--accent-red)' : 'var(--accent-purple)'
                    }}>
                      {mov.quantity} {mov.uom}
                    </td>
                    <td style={{ padding: '10px 0 10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {mov.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
