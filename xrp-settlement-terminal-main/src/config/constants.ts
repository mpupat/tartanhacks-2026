// XRPL Network and Trading Configuration

export const XRPL_NETWORKS = {
  testnet: {
    name: 'Testnet',
    url: 'wss://s.altnet.rippletest.net:51233',
    faucetUrl: 'https://faucet.altnet.rippletest.net/accounts',
    explorerUrl: 'https://testnet.xrpl.org',
  },
  mainnet: {
    name: 'Mainnet',
    url: 'wss://xrplcluster.com',
    explorerUrl: 'https://livenet.xrpl.org',
  },
} as const;

export type NetworkType = keyof typeof XRPL_NETWORKS;

// Default to testnet for development
export const DEFAULT_NETWORK: NetworkType = 'testnet';

// Common token issuers (Testnet uses different addresses)
export const TOKEN_ISSUERS = {
  testnet: {
    USD: 'rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd', // Testnet USD issuer
  },
  mainnet: {
    USD_BITSTAMP: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    USD_GATEHUB: 'rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq',
    USDC: 'rcEGREd8NmkKRE8GE424sksyt1tJVFZwu',
  },
} as const;

// Default trading pair
export const DEFAULT_TRADING_PAIR = {
  base: { currency: 'XRP' },
  quote: { 
    currency: 'USD',
    issuer: TOKEN_ISSUERS.testnet.USD,
  },
};

// XRP Ledger constants
export const XRP_DROPS_PER_XRP = 1_000_000;
export const BASE_RESERVE = 10; // XRP required to activate account
export const OWNER_RESERVE = 2; // XRP per owned object (offers, trust lines)

// Transaction defaults
export const DEFAULT_FEE = '12'; // drops
export const DEFAULT_OFFER_EXPIRATION_HOURS = 24;

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_SEED: 'xrpl_wallet_seed_encrypted',
  NETWORK: 'xrpl_network',
} as const;
