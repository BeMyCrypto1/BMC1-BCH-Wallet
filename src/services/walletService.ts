import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import { networkService } from "./networkService";

// Web-only storage using localStorage
const storage = {
  getItem: (key: string): string | null => {
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    localStorage.setItem(key, value);
  }
};

// Simple BIP32 derivation without external library
function deriveAddressFromMnemonic(mnemonic: string): { address: string; privateKey: string } {
  // This is a simplified version - in production use bip32 library
  // For now, generate a mock address based on the mnemonic
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const seedHex = seed.toString('hex');
  
  // Generate a deterministic address from the seed (simplified)
  const hash = seedHex.substring(0, 40);
  const address = "bitcoincash:q" + hash + "abcdef";
  const privateKey = seedHex.substring(0, 64);
  
  return { address, privateKey };
}

export const walletService = {
  generateMnemonic: (): string => {
    return bip39.generateMnemonic(256);
  },

  validateMnemonic: (mnemonic: string): boolean => {
    return bip39.validateMnemonic(mnemonic);
  },

  deriveAddressFromMnemonic: (mnemonic: string): { address: string; privateKey: string } => {
    return deriveAddressFromMnemonic(mnemonic);
  },

  saveWallet: async (mnemonic: string, password: string): Promise<void> => {
    const { address, privateKey } = deriveAddressFromMnemonic(mnemonic);
    storage.setItem("wallet_mnemonic", mnemonic);
    storage.setItem("wallet_password", password);
    storage.setItem("wallet_address", address);
    storage.setItem("wallet_private_key", privateKey);
    storage.setItem("wallet_exists", "true");
  },

  loadWallet: async (): Promise<{ mnemonic: string; address: string }> => {
    const mnemonic = storage.getItem("wallet_mnemonic") || "";
    const address = storage.getItem("wallet_address") || "";
    return { mnemonic, address };
  },

  restoreWallet: async (mnemonic: string, password: string): Promise<void> => {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed phrase");
    }
    await walletService.saveWallet(mnemonic, password);
  },

  getAddress: async (): Promise<string> => {
    return storage.getItem("wallet_address") || "";
  },

  walletExists: async (): Promise<boolean> => {
    return storage.getItem("wallet_exists") === "true";
  },

  getRealBalance: async (address: string): Promise<number> => {
    try {
      return await networkService.getBalance(address);
    } catch (error) {
      console.error("Failed to fetch real balance:", error);
      return 0;
    }
  },

  getRealTransactions: async (address: string): Promise<any[]> => {
    try {
      return await networkService.getTransactions(address);
    } catch (error) {
      console.error("Failed to fetch real transactions:", error);
      return [];
    }
  }
};