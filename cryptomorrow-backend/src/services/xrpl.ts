
import { Client } from 'xrpl';

const XRPL_NETWORK = process.env.XRPL_NETWORK || 'wss://s.altnet.rippletest.net:51233';

export class XRPLService {
    private client: Client;

    constructor() {
        this.client = new Client(XRPL_NETWORK);
    }

    async connect() {
        if (!this.client.isConnected()) {
            await this.client.connect();
        }
    }

    async disconnect() {
        if (this.client.isConnected()) {
            await this.client.disconnect();
        }
    }

    getClient() {
        return this.client;
    }

    async getHealth() {
        await this.connect();
        const response = await this.client.request({
            command: 'server_info'
        });
        return response.result.info;
    }
}

export const xrplService = new XRPLService();
