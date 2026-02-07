export interface Position {
  id: string;
  item: string;
  purchaseAmount: number;
  xrpInvested: number;
  xrpQuantity: number;
  entryPrice: number;
  maxBound: number;
  minBound: number;
  timeLimit: Date;
  createdAt: Date;
  status: 'active' | 'settled' | 'bounced';
  settledAt?: Date;
  settledPrice?: number;
  settledAmount?: number;
}

export interface Activity {
  id: string;
  type: 'settlement' | 'bounce' | 'new_position' | 'bound_breach';
  message: string;
  timestamp: Date;
  amount?: number;
  isPositive?: boolean;
}

const now = new Date();

export const mockPositions: Position[] = [
  {
    id: 'POS-001',
    item: 'MacBook Pro 16"',
    purchaseAmount: 2499.00,
    xrpInvested: 2499.00,
    xrpQuantity: 4248.72,
    entryPrice: 0.5882,
    maxBound: 2624.00,
    minBound: 1999.00,
    timeLimit: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'POS-002',
    item: 'Sectional Sofa',
    purchaseAmount: 1899.00,
    xrpInvested: 1899.00,
    xrpQuantity: 3228.81,
    entryPrice: 0.5882,
    maxBound: 1994.00,
    minBound: 1519.00,
    timeLimit: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'POS-003',
    item: 'Weekly Groceries',
    purchaseAmount: 287.45,
    xrpInvested: 287.45,
    xrpQuantity: 488.72,
    entryPrice: 0.5882,
    maxBound: 301.82,
    minBound: 229.96,
    timeLimit: new Date(now.getTime() + 8 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'POS-004',
    item: 'Flight to NYC',
    purchaseAmount: 456.00,
    xrpInvested: 456.00,
    xrpQuantity: 775.59,
    entryPrice: 0.5882,
    maxBound: 478.80,
    minBound: 364.80,
    timeLimit: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'POS-005',
    item: 'Restaurant Dinner',
    purchaseAmount: 142.50,
    xrpInvested: 142.50,
    xrpQuantity: 242.35,
    entryPrice: 0.5882,
    maxBound: 149.63,
    minBound: 114.00,
    timeLimit: new Date(now.getTime() + 18 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'POS-006',
    item: 'Electric Bicycle',
    purchaseAmount: 1299.00,
    xrpInvested: 1299.00,
    xrpQuantity: 2208.77,
    entryPrice: 0.5882,
    maxBound: 1363.95,
    minBound: 1039.20,
    timeLimit: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'POS-007',
    item: 'Designer Watch',
    purchaseAmount: 4500.00,
    xrpInvested: 4500.00,
    xrpQuantity: 7652.54,
    entryPrice: 0.5882,
    maxBound: 4725.00,
    minBound: 3600.00,
    timeLimit: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'POS-008',
    item: 'Gaming Console',
    purchaseAmount: 549.99,
    xrpInvested: 549.99,
    xrpQuantity: 935.25,
    entryPrice: 0.5882,
    maxBound: 577.49,
    minBound: 439.99,
    timeLimit: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
];

export const mockHistory: Position[] = [
  {
    id: 'HIST-001',
    item: 'iPhone 15 Pro',
    purchaseAmount: 1199.00,
    xrpInvested: 1199.00,
    xrpQuantity: 2038.77,
    entryPrice: 0.5882,
    maxBound: 1258.95,
    minBound: 959.20,
    timeLimit: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    status: 'settled',
    settledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    settledPrice: 0.5540,
    settledAmount: 1129.47,
  },
  {
    id: 'HIST-002',
    item: 'Smart TV 65"',
    purchaseAmount: 899.00,
    xrpInvested: 899.00,
    xrpQuantity: 1528.56,
    entryPrice: 0.5882,
    maxBound: 943.95,
    minBound: 719.20,
    timeLimit: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    status: 'settled',
    settledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    settledPrice: 0.5650,
    settledAmount: 863.64,
  },
  {
    id: 'HIST-003',
    item: 'Office Chair',
    purchaseAmount: 450.00,
    xrpInvested: 450.00,
    xrpQuantity: 765.25,
    entryPrice: 0.5882,
    maxBound: 472.50,
    minBound: 360.00,
    timeLimit: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    status: 'bounced',
    settledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    settledPrice: 0.6350,
    settledAmount: 485.93,
  },
];

export const mockActivities: Activity[] = [
  {
    id: 'ACT-001',
    type: 'settlement',
    message: 'iPhone 15 Pro settled at $1,129.47',
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    amount: 69.53,
    isPositive: true,
  },
  {
    id: 'ACT-002',
    type: 'new_position',
    message: 'New position opened: MacBook Pro 16"',
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ACT-003',
    type: 'settlement',
    message: 'Smart TV 65" settled at $863.64',
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    amount: 35.36,
    isPositive: true,
  },
  {
    id: 'ACT-004',
    type: 'bounce',
    message: 'Office Chair bounced - max bound exceeded',
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    amount: -35.93,
    isPositive: false,
  },
  {
    id: 'ACT-005',
    type: 'bound_breach',
    message: 'Designer Watch approaching max bound',
    timestamp: new Date(now.getTime() - 30 * 60 * 1000),
  },
  {
    id: 'ACT-006',
    type: 'new_position',
    message: 'New position opened: Restaurant Dinner',
    timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
  },
];

export function calculatePnL(position: Position, currentPrice: number): { pnl: number; pnlPercent: number; currentValue: number } {
  const currentValue = position.xrpQuantity * currentPrice;
  const pnl = currentValue - position.xrpInvested;
  const pnlPercent = (pnl / position.xrpInvested) * 100;
  return { pnl, pnlPercent, currentValue };
}

export function getTimeRemaining(timeLimit: Date): string {
  const now = new Date();
  const diff = timeLimit.getTime() - now.getTime();
  
  if (diff <= 0) return 'EXPIRED';
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getPositionRisk(position: Position, currentPrice: number): 'safe' | 'warning' | 'danger' {
  const { currentValue } = calculatePnL(position, currentPrice);
  const maxPercent = (position.maxBound - currentValue) / (position.maxBound - position.minBound);
  const minPercent = (currentValue - position.minBound) / (position.maxBound - position.minBound);
  
  if (maxPercent < 0.1 || minPercent < 0.1) return 'danger';
  if (maxPercent < 0.25 || minPercent < 0.25) return 'warning';
  return 'safe';
}