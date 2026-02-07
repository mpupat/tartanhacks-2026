// XRPL Provider - React Context for XRPL Connection and Wallet State

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { xrplClient, type ConnectionStatus } from '@/services/xrplClient';
import { walletService, type WalletInfo, type AccountInfo } from '@/services/walletService';
import { type NetworkType, DEFAULT_NETWORK } from '@/config/constants';

interface XRPLContextValue {
    // Connection
    connectionStatus: ConnectionStatus;
    currentNetwork: NetworkType;
    connect: (network?: NetworkType) => Promise<void>;
    disconnect: () => Promise<void>;

    // Wallet
    wallet: WalletInfo | null;
    accountInfo: AccountInfo | null;
    isWalletLoading: boolean;
    generateWallet: () => WalletInfo;
    importWallet: (seed: string) => WalletInfo;
    disconnectWallet: () => void;
    refreshAccountInfo: () => Promise<void>;
    fundWallet: () => Promise<boolean>;
}

const XRPLContext = createContext<XRPLContextValue | null>(null);

export function useXRPL() {
    const context = useContext(XRPLContext);
    if (!context) {
        throw new Error('useXRPL must be used within XRPLProvider');
    }
    return context;
}

interface XRPLProviderProps {
    children: React.ReactNode;
    autoConnect?: boolean;
}

export function XRPLProvider({ children, autoConnect = true }: XRPLProviderProps) {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [currentNetwork, setCurrentNetwork] = useState<NetworkType>(DEFAULT_NETWORK);
    const [wallet, setWallet] = useState<WalletInfo | null>(null);
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
    const [isWalletLoading, setIsWalletLoading] = useState(false);

    // Subscribe to connection status changes
    useEffect(() => {
        const unsubscribe = xrplClient.onStatusChange(setConnectionStatus);
        return unsubscribe;
    }, []);

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
    }, [autoConnect]);

    // Load wallet from storage on mount
    useEffect(() => {
        const loaded = walletService.loadFromStorage();
        if (loaded) {
            setWallet(walletService.getWalletInfo());
        }
    }, []);

    // Refresh account info when wallet or connection changes
    useEffect(() => {
        if (wallet && connectionStatus === 'connected') {
            refreshAccountInfo();
        }
    }, [wallet, connectionStatus]);

    const connect = useCallback(async (network: NetworkType = currentNetwork) => {
        try {
            await xrplClient.connect(network);
            setCurrentNetwork(network);
        } catch (error) {
            console.error('Failed to connect:', error);
            throw error;
        }
    }, [currentNetwork]);

    const disconnect = useCallback(async () => {
        await xrplClient.disconnect();
    }, []);

    const generateWallet = useCallback(() => {
        const walletInfo = walletService.generateWallet();
        setWallet(walletInfo);
        setAccountInfo(null);
        return walletInfo;
    }, []);

    const importWallet = useCallback((seed: string) => {
        const walletInfo = walletService.importFromSeed(seed);
        setWallet(walletInfo);
        setAccountInfo(null);
        return walletInfo;
    }, []);

    const disconnectWallet = useCallback(() => {
        walletService.disconnectWallet();
        setWallet(null);
        setAccountInfo(null);
    }, []);

    const refreshAccountInfo = useCallback(async () => {
        if (!wallet) return;

        setIsWalletLoading(true);
        try {
            const info = await walletService.getAccountInfo();
            setAccountInfo(info);
        } catch (error) {
            console.error('Failed to fetch account info:', error);
        } finally {
            setIsWalletLoading(false);
        }
    }, [wallet]);

    const fundWallet = useCallback(async () => {
        try {
            await walletService.fundFromTestnetFaucet();
            await refreshAccountInfo();
            return true;
        } catch (error) {
            console.error('Failed to fund wallet:', error);
            return false;
        }
    }, [refreshAccountInfo]);

    const value: XRPLContextValue = {
        connectionStatus,
        currentNetwork,
        connect,
        disconnect,
        wallet,
        accountInfo,
        isWalletLoading,
        generateWallet,
        importWallet,
        disconnectWallet,
        refreshAccountInfo,
        fundWallet,
    };

    return (
        <XRPLContext.Provider value={value}>
            {children}
        </XRPLContext.Provider>
    );
}
