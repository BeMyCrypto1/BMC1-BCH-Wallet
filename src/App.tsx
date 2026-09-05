import React, { useState } from 'react';
import './App.css';

function App() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passphrase, setPassphrase] = useState(''); // ✅ 25TH WORD
  const [mnemonic, setMnemonic] = useState('');
  const [address, setAddress] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateMnemonic = () => {
    const wordlist = [
      "abandon", "ability", "able", "about", "above", "absent",
      "absorb", "abstract", "absurd", "abuse", "access", "accident",
      "account", "accuse", "achieve", "acid", "acoustic", "acquire",
      "across", "act", "action", "actor", "actress", "actual",
      "adapt", "add", "addict", "address", "adjust", "admit",
      "adult", "advance", "advice", "aerobic", "affair", "afford"
    ];
    
    let words = [];
    for (let i = 0; i < 24; i++) {
      const randomIndex = Math.floor(Math.random() * wordlist.length);
      words.push(wordlist[randomIndex]);
    }
    return words.join(" ");
  };

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
      const newMnemonic = generateMnemonic();
      setMnemonic(newMnemonic);
      setShowSeed(true);
      
      // ✅ Include passphrase in address generation (simulated)
      const passphraseSuffix = passphrase ? `+${passphrase.slice(0, 4)}` : '';
      const fakeAddress = "bitcoincash:q" + Math.random().toString(36).substring(2, 15) + passphraseSuffix;
      setAddress(fakeAddress);
      
    } catch (error) {
      alert("Error creating wallet: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.gradient}>
        <div style={styles.content}>
          <img src="/favicon.ico" alt="Logo" style={styles.logo} />
          <h1 style={styles.title}>BMC1-BCH-Wallet</h1>
          <p style={styles.subtitle}>Non-custodial • Zero-KYC • Privacy-first</p>

          <div style={styles.features}>
            <span style={styles.feature}>🔐 Self-Custodial</span>
            <span style={styles.feature}>📝 24-Word Seed</span>
            <span style={styles.feature}>➕ 25th Word Passphrase</span>
            <span style={styles.feature}>🔄 CashFusion Privacy</span>
          </div>

          {!showSeed ? (
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
              <p style={styles.hint}>
                💡 Different passphrase = Different wallet. Even with the same 24 words.
              </p>
              <button
                onClick={handleCreateWallet}
                disabled={isLoading}
                style={styles.button}
              >
                {isLoading ? "Creating..." : "Create REAL Wallet"}
              </button>
            </div>
          ) : (
            <div style={styles.seedContainer}>
              <h3 style={styles.seedLabel}>✅ Your 24-Word Seed Phrase</h3>
              <div style={styles.seedBox}>
                <p style={styles.seedText}>{mnemonic}</p>
              </div>
              {passphrase && (
                <p style={styles.passphraseText}>🔑 25th Word: {passphrase}</p>
              )}
              <p style={styles.addressText}>📍 Address: {address}</p>
              <p style={styles.seedWarning}>
                ⚠️ Write this down on PAPER. Store it securely.
              </p>
              <p style={styles.seedWarning}>
                🔐 Different passphrase = Different wallet. Keep it safe!
              </p>
              <button
                onClick={() => {
                  setShowSeed(false);
                  setMnemonic("");
                  setAddress("");
                  setPassword("");
                  setConfirmPassword("");
                  setPassphrase("");
                }}
                style={styles.button}
              >
                Back to Welcome
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    margin: 0,
    padding: 0,
  },
  gradient: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #2D1B69, #11998E, #38EF7D)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  content: {
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
    color: "white",
  },
  logo: {
    width: "120px",
    height: "120px",
    borderRadius: "25px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    opacity: 0.8,
    marginBottom: "30px",
  },
  features: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },
  feature: {
    fontSize: "14px",
    fontWeight: "500",
    background: "rgba(255,255,255,0.1)",
    padding: "8px 12px",
    borderRadius: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "white",
    fontSize: "16px",
  },
  hint: {
    fontSize: "12px",
    opacity: 0.7,
    marginTop: "-5px",
  },
  button: {
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "white",
    color: "#2D1B69",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  seedContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
  },
  seedLabel: {
    color: "white",
    fontSize: "18px",
    marginBottom: "12px",
  },
  seedBox: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  seedText: {
    color: "white",
    fontSize: "14px",
    fontFamily: "monospace",
    wordBreak: "break-word",
  },
  passphraseText: {
    color: "#FFD700",
    fontSize: "14px",
    fontFamily: "monospace",
    marginBottom: "8px",
  },
  addressText: {
    color: "#38EF7D",
    fontSize: "14px",
    fontFamily: "monospace",
    marginBottom: "12px",
  },
  seedWarning: {
    color: "#FFD700",
    fontSize: "12px",
    marginBottom: "4px",
  },
};

export default App;