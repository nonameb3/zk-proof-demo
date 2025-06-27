import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, baseSepolia, arbitrum, polygon, optimism, base } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// WalletConnect project ID (you should get this from https://cloud.walletconnect.com)
const projectId = 'your-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia, baseSepolia, arbitrum, polygon, optimism, base],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
  syncConnectedChain: true,
})

// Real deployed AnonymousData contract on Base Sepolia
export const ANONYMOUS_DATA_CONTRACT = {
  address: '0xfC13069148EFED7865b1355aCb9986E8eEfd232b' as const,
  abi: [
    { "inputs": [{ "internalType": "address", "name": "_verifier", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
    {
      "inputs": [{ "internalType": "uint256", "name": "_hash", "type": "uint256" }],
      "name": "setHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "storedHash",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "verifier",
      "outputs": [{ "internalType": "contract Groth16Verifier", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256[2]", "name": "a", "type": "uint256[2]" },
        { "internalType": "uint256[2][2]", "name": "b", "type": "uint256[2][2]" },
        { "internalType": "uint256[2]", "name": "c", "type": "uint256[2]" }
      ],
      "name": "verifyKnowledge",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const,
} as const

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}