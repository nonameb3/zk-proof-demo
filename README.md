# Zero-Knowledge Proof Demo

🛡️ **A complete ZK-SNARK demonstration with real blockchain integration**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-xxx-brightgreen?style=for-the-badge)](xxx)
[![Base Sepolia](https://img.shields.io/badge/Network-Base%20Sepolia-blue?style=for-the-badge)](https://sepolia.basescan.org/)
[![Contract](https://img.shields.io/badge/Contract-0xfC130691...Efd232b-orange?style=for-the-badge)](https://sepolia.basescan.org/address/0xfC13069148EFED7865b1355aCb9986E8eEfd232b)

## 🎯 Overview

A full-stack Zero-Knowledge Proof application demonstrating privacy-preserving verification using **Groth16 ZK-SNARKs**. Users can generate cryptographic proofs of secret knowledge without revealing the secrets themselves, then verify these proofs both locally and on-chain.

## 🚀 Live Demo

**[xxx](xxx)** *(URL will be updated with deployment)*

## ✨ Features

### 🔐 **Zero-Knowledge Proof Generation**
- **Real ZK-SNARK Implementation** using Circom & snarkjs
- **Poseidon Hash Function** for cryptographic security
- **Groth16 Protocol** for efficient proof generation
- **Browser-Based Generation** - secrets never leave your device

### 🌐 **Blockchain Integration**
- **Real Smart Contract** deployed on Base Sepolia
- **Hash Storage** via `setHash(uint256)` function
- **On-Chain Verification** using `verifyKnowledge()` 
- **MetaMask/Rabby Integration** with auto-network switching

### 🎨 **Professional UI/UX**
- **4-Tab Interface**: Generate → Share → Verify → Blockchain
- **Real-time Network Detection** and chain switching
- **Transaction Tracking** with gas estimation
- **Responsive Design** with loading states and error handling

## 🏗️ Architecture

### **Frontend Stack**
- **Next.js 15.2.4** with App Router
- **TypeScript** with strict type checking
- **Tailwind CSS** + Radix UI components
- **Wagmi + Viem** for Web3 integration

### **ZK Cryptography**
- **Circom Circuit**: `preimage.circom` - proves knowledge of hash preimage
- **snarkjs**: Groth16 proof generation and verification
- **circomlibjs**: Poseidon hash implementation
- **Static Artifacts**: Pre-compiled WASM and zkey files

### **Smart Contracts**
- **AnonymousData.sol**: Main contract for hash storage
- **Groth16Verifier.sol**: ZK proof verification logic
- **Network**: Base Sepolia (Chain ID: 84532)
- **Contract**: `0xfC13069148EFED7865b1355aCb9986E8eEfd232b`

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- MetaMask or Rabby wallet
- Base Sepolia testnet ETH

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/zk-proof-demo.git
cd zk-proof-demo

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Usage

1. **Connect Wallet** - Connect MetaMask/Rabby to Base Sepolia
2. **Generate Proof** - Enter a secret and generate ZK proof
3. **Share Proof** - Copy proof JSON and submit hash to blockchain
4. **Verify Proof** - Verify proofs locally or check contract storage
5. **Blockchain Tab** - Submit hashes and verify ZK proofs on-chain

## 📋 How It Works

### **ZK Proof Generation Flow**
```
Secret Input → Poseidon Hash → Circom Circuit → Groth16 Proof
```

### **Circuit Logic**
```circom
template Preimage() {
    signal input data;    // Private: your secret
    signal input hash;    // Public: expected hash
    
    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== data;
    hash === poseidon.out;  // Constraint: hash must equal Poseidon(data)
}
```

### **Smart Contract Integration**
```solidity
// Store hash on-chain
function setHash(uint256 _hash) public {
    storedHash = _hash;
}

// Verify ZK proof against stored hash
function verifyKnowledge(uint[2] memory a, uint[2][2] memory b, uint[2] memory c) 
    public view returns (bool) {
    uint256[1] memory input = [storedHash];
    return verifier.verifyProof(a, b, c, input);
}
```

## 🧪 Technical Details

### **ZK Circuit Artifacts**
- `preimage.wasm` - Circuit execution environment
- `preimage_0001.zkey` - Proving key for Groth16
- `vkey.json` - Verification key

### **Proof Format**
```typescript
{
  "proof": {
    "pi_a": ["...", "...", "1"],
    "pi_b": [["...", "..."], ["...", "..."], ["1", "0"]], 
    "pi_c": ["...", "...", "1"]
  },
  "publicSignals": ["<poseidon_hash>"],
  "hash": "<poseidon_hash>"
}
```

### **Contract Functions**
- `setHash(uint256)` - Store Poseidon hash
- `storedHash()` - Read stored hash  
- `verifyKnowledge(a, b, c)` - Verify ZK proof
- `verifier()` - Get verifier contract address

## 🔧 Development

### **Project Structure**
```
├── app/                    # Next.js app router
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── zk-proof-demo.tsx # Main orchestration
│   ├── generate-tab.tsx  # Proof generation
│   ├── verify-tab.tsx    # Local verification  
│   └── blockchain-tab.tsx # Blockchain operations
├── hooks/                # Custom React hooks
│   ├── use-zk-proof.ts  # ZK proof state management
│   └── use-web3.ts      # Web3 wallet integration
├── lib/                  # Core libraries
│   ├── zkp/             # ZK proof implementation
│   ├── web3/            # Web3 configuration
│   └── abi/             # Smart contract ABIs
├── public/zkp/          # ZK circuit artifacts
└── circuits/            # Circom source files
```

### **Available Scripts**
```bash
pnpm dev        # Development server
pnpm build      # Production build
pnpm lint       # ESLint code checking
pnpm start      # Production server
```

## 🌐 Deployment

The application is configured for deployment on Vercel with automatic builds from the main branch.

### **Environment Requirements**
- Node.js 18+
- Static file serving for ZK artifacts
- HTTPS for Web3 wallet integration

## 🔒 Security & Privacy

- **Zero-Knowledge**: Secrets never leave your browser
- **Cryptographic Security**: Groth16 provides computational soundness
- **Hash-Only Storage**: Only Poseidon hashes stored on-chain
- **No Fallbacks**: Real cryptography with proper error handling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Circom & snarkjs** - ZK-SNARK infrastructure
- **Base** - Layer 2 blockchain platform
- **Poseidon Hash** - ZK-friendly hash function
- **Groth16** - Efficient ZK proof system

---

**Built with ❤️ for the Zero-Knowledge community**