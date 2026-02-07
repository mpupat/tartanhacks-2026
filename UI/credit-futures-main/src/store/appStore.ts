import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position, Purchase, SavedMarket, MarketCategory, PredictionDirection } from '@/types/kalshi';

// Types
export interface Product {
  id: string;
  name: string;
  type: 'SERVICE' | 'DIGITAL' | 'PHYSICAL';
  price: number;
  description: string;
  category: string;
  icon: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Positions
  positions: Position[];
  addPosition: (purchase: Purchase) => void;
  configurePosition: (
    id: string,
    marketTicker: string,
    marketTitle: string,
    marketCategory: MarketCategory,
    marketClosesAt: string,
    direction: PredictionDirection,
    entryPrice: number,
    maxRewardPercent: number,
    maxLossPercent: number,
    timeLimitDays: number
  ) => void;
  updatePositionPrice: (id: string, currentPrice: number) => void;
  settlePosition: (
    id: string,
    reason: Position['settlement_reason'],
    outcome: Position['final_outcome'],
    cashbackAmount: number,
    roi: number
  ) => void;

  // Saved Markets
  savedMarkets: SavedMarket[];
  saveMarket: (ticker: string) => void;
  unsaveMarket: (ticker: string) => void;
  isMarketSaved: (ticker: string) => boolean;

  // Balance
  balance: number;
  creditOutstanding: number;
  updateBalance: (amount: number) => void;
}

// Mock Products
export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cloud Server Hosting',
    type: 'SERVICE',
    price: 299.99,
    description: '12-month enterprise hosting',
    category: 'Infrastructure',
    icon: '☁️',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    name: 'Developer MacBook Pro',
    type: 'PHYSICAL',
    price: 2499.99,
    description: 'M3 Pro 14" 18GB RAM',
    category: 'Hardware',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    name: 'API Gateway License',
    type: 'DIGITAL',
    price: 499.99,
    description: 'Enterprise API management',
    category: 'Software',
    icon: '🔐',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    name: 'Wireless Headphones',
    type: 'PHYSICAL',
    price: 349.99,
    description: 'Noise cancelling over-ear headphones',
    category: 'Hardware',
    icon: '🎧',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    name: 'SSL Certificate Bundle',
    type: 'DIGITAL',
    price: 149.99,
    description: 'Wildcard SSL for 2 years',
    category: 'Security',
    icon: '🔒',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '6',
    name: 'Mechanical Keyboard',
    type: 'PHYSICAL',
    price: 299.99,
    description: 'Custom mechanical keyboard',
    category: 'Hardware',
    icon: '⌨️',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '7',
    name: 'Code Review Service',
    type: 'SERVICE',
    price: 799.99,
    description: 'Expert code audit',
    category: 'Consulting',
    icon: '🔍',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '8',
    name: 'Ultra-wide Monitor',
    type: 'PHYSICAL',
    price: 1299.99,
    description: '34" curved 4K display',
    category: 'Hardware',
    icon: '🖥️',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '9',
    name: 'Smart Home Hub',
    type: 'PHYSICAL',
    price: 149.99,
    description: 'Central control for all devices',
    category: 'Hardware',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1558002038-109155714297?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '10',
    name: 'Premium Domain',
    type: 'DIGITAL',
    price: 2999.99,
    description: 'Premium .io domain, lifetime',
    category: 'Digital',
    icon: '🌐',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '11',
    name: 'Ergonomic Chair',
    type: 'PHYSICAL',
    price: 1299.99,
    description: 'Herman Miller Aeron',
    category: 'Hardware',
    icon: '🪑',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '12',
    name: 'CI/CD Pipeline Setup',
    type: 'SERVICE',
    price: 449.99,
    description: 'Complete DevOps configuration',
    category: 'Infrastructure',
    icon: '🚀',
    image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=800'
  },
];

