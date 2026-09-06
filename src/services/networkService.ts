// Web-only Electrum client
export class NetworkService {
  private connected: boolean = false;

  async connect(): Promise<void> {
    this.connected = true;
    console.log('✅ Web mode: Simulating connection to ElectrumX');
  }

  async getBalance(address: string): Promise<number> {
    await this.connect();
    // In web mode, return mock data until we have a real client
    console.log(`📊 Fetching balance for: ${address}`);
    return 0;
  }

  async getTransactions(address: string): Promise<any[]> {
    await this.connect();
    console.log(`📊 Fetching transactions for: ${address}`);
    return [];
  }

  async getUTXOs(address: string): Promise<any[]> {
    await this.connect();
    console.log(`📊 Fetching UTXOs for: ${address}`);
    return [];
  }
}

export const networkService = new NetworkService();
