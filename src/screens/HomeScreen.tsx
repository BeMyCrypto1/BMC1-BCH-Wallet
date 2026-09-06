import React, { useEffect, useState } from "react";
import { walletService } from "../services/walletService";

interface Transaction {
  type?: string;
  value?: number;
  txid?: string;
  height?: number;
  confirmations?: number;
}

export function HomeScreen({ navigation }: any) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const addr: string = await walletService.getAddress();
      setAddress(addr);
      const realBalance: number = await walletService.getRealBalance(addr);
      setBalance(realBalance);
      const realTxs: Transaction[] = await walletService.getRealTransactions(addr);
      setTransactions(realTxs);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBCH = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8) + " BCH";
  };

  const formatAddress = (addr: string): string => {
    if (!addr) return "No address";
    return addr.slice(0, 12) + "..." + addr.slice(-8);
  };

  return (
    <div style={styles.container}>
      <div style={styles.gradient}>
        <div style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.walletTitle}>💰 BMC1 Wallet</h1>
            <button style={styles.logoutButton} onClick={() => { localStorage.clear(); window.location.reload(); }}>Logout</button>
          </div>
          <div style={styles.addressCard}>
            <p style={styles.addressLabel}>📍 Your BCH Address</p>
            <p style={styles.addressText}>{loading ? "Loading..." : formatAddress(address)}</p>
          </div>
          <div style={styles.balanceCard}>
            <p style={styles.balanceLabel}>Total Balance</p>
            <p style={styles.balanceAmount}>{loading ? "Loading..." : formatBCH(balance)}</p>
          </div>
          <div style={styles.actions}>
            <button style={styles.actionButton}>Send</button>
            <button style={styles.actionButton}>Receive</button>
          </div>
          <div style={styles.transactionsSection}>
            <h3 style={styles.sectionTitle}>Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p style={styles.emptyText}>No transactions yet</p>
            ) : (
              transactions.map((tx: Transaction, index: number) => (
                <div key={index} style={styles.transactionItem}>
                  <span style={styles.txType}>{tx.type || "Unknown"}</span>
                  <span style={styles.txAmount}>{formatBCH(tx.value || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: "100vh", margin: 0, padding: 0 },
  gradient: { minHeight: "100vh", background: "linear-gradient(135deg, #2D1B69, #11998E, #38EF7D)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
  content: { maxWidth: "500px", width: "100%", textAlign: "center", color: "white" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  walletTitle: { color: "#FFF", fontSize: "22px", fontWeight: "bold", margin: 0 },
  logoutButton: { background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  addressCard: { background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px", marginBottom: "16px" },
  addressLabel: { color: "rgba(255,255,255,0.7)", fontSize: "12px", margin: 0 },
  addressText: { color: "#38EF7D", fontSize: "14px", fontFamily: "monospace", marginTop: "4px", wordBreak: "break-all" },
  balanceCard: { background: "rgba(255,255,255,0.15)", borderRadius: "16px", padding: "24px", marginBottom: "20px" },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: 0 },
  balanceAmount: { color: "#FFF", fontSize: "32px", fontWeight: "bold", marginTop: "8px" },
  actions: { display: "flex", justifyContent: "space-around", marginBottom: "20px" },
  actionButton: { background: "white", border: "none", padding: "12px 30px", borderRadius: "12px", color: "#2D1B69", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  transactionsSection: { background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px" },
  sectionTitle: { color: "#FFF", fontSize: "18px", fontWeight: "bold", marginBottom: "12px" },
  emptyText: { color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "20px" },
  transactionItem: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  txType: { color: "#FFF", textTransform: "capitalize" },
  txAmount: { color: "#FFF" },
};