// Initial mock positions with new Kalshi-based structure
const INITIAL_POSITIONS: Position[] = [
  // Unconfigured position
  {
    id: 'pos-1',
    purchase: {
      id: 'purch-1',
      item_name: 'Developer MacBook Pro',
      item_icon: '💻',
      purchase_amount: 2499.99,
      purchase_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    market_ticker: null,
    market_title: null,
    market_category: null,
    market_closes_at: null,
    prediction_direction: null,
    entry_price: null,
    current_price: null,
    max_reward_percent: null,
    max_loss_percent: null,
    time_limit_days: null,
    expires_at: null,
    status: 'unconfigured',
    configured_at: null,
    settled_at: null,
    settlement_reason: null,
    final_outcome: null,
    cashback_amount: null,
    roi: null,
  },
  // Another unconfigured
  {
    id: 'pos-2',
    purchase: {
      id: 'purch-2',
      item_name: 'Ergonomic Chair',
      item_icon: '🪑',
      purchase_amount: 1299.99,
      purchase_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    market_ticker: null,
    market_title: null,
    market_category: null,
    market_closes_at: null,
    prediction_direction: null,
    entry_price: null,
    current_price: null,
    max_reward_percent: null,
    max_loss_percent: null,
    time_limit_days: null,
    expires_at: null,
    status: 'unconfigured',
    configured_at: null,
    settled_at: null,
    settlement_reason: null,
    final_outcome: null,
    cashback_amount: null,
    roi: null,
  },
  // Active position - winning
  {
    id: 'pos-3',
    purchase: {
      id: 'purch-3',
      item_name: 'Cloud Server Hosting',
      item_icon: '☁️',
      purchase_amount: 299.99,
      purchase_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    market_ticker: 'POLITICS-NOMINEE-MAR1',
    market_title: 'Senate confirms nominee by March 1?',
    market_category: 'politics',
    market_closes_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    prediction_direction: 'YES',
    entry_price: 67,
    current_price: 72,
    max_reward_percent: 20,
    max_loss_percent: 5,
    time_limit_days: 7,
    expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    configured_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    settled_at: null,
    settlement_reason: null,
    final_outcome: null,
    cashback_amount: null,
    roi: null,
  },
  // Active position - losing
  {
    id: 'pos-4',
    purchase: {
      id: 'purch-4',
      item_name: 'API Gateway License',
      item_icon: '🔐',
      purchase_amount: 499.99,
      purchase_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    market_ticker: 'WEATHER-NYC-50F-FEB8',
    market_title: 'NYC hits 50°F today?',
    market_category: 'weather',
    market_closes_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    prediction_direction: 'NO',
    entry_price: 66,
    current_price: 58,
    max_reward_percent: 15,
    max_loss_percent: 10,
    time_limit_days: 3,
    expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    configured_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    settled_at: null,
    settlement_reason: null,
    final_outcome: null,
    cashback_amount: null,
    roi: null,
  },
  // Settled position - won
  {
    id: 'pos-5',
    purchase: {
      id: 'purch-5',
      item_name: 'SSL Certificate Bundle',
      item_icon: '🔒',
      purchase_amount: 149.99,
      purchase_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    market_ticker: 'SPORTS-SUPERBOWL-WINNER',
    market_title: 'Chiefs win Super Bowl?',
    market_category: 'sports',
    market_closes_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    prediction_direction: 'YES',
    entry_price: 55,
    current_price: 100,
    max_reward_percent: 20,
    max_loss_percent: 5,
    time_limit_days: 7,
    expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'settled',
    configured_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    settled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    settlement_reason: 'market_resolved',
    final_outcome: 'win',
    cashback_amount: 30.00,
    roi: 20,
  },
  // Settled position - lost
  {
    id: 'pos-6',
    purchase: {
      id: 'purch-6',
      item_name: 'DevOps Toolkit',
      item_icon: '🛠️',
      purchase_amount: 199.99,
      purchase_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    market_ticker: 'ECON-JOBS-REPORT-JAN',
    market_title: 'Jobs report beats expectations?',
    market_category: 'economics',
    market_closes_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    prediction_direction: 'YES',
    entry_price: 45,
    current_price: 0,
    max_reward_percent: 15,
    max_loss_percent: 10,
    time_limit_days: 5,
    expires_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'settled',
    configured_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    settled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    settlement_reason: 'market_resolved',
    final_outcome: 'loss',
    cashback_amount: -20.00,
    roi: -10,
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart
      cart: [],
      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find(item => item.product.id === product.id);
        if (existingItem) {
          return {
            cart: state.cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          };
        }
        return { cart: [...state.cart, { product, quantity: 1 }] };
      }),
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.product.id !== productId),
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        cart: quantity <= 0
          ? state.cart.filter(item => item.product.id !== productId)
          : state.cart.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
      })),
      clearCart: () => set({ cart: [] }),

      // Positions
      positions: INITIAL_POSITIONS,

      addPosition: (purchase) => set((state) => ({
        positions: [
          ...state.positions,
          {
            id: `pos-${Date.now()}`,
            purchase,
            market_ticker: null,
            market_title: null,
            market_category: null,
            market_closes_at: null,
            prediction_direction: null,
            entry_price: null,
            current_price: null,
            max_reward_percent: null,
            max_loss_percent: null,
            time_limit_days: null,
            expires_at: null,
            status: 'unconfigured',
            configured_at: null,
            settled_at: null,
            settlement_reason: null,
            final_outcome: null,
            cashback_amount: null,
            roi: null,
          },
        ],
      })),

      configurePosition: (
        id,
        marketTicker,
        marketTitle,
        marketCategory,
        marketClosesAt,
        direction,
        entryPrice,
        maxRewardPercent,
        maxLossPercent,
        timeLimitDays
      ) => set((state) => ({
        positions: state.positions.map((pos) =>
          pos.id === id
            ? {
              ...pos,
              market_ticker: marketTicker,
              market_title: marketTitle,
              market_category: marketCategory,
              market_closes_at: marketClosesAt,
              prediction_direction: direction,
              entry_price: entryPrice,
              current_price: entryPrice,
              max_reward_percent: maxRewardPercent,
              max_loss_percent: maxLossPercent,
              time_limit_days: timeLimitDays,
              expires_at: new Date(
                Date.now() + timeLimitDays * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: 'active',
              configured_at: new Date().toISOString(),
            }
            : pos
        ),
      })),

      updatePositionPrice: (id, currentPrice) => set((state) => ({
        positions: state.positions.map((pos) =>
          pos.id === id ? { ...pos, current_price: currentPrice } : pos
        ),
      })),

      settlePosition: (id, reason, outcome, cashbackAmount, roi) => set((state) => ({
        positions: state.positions.map((pos) =>
          pos.id === id
            ? {
              ...pos,
              status: 'settled',
              settled_at: new Date().toISOString(),
              settlement_reason: reason,
              final_outcome: outcome,
              cashback_amount: cashbackAmount,
              roi,
            }
            : pos
        ),
        balance: state.balance + cashbackAmount,
      })),

      // Saved Markets
      savedMarkets: [],

      saveMarket: (ticker) => set((state) => ({
        savedMarkets: [
          ...state.savedMarkets,
          { ticker, saved_at: new Date().toISOString() },
        ],
      })),

      unsaveMarket: (ticker) => set((state) => ({
        savedMarkets: state.savedMarkets.filter((m) => m.ticker !== ticker),
      })),

      isMarketSaved: (ticker) => {
        return get().savedMarkets.some((m) => m.ticker === ticker);
      },

      // Balance
      balance: 15420.50,
      creditOutstanding: 4799.96,
      updateBalance: (amount) => set((state) => ({
        balance: state.balance + amount,
      })),
    }),
    {
      name: 'winback-storage',
    }
  )
);
