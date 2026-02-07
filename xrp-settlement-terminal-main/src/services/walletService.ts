// Wallet Service - Generate, Import, and Manage XRPL Wallets

import { Wallet } from 'xrpl';
import { xrplClient } from './xrplClient';
import { STORAGE_KEYS, XRP_DROPS_PER_XRP } from '@/config/constants';

export interface WalletInfo {
    address: string;
    publicKey: string;
}

export interface AccountBalance {
    xrp: number;
    drops: string;
}

export interface AccountInfo {
    balance: AccountBalance;
    sequence: number;
    ownerCount: number;
    isActivated: boolean;
}

class WalletService {
    private wallet: Wallet | null = null;

    // Generate a new random wallet
    generateWallet(): WalletInfo {
        this.wallet = Wallet.generate();
        this.saveToStorage();
        return this.getWalletInfo()!;
    }

    // Import wallet from seed
    importFromSeed(seed: string): WalletInfo {
        try {
            this.wallet = Wallet.fromSeed(seed);
            this.saveToStorage();
            return this.getWalletInfo()!;
        } catch (error) {
            throw new Error('Invalid seed format');
        }
    }

    // Get current wallet info (without exposing private keys)
    getWalletInfo(): WalletInfo | null {
        if (!this.wallet) return null;
        return {
            address: this.wallet.address,
            publicKey: this.wallet.publicKey,
        };
    }

    // Get the full wallet (for signing) - use with caution
    getWallet(): Wallet | null {
        return this.wallet;
    }

    // Check if wallet is loaded
    isWalletLoaded(): boolean {
        return this.wallet !== null;
    }

    // Get wallet address
    getAddress(): string | null {
        return this.wallet?.address ?? null;
    }

    // Disconnect/clear wallet
    disconnectWallet(): void {
        this.wallet = null;
        this.clearStorage();
    }

    // Get account info from the ledger
    async getAccountInfo(): Promise<AccountInfo | null> {
        if (!this.wallet) return null;

        const client = xrplClient.getClient();
        if (!client?.isConnected()) {
            throw new Error('Not connected to XRPL');
        }

        try {
            const response = await client.request({
                command: 'account_info',
                account: this.wallet.address,
                ledger_index: 'validated',
            });

            const accountData = response.result.account_data;
            const drops = accountData.Balance;

            return {
                balance: {
                    drops,
                    xrp: Number(drops) / XRP_DROPS_PER_XRP,
                },
                sequence: accountData.Sequence,
                ownerCount: accountData.OwnerCount,
                isActivated: true,
            };
        } catch (error: any) {
            // Account not found means it's not activated yet
            if (error.data?.error === 'actNotFound') {
                return {
                    balance: { drops: '0', xrp: 0 },
                    sequence: 0,
                    ownerCount: 0,
                    isActivated: false,
                };
            }
            throw error;
        }
    }

    // Fund wallet on testnet using faucet
    async fundFromTestnetFaucet(): Promise<boolean> {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }

        const client = xrplClient.getClient();
        if (!client?.isConnected()) {
            throw new Error('Not connected to XRPL');
        }

        try {
            // Use the client's fundWallet method for testnet
            await client.fundWallet(this.wallet);
            return true;
        } catch (error) {
            console.error('Failed to fund wallet:', error);
            throw error;
        }
    }

    // Load wallet from storage on app start
    loadFromStorage(): boolean {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.WALLET_SEED);
            if (stored) {
                // In production, this should be encrypted
                const seed = atob(stored);
                this.wallet = Wallet.fromSeed(seed);
                return true;
            }
        } catch (error) {
            console.error('Failed to load wallet from storage:', error);
            this.clearStorage();
        }
        return false;
    }

    // Save wallet to local storage (base64 encoded for minimal obfuscation)
    private saveToStorage(): void {
        if (this.wallet?.seed) {
            // In production, use proper encryption
            const encoded = btoa(this.wallet.seed);
            localStorage.setItem(STORAGE_KEYS.WALLET_SEED, encoded);
        }
    }

    private clearStorage(): void {
        localStorage.removeItem(STORAGE_KEYS.WALLET_SEED);
    }
}

// Export singleton instance
export const walletService = new WalletService();
