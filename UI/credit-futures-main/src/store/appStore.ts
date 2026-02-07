import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Product {
  id: string;
  name: string;
  type: 'SERVICE' | 'DIGITAL' | 'PHYSICAL';
  price: number;
  description: string;
  category: string;
}

export type PositionDirection = 'UNSET' | 'LONG' | 'SHORT';
export type PositionStatus = 'UNCONFIGURED' | 'ACTIVE' | 'SETTLED' | 'BOUNCED';

export interface Position {
  id: string;
  productId: string;
  productName: string;
  purchaseAmount: number;
  xrpInvested: number;
  xrpEntryPrice: number;
  direction: PositionDirection;
  maxPayment: number;
  minPayment: number;
  timeLimit: number; // days
  startTime: number; // timestamp
  status: PositionStatus;
  settledAmount?: number;
  settledAt?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppState {
  // XRP Price
  xrpPrice: number;
  xrpChange24h: number;
  setXrpPrice: (price: number) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Positions
  positions: Position[];
  addPosition: (position: Omit<Position, 'id'>) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  configurePosition: (id: string, direction: PositionDirection, maxPayment: number, minPayment: number, timeLimit: number) => void;
  
  // Balance
  balance: number;
  creditOutstanding: number;
  updateBalance: (amount: number) => void;
}

// Mock Products
export const PRODUCTS: Product[] = [
  { id: '1', name: 'CLOUD SERVER HOSTING', type: 'SERVICE', price: 299.99, description: '12-month enterprise hosting', category: 'INFRASTRUCTURE' },
  { id: '2', name: 'SSL CERTIFICATE PRO', type: 'DIGITAL', price: 149.99, description: 'Wildcard SSL for 2 years', category: 'SECURITY' },
  { id: '3', name: 'API GATEWAY LICENSE', type: 'DIGITAL', price: 499.99, description: 'Unlimited API calls, 1 year', category: 'INFRASTRUCTURE' },
  { id: '4', name: 'DEVELOPER MACBOOK PRO', type: 'PHYSICAL', price: 2499.99, description: 'M3 Max, 32GB, 1TB', category: 'HARDWARE' },
  { id: '5', name: 'CODE REVIEW SERVICE', type: 'SERVICE', price: 599.99, description: 'Full codebase audit', category: 'CONSULTING' },
  { id: '6', name: 'DESIGN SYSTEM TEMPLATE', type: 'DIGITAL', price: 79.99, description: 'Complete UI kit with 200+ components', category: 'DESIGN' },
  { id: '7', name: 'PENETRATION TEST', type: 'SERVICE', price: 1999.99, description: 'Comprehensive security assessment', category: 'SECURITY' },
  { id: '8', name: 'MONITOR 4K 32"', type: 'PHYSICAL', price: 899.99, description: 'Professional display, HDR1000', category: 'HARDWARE' },
  { id: '9', name: 'DATABASE OPTIMIZATION', type: 'SERVICE', price: 799.99, description: 'Performance tuning session', category: 'CONSULTING' },
  { id: '10', name: 'PREMIUM DOMAIN', type: 'DIGITAL', price: 2999.99, description: 'Premium .io domain, lifetime', category: 'DIGITAL' },
  { id: '11', name: 'ERGONOMIC CHAIR', type: 'PHYSICAL', price: 1299.99, description: 'Herman Miller Aeron', category: 'HARDWARE' },
  { id: '12', name: 'CI/CD PIPELINE SETUP', type: 'SERVICE', price: 449.99, description: 'Complete DevOps configuration', category: 'INFRASTRUCTURE' },
];

// Initial mock positions
const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    productId: '1',
    productName: 'CLOUD SERVER HOSTING',
    purchaseAmount: 299.99,
    xrpInvested: 600,
    xrpEntryPrice: 0.4999,
    direction: 'LONG',
    maxPayment: 314.99,
    minPayment: 239.99,
    timeLimit: 5,
    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
  },
  {
    id: 'pos-2',
    productId: '4',
    productName: 'DEVELOPER MACBOOK PRO',
    purchaseAmount: 2499.99,
    xrpInvested: 5000,
    xrpEntryPrice: 0.4999,
    direction: 'SHORT',
    maxPayment: 2749.99,
    minPayment: 1999.99,
    timeLimit: 7,
    startTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
  },
  {
    id: 'pos-3',
    productId: '7',
    productName: 'PENETRATION TEST',
    purchaseAmount: 1999.99,
    xrpInvested: 4000,
    xrpEntryPrice: 0.4999,
    direction: 'UNSET',
    maxPayment: 2099.99,
    minPayment: 1599.99,
    timeLimit: 3,
    startTime: Date.now(),
    status: 'UNCONFIGURED',
  },
  {
    id: 'pos-4',
    productId: '3',
    productName: 'API GATEWAY LICENSE',
    purchaseAmount: 499.99,
    xrpInvested: 1000,
    xrpEntryPrice: 0.4999,
    direction: 'LONG',
    maxPayment: 524.99,
    minPayment: 399.99,
    timeLimit: 3,
    startTime: Date.now() - 2.5 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
  },
  {
    id: 'pos-5',
    productId: '10',
    productName: 'PREMIUM DOMAIN',
    purchaseAmount: 2999.99,
    xrpInvested: 6000,
    xrpEntryPrice: 0.4999,
    direction: 'UNSET',
    maxPayment: 3149.99,
    minPayment: 2399.99,
    timeLimit: 3,
    startTime: Date.now(),
    status: 'UNCONFIGURED',
  },
  {
    id: 'pos-6',
    productId: '5',
    productName: 'CODE REVIEW SERVICE',
    purchaseAmount: 599.99,
    xrpInvested: 1200,
    xrpEntryPrice: 0.4999,
    direction: 'LONG',
    maxPayment: 629.99,
    minPayment: 479.99,
    timeLimit: 5,
    startTime: Date.now() - 4 * 24 * 60 * 60 * 1000,
    status: 'SETTLED',
    settledAmount: 523.45,
    settledAt: Date.now() - 0.5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'pos-7',
    productId: '8',
    productName: 'MONITOR 4K 32"',
    purchaseAmount: 899.99,
    xrpInvested: 1800,
    xrpEntryPrice: 0.4999,
    direction: 'SHORT',
    maxPayment: 944.99,
    minPayment: 719.99,
    timeLimit: 3,
    startTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
    status: 'BOUNCED',
    settledAmount: 944.99,
    settledAt: Date.now() - 0.2 * 24 * 60 * 60 * 1000,
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // XRP Price
      xrpPrice: 0.5123,
      xrpChange24h: 2.45,
      setXrpPrice: (price) => set({ xrpPrice: price }),
      
      // Cart
      cart: [],
      addToCart: (product) => {
        const cart = get().cart;
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
          set({
            cart: cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ cart: [...cart, { product, quantity: 1 }] });
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item.product.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set({
            cart: get().cart.map(item =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),
      
      // Positions
      positions: INITIAL_POSITIONS,
      addPosition: (position) => {
        const id = `pos-${Date.now()}`;
        set({ positions: [...get().positions, { ...position, id }] });
      },
      updatePosition: (id, updates) => {
        set({
          positions: get().positions.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        });
      },
      configurePosition: (id, direction, maxPayment, minPayment, timeLimit) => {
        set({
          positions: get().positions.map(p =>
            p.id === id
              ? {
                  ...p,
                  direction,
                  maxPayment,
                  minPayment,
                  timeLimit,
                  status: 'ACTIVE' as PositionStatus,
                  startTime: Date.now(),
                }
              : p
          ),
        });
      },
      
      // Balance
      balance: 15420.50,
      creditOutstanding: 8299.93,
      updateBalance: (amount) => set({ balance: get().balance + amount }),
    }),
    {
      name: 'crypto-tomorrow-storage',
    }
  )
);
