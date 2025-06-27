import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from "wagmi";
import { writeContract, readContract, waitForTransactionReceipt } from "wagmi/actions";
import { config, ANONYMOUS_DATA_CONTRACT } from "@/lib/web3/config";
import { baseSepolia, arbitrum } from "wagmi/chains";

export interface HashSubmissionResult {
  txHash: string;
  blockNumber: number;
  gasUsed: number;
  timestamp: number;
}

export interface HashInfo {
  exists: boolean;
  timestamp: number;
  submitter: string;
}

export interface ZKVerificationResult {
  isValid: boolean;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  timestamp: number;
}

export function useWeb3() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isVerifyingZK, setIsVerifyingZK] = useState(false);
  const [actualChainId, setActualChainId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get actual chain ID from wallet provider and listen for changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && isConnected) {
      const getActualChainId = async () => {
        try {
          const chainId = await window.ethereum?.request({ method: "eth_chainId" });
          const numericChainId = parseInt(chainId, 16);
          console.log("=== ACTUAL WALLET CHAIN ===");
          console.log("Raw chainId from wallet:", chainId);
          console.log("Numeric chainId:", numericChainId);
          console.log("wagmi chainId:", chainId);
          console.log("=== END ACTUAL WALLET ===");
          setActualChainId(numericChainId);
        } catch (error) {
          console.error("Failed to get actual chain ID:", error);
        }
      };

      // Get initial chain ID
      getActualChainId();

      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        console.log("=== CHAIN CHANGED EVENT ===");
        console.log("New chainId:", chainId, "(" + numericChainId + ")");
        console.log("=== END CHAIN CHANGED ===");
        setActualChainId(numericChainId);
        setRefreshKey((prev) => prev + 1); // Force component refresh
      };

      if (window.ethereum.on) {
        window.ethereum.on("chainChanged", handleChainChanged);
      }

      // Cleanup listener
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [isConnected]);

  // Debug: Log chain constants on mount
  useEffect(() => {
    console.log("=== CHAIN CONSTANTS ===");
    console.log("baseSepolia.id:", baseSepolia.id);
    console.log("arbitrum.id:", arbitrum.id);
    console.log("=== END CONSTANTS ===");
  }, []);

  // Debug: Log detailed wallet state
  useEffect(() => {
    console.log("=== DETAILED WALLET STATE ===");
    console.log("Raw values from wagmi hooks:");
    console.log("- useChainId():", chainId);
    console.log("- useAccount().chain:", chain);
    console.log("- useAccount().chain?.id:", chain?.id);
    console.log("- useAccount().chain?.name:", chain?.name);
    console.log("- useAccount().isConnected:", isConnected);
    console.log("- useAccount().address:", address);
    console.log("- actualChainId from wallet:", actualChainId);
    console.log("baseSepolia.id constant:", baseSepolia.id);
    console.log("=== END WALLET STATE ===");
  }, [address, isConnected, chain, chainId, actualChainId]);

  // Debug the getNetworkName logic step by step
  const getNetworkNameWithDebug = () => {
    console.log("=== getNetworkName() LOGIC ===");
    console.log("Step 1: Checking if chain?.name exists");
    console.log("chain?.name:", chain?.name);

    if (chain?.name) {
      console.log("Using chain.name:", chain.name);
      return chain.name;
    }

    console.log("Step 2: Fallback to chainId mapping");
    console.log("wagmi chainId:", chainId);
    console.log("actual chainId from wallet:", actualChainId);

    // Use actual chain ID from wallet if available, otherwise fall back to wagmi
    const effectiveChainId = actualChainId || chainId;
    console.log("effective chainId for switch:", effectiveChainId);

    let result;
    switch (effectiveChainId) {
      case 1:
        result = "Ethereum Mainnet";
        break;
      case 11155111:
        result = "Sepolia Testnet";
        break;
      case 84532:
        result = "Base Sepolia";
        break;
      case 42161:
        result = "Arbitrum One";
        break;
      case 137:
        result = "Polygon";
        break;
      case 10:
        result = "Optimism";
        break;
      case 8453:
        result = "Base";
        break;
      default:
        result = `Unknown Network (${effectiveChainId})`;
    }

    console.log("Switch result:", result);
    console.log("=== END getNetworkName() ===");
    return result;
  };

  // Connect to MetaMask or other injected wallet
  const connectWallet = async () => {
    const injectedConnector = connectors.find((connector) => connector.name === "MetaMask" || connector.name === "Injected");

    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  // Submit hash to smart contract
  const submitHashToContract = async (hash: string): Promise<HashSubmissionResult> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!isCorrectNetwork) {
      throw new Error("Please switch to Base Sepolia network");
    }

    setIsSubmitting(true);

    try {
      console.log("=== SUBMITTING HASH TO CONTRACT ===");
      console.log("Hash to submit:", hash);
      console.log("Contract address:", ANONYMOUS_DATA_CONTRACT.address);

      // Convert string hash to uint256 (the contract expects uint256)
      const uint256Hash = BigInt(hash);
      console.log("Converted to uint256:", uint256Hash.toString());

      // Call the real setHash function on the deployed contract
      const txHash = await writeContract(config, {
        address: ANONYMOUS_DATA_CONTRACT.address,
        abi: ANONYMOUS_DATA_CONTRACT.abi,
        functionName: "setHash",
        args: [uint256Hash],
      });

      console.log("Transaction hash:", txHash);

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash,
      });

      console.log("Transaction confirmed:", receipt);

      const result: HashSubmissionResult = {
        txHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
        timestamp: Date.now(),
      };

      console.log("=== HASH SUBMISSION SUCCESS ===");
      return result;
    } catch (error) {
      console.error("Hash submission failed:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if hash exists in contract
  const checkHashInContract = async (hash: string): Promise<HashInfo> => {
    setIsChecking(true);

    try {
      console.log("=== CHECKING HASH IN CONTRACT ===");
      console.log("Hash to check:", hash);

      // Convert string hash to uint256 for comparison
      const uint256Hash = BigInt(hash);
      console.log("Converted to uint256:", uint256Hash.toString());

      // Read the stored hash from the contract
      const storedHash = (await readContract(config, {
        address: ANONYMOUS_DATA_CONTRACT.address,
        abi: ANONYMOUS_DATA_CONTRACT.abi,
        functionName: "storedHash",
      })) as bigint;

      console.log("Stored hash from contract:", storedHash.toString());

      // Check if the provided hash matches the stored hash
      const exists = uint256Hash === storedHash;
      console.log("Hash match:", exists);

      const result: HashInfo = {
        exists,
        timestamp: exists ? Date.now() : 0, // We don't have timestamp in the contract, so use current time if exists
        submitter: exists ? address || "0x0000000000000000000000000000000000000000" : "0x0000000000000000000000000000000000000000",
      };

      console.log("=== HASH CHECK RESULT ===", result);
      return result;
    } catch (error) {
      console.error("Hash check failed:", error);
      throw error;
    } finally {
      setIsChecking(false);
    }
  };

  // Verify ZK proof on blockchain using verifyKnowledge
  const verifyZKProofOnChain = async (proofData: any): Promise<ZKVerificationResult> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!isCorrectNetwork) {
      throw new Error("Please switch to Base Sepolia network");
    }

    setIsVerifyingZK(true);

    try {
      console.log("=== VERIFYING ZK PROOF ON CHAIN ===");
      console.log("Proof data:", proofData);

      // Extract proof components - the contract expects specific format
      const { proof } = proofData;

      // Convert proof components to the format expected by verifyKnowledge
      // Contract expects: uint[2] a, uint[2][2] b, uint[2] c
      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

      console.log("Formatted proof for contract:");
      console.log(
        "a:",
        a.map((x) => x.toString())
      );
      console.log(
        "b:",
        b.map((row) => row.map((x) => x.toString()))
      );
      console.log(
        "c:",
        c.map((x) => x.toString())
      );

      // Call verifyKnowledge on the contract
      const isValid: boolean = (await readContract(config, {
        address: ANONYMOUS_DATA_CONTRACT.address,
        abi: ANONYMOUS_DATA_CONTRACT.abi,
        functionName: "verifyKnowledge",
        args: [a, b, c] as any, // fix type error
      }));

      console.log("Verification result from contract:", isValid);

      const result: ZKVerificationResult = {
        isValid,
        timestamp: Date.now(),
      };

      console.log("=== ZK VERIFICATION COMPLETE ===", result);
      return result;
    } catch (error) {
      console.error("ZK verification failed:", error);
      throw error;
    } finally {
      setIsVerifyingZK(false);
    }
  };

  // Get network name (using debug version temporarily)
  const getNetworkName = getNetworkNameWithDebug;

  // Check if on correct network - use actual chain ID from wallet
  const effectiveChainId = actualChainId || chainId;
  const isCorrectNetwork = effectiveChainId === baseSepolia.id;

  // Debug isCorrectNetwork logic
  useEffect(() => {
    console.log("=== isCorrectNetwork LOGIC ===");
    console.log("wagmi chainId:", chainId);
    console.log("actual chainId:", actualChainId);
    console.log("effective chainId:", effectiveChainId);
    console.log("baseSepolia.id:", baseSepolia.id);
    console.log("isCorrectNetwork:", isCorrectNetwork);
    console.log("=== END isCorrectNetwork ===");
  }, [chainId, actualChainId, effectiveChainId, isCorrectNetwork]);

  // Switch to Base Sepolia
  const switchToBaseSepolia = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id });
      // Small delay to ensure state updates
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 500);
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

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
    verifyZKProofOnChain,
    isSubmitting,
    isChecking,
    isVerifyingZK,

    // Internal state for debugging
    refreshKey,
  };
}
