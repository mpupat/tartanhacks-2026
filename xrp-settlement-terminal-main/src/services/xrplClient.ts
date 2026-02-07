// XRPL Client Service - Connection Management

import { Client } from 'xrpl';
import { XRPL_NETWORKS, DEFAULT_NETWORK, type NetworkType } from '@/config/constants';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type StatusListener = (status: ConnectionStatus) => void;

class XRPLClientService {
    private client: Client | null = null;
    private currentNetwork: NetworkType = DEFAULT_NETWORK;
    private statusListeners: Set<StatusListener> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    async connect(network: NetworkType = this.currentNetwork): Promise<Client> {
        // Disconnect existing client if switching networks
        if (this.client && this.currentNetwork !== network) {
            await this.disconnect();
        }

        if (this.client?.isConnected()) {
            return this.client;
        }

        this.currentNetwork = network;
        const networkConfig = XRPL_NETWORKS[network];

        this.notifyListeners('connecting');

        try {
            this.client = new Client(networkConfig.url);

            // Set up event listeners
            this.client.on('connected', () => {
                this.reconnectAttempts = 0;
                this.notifyListeners('connected');
            });

            this.client.on('disconnected', () => {
                this.notifyListeners('disconnected');
                this.attemptReconnect();
            });

            this.client.on('error', (error) => {
                console.error('XRPL Client Error:', error);
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            this.notifyListeners('disconnected');
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.disconnect();
            this.client = null;
            this.notifyListeners('disconnected');
        }
    }

    getClient(): Client | null {
        return this.client;
    }

    isConnected(): boolean {
        return this.client?.isConnected() ?? false;
    }

    getCurrentNetwork(): NetworkType {
        return this.currentNetwork;
    }

    getNetworkConfig() {
        return XRPL_NETWORKS[this.currentNetwork];
    }

    // Status subscription
    onStatusChange(listener: StatusListener): () => void {
        this.statusListeners.add(listener);
        return () => this.statusListeners.delete(listener);
    }

    private notifyListeners(status: ConnectionStatus): void {
        this.statusListeners.forEach(listener => listener(status));
    }

    private async attemptReconnect(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(async () => {
            try {
                await this.connect();
            } catch (error) {
                console.error('Reconnection failed:', error);
            }
        }, delay);
    }
}

// Export singleton instance
export const xrplClient = new XRPLClientService();
export type { ConnectionStatus };
