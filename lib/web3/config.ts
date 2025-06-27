import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// WalletConnect project ID (you should get this from https://cloud.walletconnect.com)
const projectId = 'your-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

// Mock smart contract address (you would deploy a real contract)
export const HASH_STORAGE_CONTRACT = {
  address: '0x1234567890123456789012345678901234567890' as const,
  abi: [
    // Store hash function
    {
      name: 'storeHash',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'hash', type: 'string' }],
      outputs: [],
    },
    // Check if hash exists
    {
      name: 'hashExists',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'hash', type: 'string' }],
      outputs: [{ name: '', type: 'bool' }],
    },
    // Get hash storage info
    {
      name: 'getHashInfo',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'hash', type: 'string' }],
      outputs: [
        { name: 'exists', type: 'bool' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'submitter', type: 'address' },
      ],
    },
  ],
} as const

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}