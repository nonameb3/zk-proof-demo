import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { writeContract, readContract, waitForTransactionReceipt } from 'wagmi/actions'
import { config, HASH_STORAGE_CONTRACT } from '@/lib/web3/config'
import { baseSepolia, arbitrum } from 'wagmi/chains'

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
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [actualChainId, setActualChainId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Get actual chain ID from wallet provider and listen for changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && isConnected) {
      const getActualChainId = async () => {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const numericChainId = parseInt(chainId, 16)
          console.log('=== ACTUAL WALLET CHAIN ===')
          console.log('Raw chainId from wallet:', chainId)
          console.log('Numeric chainId:', numericChainId)
          console.log('wagmi chainId:', chainId)
          console.log('=== END ACTUAL WALLET ===')
          setActualChainId(numericChainId)
        } catch (error) {
          console.error('Failed to get actual chain ID:', error)
        }
      }

      // Get initial chain ID
      getActualChainId()

      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16)
        console.log('=== CHAIN CHANGED EVENT ===')
        console.log('New chainId:', chainId, '(' + numericChainId + ')')
        console.log('=== END CHAIN CHANGED ===')
        setActualChainId(numericChainId)
        setRefreshKey(prev => prev + 1) // Force component refresh
      }

      if (window.ethereum.on) {
        window.ethereum.on('chainChanged', handleChainChanged)
      }

      // Cleanup listener
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [isConnected])

  // Debug: Log chain constants on mount
  useEffect(() => {
    console.log('=== CHAIN CONSTANTS ===')
    console.log('baseSepolia.id:', baseSepolia.id)
    console.log('arbitrum.id:', arbitrum.id)
    console.log('=== END CONSTANTS ===')
  }, [])

  // Debug: Log detailed wallet state
  useEffect(() => {
    console.log('=== DETAILED WALLET STATE ===')
    console.log('Raw values from wagmi hooks:')
    console.log('- useChainId():', chainId)
    console.log('- useAccount().chain:', chain)
    console.log('- useAccount().chain?.id:', chain?.id)
    console.log('- useAccount().chain?.name:', chain?.name)
    console.log('- useAccount().isConnected:', isConnected)
    console.log('- useAccount().address:', address)
    console.log('- actualChainId from wallet:', actualChainId)
    console.log('baseSepolia.id constant:', baseSepolia.id)
    console.log('=== END WALLET STATE ===')
  }, [address, isConnected, chain, chainId, actualChainId])

  // Debug the getNetworkName logic step by step
  const getNetworkNameWithDebug = () => {
    console.log('=== getNetworkName() LOGIC ===')
    console.log('Step 1: Checking if chain?.name exists')
    console.log('chain?.name:', chain?.name)
    
    if (chain?.name) {
      console.log('Using chain.name:', chain.name)
      return chain.name
    }
    
    console.log('Step 2: Fallback to chainId mapping')
    console.log('wagmi chainId:', chainId)
    console.log('actual chainId from wallet:', actualChainId)
    
    // Use actual chain ID from wallet if available, otherwise fall back to wagmi
    const effectiveChainId = actualChainId || chainId
    console.log('effective chainId for switch:', effectiveChainId)
    
    let result
    switch (effectiveChainId) {
      case 1: 
        result = 'Ethereum Mainnet'
        break
      case 11155111: 
        result = 'Sepolia Testnet'
        break
      case 84532: 
        result = 'Base Sepolia'
        break
      case 42161:
        result = 'Arbitrum One'
        break
      case 137:
        result = 'Polygon'
        break
      case 10:
        result = 'Optimism'
        break
      case 8453:
        result = 'Base'
        break
      default: 
        result = `Unknown Network (${effectiveChainId})`
    }
    
    console.log('Switch result:', result)
    console.log('=== END getNetworkName() ===')
    return result
  }

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

  // Get network name (using debug version temporarily)
  const getNetworkName = getNetworkNameWithDebug

  // Check if on correct network - use actual chain ID from wallet
  const effectiveChainId = actualChainId || chainId
  const isCorrectNetwork = effectiveChainId === baseSepolia.id
  
  // Debug isCorrectNetwork logic
  useEffect(() => {
    console.log('=== isCorrectNetwork LOGIC ===')
    console.log('wagmi chainId:', chainId)
    console.log('actual chainId:', actualChainId)
    console.log('effective chainId:', effectiveChainId)
    console.log('baseSepolia.id:', baseSepolia.id) 
    console.log('isCorrectNetwork:', isCorrectNetwork)
    console.log('=== END isCorrectNetwork ===')
  }, [chainId, actualChainId, effectiveChainId, isCorrectNetwork])

  // Switch to Base Sepolia
  const switchToBaseSepolia = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id })
      // Small delay to ensure state updates
      setTimeout(() => {
        setRefreshKey(prev => prev + 1)
      }, 500)
    } catch (error) {
      console.error('Failed to switch chain:', error)
    }
  }

  return {
    // Wallet connection state
    address,
    isConnected,
    isConnecting,
    balance,
    chainId: effectiveChainId, // Return the effective chain ID instead of wagmi's wrong one
    networkName: getNetworkName(),
    
    // Network management
    isCorrectNetwork,
    switchToBaseSepolia,
    isSwitching,
    
    // Connection functions
    connectWallet,
    disconnect,
    
    // Contract interactions
    submitHashToContract,
    checkHashInContract,
    isSubmitting,
    isChecking,
    
    // Internal state for debugging
    refreshKey,
  }
}