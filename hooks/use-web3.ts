import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi'
import { writeContract, readContract, waitForTransactionReceipt } from 'wagmi/actions'
import { config, HASH_STORAGE_CONTRACT } from '@/lib/web3/config'

export interface HashSubmissionResult {
  txHash: string
  blockNumber: number
  gasUsed: number
  timestamp: number
}

export interface HashInfo {
  exists: boolean
  timestamp: number
  submitter: string
}

export function useWeb3() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Connect to MetaMask or other injected wallet
  const connectWallet = async () => {
    const injectedConnector = connectors.find(connector => 
      connector.name === 'MetaMask' || connector.name === 'Injected'
    )
    
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  // Submit hash to smart contract
  const submitHashToContract = async (hash: string): Promise<HashSubmissionResult> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }

    setIsSubmitting(true)

    try {
      // Mock the transaction for demo purposes
      // In real implementation, you would use writeContract
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate transaction time
      
      const mockResult: HashSubmissionResult = {
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        blockNumber: 18500000 + Math.floor(Math.random() * 1000),
        gasUsed: 45000 + Math.floor(Math.random() * 5000),
        timestamp: Date.now()
      }

      return mockResult
    } catch (error) {
      console.error('Hash submission failed:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if hash exists in contract
  const checkHashInContract = async (hash: string): Promise<HashInfo> => {
    setIsChecking(true)

    try {
      // Mock the contract read for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate random existence for demo
      const exists = Math.random() > 0.5
      
      const mockInfo: HashInfo = {
        exists,
        timestamp: exists ? Date.now() - Math.floor(Math.random() * 86400000) : 0, // Random timestamp within last day
        submitter: exists ? address || '0x0000000000000000000000000000000000000000' : '0x0000000000000000000000000000000000000000'
      }

      return mockInfo
    } catch (error) {
      console.error('Hash check failed:', error)
      throw error
    } finally {
      setIsChecking(false)
    }
  }

  // Get network name
  const getNetworkName = () => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet'
      case 11155111: return 'Sepolia Testnet'
      default: return 'Unknown Network'
    }
  }

  return {
    // Wallet connection state
    address,
    isConnected,
    isConnecting,
    balance,
    chainId,
    networkName: getNetworkName(),
    
    // Connection functions
    connectWallet,
    disconnect,
    
    // Contract interactions
    submitHashToContract,
    checkHashInContract,
    isSubmitting,
    isChecking,
  }
}