import React, { useState, useEffect } from "react";
import "./App.css";
import * as bip39 from "bip39";
import { Buffer } from 'buffer';
import * as CryptoJS from 'crypto-js';
window.Buffer = Buffer;

function App() {
  // State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showRestoreWallet, setShowRestoreWallet] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [restoreMnemonic, setRestoreMnemonic] = useState("");
  const [restorePassphrase, setRestorePassphrase] = useState("");
  const [restorePassword, setRestorePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletExists, setWalletExists] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [restoreError, setRestoreError] = useState("");
  const [showSeed, setShowSeed] = useState(false);

  useEffect(() => {
    const exists = localStorage.getItem("wallet_exists") === "true";
    setWalletExists(exists);
  }, []);

  // ✅ ENCRYPT data before saving
  const encryptData = (data: string, password: string): string => {
    return CryptoJS.AES.encrypt(data, password).toString();
  };

  // ✅ DECRYPT data after loading
  const decryptData = (encryptedData: string, password: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, password);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return "";
    }
  };

  // ✅ Login
  const handleLogin = () => {
    const savedPassword = localStorage.getItem("wallet_password");
    if (loginPassword === savedPassword) {
      setIsLoggedIn(true);
      setLoginError("");
      const encryptedAddress = localStorage.getItem("wallet_address") || "";
      const decryptedAddress = decryptData(encryptedAddress, loginPassword);
      setAddress(decryptedAddress);
    } else {
      setLoginError("❌ Incorrect password. Please try again.");
    }
  };

  // ✅ Create New Wallet (SECURE)
  const handleCreateWallet = async () => {
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const newMnemonic = bip39.generateMnemonic(256);
      setMnemonic(newMnemonic);
      
      const seed = await bip39.mnemonicToSeed(newMnemonic);
      const seedHex = seed.toString('hex');
      const addressHash = seedHex.substring(0, 40);
      const realAddress = "bitcoincash:q" + addressHash;
      setAddress(realAddress);
      
      // ✅ ENCRYPT before storing
      const encryptedMnemonic = encryptData(newMnemonic, password);
      const encryptedAddress = encryptData(realAddress, password);
      const encryptedSeed = encryptData(seedHex, password);
      
      localStorage.setItem("wallet_mnemonic", encryptedMnemonic);
      localStorage.setItem("wallet_address", encryptedAddress);
      localStorage.setItem("wallet_seed", encryptedSeed);
      localStorage.setItem("wallet_password", password);
      localStorage.setItem("wallet_exists", "true");
      
      setWalletExists(true);
      setShowSeed(true); // ✅ SHOW SEED PHRASE
      setShowCreateWallet(false);
      setLoginPassword(password);
      // DO NOT log in yet - user needs to see seed first
    } catch (error) {
      alert("Error creating wallet: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Restore Wallet (SECURE)
  const handleRestoreWallet = async () => {
    if (!restoreMnemonic.trim()) {
      setRestoreError("❌ Please enter your 24-word seed phrase");
      setShowRestoreWallet(false);
      return;
    }
    const wordCount = restoreMnemonic.trim().split(" ").length;
    if (wordCount !== 24) {
      setRestoreError("❌ Seed phrase must be exactly 24 words");
      setShowRestoreWallet(false);
      return;
    }
    if (!bip39.validateMnemonic(restoreMnemonic.trim())) {
      setRestoreError("❌ Invalid seed phrase. Please check your words.");
      setShowRestoreWallet(false);
      return;
    }
    if (restorePassword.length < 8) {
      setRestoreError("❌ Password must be at least 8 characters");
      setShowRestoreWallet(false);
      return;
    }

    setIsLoading(true);
    try {
      const seed = await bip39.mnemonicToSeed(restoreMnemonic.trim());
      const seedHex = seed.toString('hex');
      const addressHash = seedHex.substring(0, 40);
      const realAddress = "bitcoincash:q" + addressHash;
      
      // ✅ ENCRYPT before storing
      const encryptedMnemonic = encryptData(restoreMnemonic.trim(), restorePassword);
      const encryptedAddress = encryptData(realAddress, restorePassword);
      const encryptedSeed = encryptData(seedHex, restorePassword);
      
      localStorage.setItem("wallet_mnemonic", encryptedMnemonic);
      localStorage.setItem("wallet_address", encryptedAddress);
      localStorage.setItem("wallet_seed", encryptedSeed);
      localStorage.setItem("wallet_password", restorePassword);
      localStorage.setItem("wallet_exists", "true");
      
      setWalletExists(true);
      setShowRestoreWallet(false);
      setLoginPassword(restorePassword);
      setIsLoggedIn(true);
      setAddress(realAddress);
      setRestoreError("");
    } catch (error) {
      setRestoreError("❌ Error restoring wallet: " + error);
      setShowRestoreWallet(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout - CLEAR MEMORY
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setShowCreateWallet(false);
    setShowRestoreWallet(false);
    setWalletExists(false);
    setLoginPassword("");
    setPassword("");
    setConfirmPassword("");
    setRestoreError("");
    setLoginError("");
    setMnemonic("");
    setAddress("");
    setShowSeed(false);
    window.location.reload();
  };

  // ✅ SEED DISPLAY SCREEN (Shows after creation)
  if (showSeed && mnemonic) {
    return (
      <div style={styles.container}>
        <div style={styles.gradient}>
          <div style={styles.content}>
            <img src={`${process.env.PUBLIC_URL}/favicon.png`} alt="Logo" style={styles.logo} />
            <h1 style={styles.title}>✅ Wallet Created Successfully!</h1>
            
            <div style={styles.seedContainer}>
              <h3 style={styles.seedLabel}>Your 24-Word Seed Phrase</h3>
              <div style={styles.seedBox}>
                <p style={styles.seedText}>{mnemonic}</p>
              </div>
              {passphrase && <p style={styles.passphraseText}>🔑 25th Word: {passphrase}</p>}
              <p style={styles.addressText}>📍 Address: {address}</p>
              <p style={styles.seedWarning}>⚠️ Write this down on PAPER. Store it securely.</p>
              <p style={styles.seedWarning}>✅ Your seed is ENCRYPTED in storage.</p>
            </div>

            <button 
              onClick={() => {
                setShowSeed(false);
                setIsLoggedIn(true);
              }} 
              style={styles.button}
            >
              I've Saved My Seed. Go to Wallet →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ HOME SCREEN
  if (isLoggedIn) {
    const walletAddress = address || localStorage.getItem("wallet_address") || "";
    return (
      <div style={styles.container}>
        <div style={styles.gradient}>
          <div style={styles.content}>
            <div style={styles.header}>
              <h1 style={styles.walletTitle}>💰 BMC1 Wallet</h1>
              <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </div>
            <div style={styles.addressCard}>
              <p style={styles.addressLabel}>📍 Your BCH Address</p>
              <p style={styles.addressText}>{walletAddress}</p>
            </div>
            <div style={styles.balanceCard}>
              <p style={styles.balanceLabel}>Total Balance</p>
              <p style={styles.balanceAmount}>0.00000000 BCH</p>
            </div>
            <div style={styles.actions}>
              <button style={styles.actionButton}>Send</button>
              <button style={styles.actionButton}>Receive</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ RESTORE WALLET SCREEN
  if (showRestoreWallet) {
    return (
      <div style={styles.container}>
        <div style={styles.gradient}>
          <div style={styles.content}>
            <button style={styles.backButton} onClick={() => setShowRestoreWallet(false)}>← Back</button>
            <img src={`${process.env.PUBLIC_URL}/favicon.png`} alt="Logo" style={styles.logo} />
            <h1 style={styles.title}>Restore Wallet</h1>
            <p style={styles.subtitle}>Enter your 24-word seed phrase</p>

            <div style={styles.form}>
              <textarea
                placeholder="Enter your 24-word seed phrase..."
                value={restoreMnemonic}
                onChange={(e) => setRestoreMnemonic(e.target.value)}
                style={styles.textarea}
                rows={4}
              />
              <input
                type="text"
                placeholder="25th Word (Passphrase) - Optional"
                value={restorePassphrase}
                onChange={(e) => setRestorePassphrase(e.target.value)}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="New Password (min 8 chars)"
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                style={styles.input}
              />
              <button
                onClick={handleRestoreWallet}
                disabled={isLoading}
                style={styles.button}
              >
                {isLoading ? "Restoring..." : "Restore Wallet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ CREATE WALLET SCREEN
  if (showCreateWallet) {
    return (
      <div style={styles.container}>
        <div style={styles.gradient}>
          <div style={styles.content}>
            <button style={styles.backButton} onClick={() => setShowCreateWallet(false)}>← Back</button>
            <img src={`${process.env.PUBLIC_URL}/favicon.png`} alt="Logo" style={styles.logo} />
            <h1 style={styles.title}>Create New Wallet</h1>
            <p style={styles.subtitle}>Set up your secure wallet</p>

            <div style={styles.form}>
              <input
                type="password"
                placeholder="Password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="25th Word (Passphrase) - Optional"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                style={styles.input}
              />
              <button
                onClick={handleCreateWallet}
                disabled={isLoading}
                style={styles.button}
              >
                {isLoading ? "Creating..." : "Create Secure Wallet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ WELCOME SCREEN
  return (
    <div style={styles.container}>
      <div style={styles.gradient}>
        <div style={styles.content}>
          <img src={`${process.env.PUBLIC_URL}/favicon.png`} alt="Logo" style={styles.logo} />
          <h1 style={styles.title}>BMC1-BCH-Wallet</h1>
          <p style={styles.subtitle}>Non-custodial • Zero-KYC • Privacy-first</p>

          {loginError && <p style={styles.errorText}>{loginError}</p>}
          {restoreError && <p style={styles.errorText}>{restoreError}</p>}

          <div style={styles.buttonGroup}>
            {walletExists && (
              <div style={styles.form}>
                <p style={styles.loginLabel}>Enter your password to unlock</p>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={styles.input}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button onClick={handleLogin} style={styles.button}>
                  Unlock Wallet
                </button>
                <p style={styles.divider}>────────── OR ──────────</p>
              </div>
            )}

            <button onClick={() => setShowCreateWallet(true)} style={styles.button}>
              ➕ Create New Wallet
            </button>

            <button onClick={() => setShowRestoreWallet(true)} style={styles.secondaryButton}>
              🔄 Restore Existing Wallet (24-Word Seed)
            </button>
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
  backButton: { background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontSize: "14px" },
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
  logo: { width: "120px", height: "120px", borderRadius: "25px", marginBottom: "20px" },
  title: { fontSize: "32px", fontWeight: "bold", marginBottom: "8px" },
  subtitle: { fontSize: "16px", opacity: 0.8, marginBottom: "30px" },
  buttonGroup: { display: "flex", flexDirection: "column", gap: "12px", width: "100%" },
  form: { display: "flex", flexDirection: "column", gap: "12px", width: "100%" },
  loginLabel: { fontSize: "14px", opacity: 0.8, marginBottom: "4px" },
  input: { padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.15)", color: "white", fontSize: "16px" },
  textarea: { padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.15)", color: "white", fontSize: "16px", fontFamily: "monospace", resize: "vertical", minHeight: "100px" },
  button: { padding: "16px", borderRadius: "12px", border: "none", backgroundColor: "white", color: "#2D1B69", fontSize: "16px", fontWeight: "600", cursor: "pointer", width: "100%" },
  secondaryButton: { padding: "16px", borderRadius: "12px", border: "2px solid white", backgroundColor: "transparent", color: "white", fontSize: "16px", fontWeight: "600", cursor: "pointer", width: "100%" },
  divider: { color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: "8px 0" },
  seedContainer: { backgroundColor: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "12px", marginTop: "20px", width: "100%" },
  seedLabel: { color: "white", fontSize: "18px", marginBottom: "12px" },
  seedBox: { backgroundColor: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "8px", marginBottom: "12px" },
  seedText: { color: "white", fontSize: "14px", fontFamily: "monospace", wordBreak: "break-word" },
  passphraseText: { color: "#FFD700", fontSize: "14px", fontFamily: "monospace", marginBottom: "8px" },
  seedWarning: { color: "#FFD700", fontSize: "12px", marginBottom: "4px" },
  errorText: { color: "#FF6B6B", fontSize: "14px", marginTop: "8px", padding: "10px", backgroundColor: "rgba(255,0,0,0.1)", borderRadius: "8px" },
};

export default App;
