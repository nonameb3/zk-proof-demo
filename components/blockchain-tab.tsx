import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Search,
  Wallet,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import type { HashSubmissionResult, HashInfo, ZKVerificationResult } from "@/hooks/use-web3"

interface BlockchainTabProps {
  currentHash?: string
}

export function BlockchainTab({ currentHash }: BlockchainTabProps) {
  const { 
    isConnected, 
    address, 
    networkName,
    isCorrectNetwork,
    switchToBaseSepolia,
    isSwitching,
    submitHashToContract, 
    checkHashInContract,
    verifyZKProofOnChain,
    isSubmitting,
    isChecking,
    isVerifyingZK
  } = useWeb3()
  
  const [hashToSubmit, setHashToSubmit] = useState(currentHash || "")
  const [hashToCheck, setHashToCheck] = useState("")
  const [proofToVerify, setProofToVerify] = useState("")
  const [submissionResult, setSubmissionResult] = useState<HashSubmissionResult | null>(null)
  const [hashInfo, setHashInfo] = useState<HashInfo | null>(null)
  const [zkVerificationResult, setZkVerificationResult] = useState<ZKVerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-fill hash when currentHash changes
  useState(() => {
    if (currentHash) {
      setHashToSubmit(currentHash)
    }
  })

  const handleSubmitHash = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first")
      return
    }

    if (!hashToSubmit.trim()) {
      setError("Please enter a hash to submit")
      return
    }

    setError(null)
    try {
      const result = await submitHashToContract(hashToSubmit)
      setSubmissionResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit hash")
    }
  }

  const handleCheckHash = async () => {
    if (!hashToCheck.trim()) {
      setError("Please enter a hash to check")
      return
    }

    setError(null)
    try {
      const info = await checkHashInContract(hashToCheck)
      setHashInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check hash")
    }
  }

  const [zkError, setZkError] = useState<string | null>(null)

  const handleVerifyZKProof = async () => {
    if (!proofToVerify.trim()) {
      setZkError("Please enter a ZK proof to verify")
      return
    }

    setZkError(null)
    setZkVerificationResult(null)
    try {
      const proofData = JSON.parse(proofToVerify)
      const result = await verifyZKProofOnChain(proofData)
      setZkVerificationResult(result)
    } catch (err) {
      setZkError(err instanceof Error ? err.message : "Failed to verify ZK proof")
    }
  }

  return (
    <TabsContent value="blockchain" className="space-y-6">
      {/* Wallet Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
          <CardDescription>
            Connect your wallet to interact with the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Connected to {networkName}</span>
              </div>
              <div className="text-sm text-slate-600 font-mono">
                Address: {address}
              </div>
              
              {!isCorrectNetwork && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>Wrong Network!</strong>
                        <div className="text-sm mt-1">Please switch to Base Sepolia to interact with the contract.</div>
                      </div>
                      <Button
                        onClick={switchToBaseSepolia}
                        disabled={isSwitching}
                        size="sm"
                        className="ml-3 bg-blue-600 hover:bg-blue-700"
                      >
                        {isSwitching ? (
                          <Clock className="h-3 w-3 mr-1 animate-spin" />
                        ) : null}
                        Switch Network
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm">Please connect your wallet to continue</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Hash to Contract */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Hash to Blockchain
          </CardTitle>
          <CardDescription>
            Store your ZK proof hash on the blockchain for permanent verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hash-submit">Hash to Submit</Label>
            <Input
              id="hash-submit"
              value={hashToSubmit}
              onChange={(e) => setHashToSubmit(e.target.value)}
              placeholder="Enter hash to submit to contract..."
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleSubmitHash}
            disabled={!isConnected || !isCorrectNetwork || !hashToSubmit.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Submitting to Contract...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Hash
              </>
            )}
          </Button>

          {submissionResult && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                <div className="space-y-2">
                  <div><strong>Hash Successfully Submitted!</strong></div>
                  <div className="text-sm space-y-1">
                    <div>Transaction: <code className="bg-emerald-100 px-1 rounded">{submissionResult.txHash}</code></div>
                    <div>Block: #{submissionResult.blockNumber}</div>
                    <div>Gas Used: {submissionResult.gasUsed.toLocaleString()}</div>
                    <div>Timestamp: {new Date(submissionResult.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Check Hash in Contract */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Check Hash in Contract
          </CardTitle>
          <CardDescription>
            Verify if a hash has been stored in the smart contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hash-check">Hash to Check</Label>
            <Input
              id="hash-check"
              value={hashToCheck}
              onChange={(e) => setHashToCheck(e.target.value)}
              placeholder="Enter hash to check in contract..."
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleCheckHash}
            disabled={!hashToCheck.trim() || isChecking}
            variant="outline"
            className="w-full"
          >
            {isChecking ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Checking Contract...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Check Hash
              </>
            )}
          </Button>

          {hashInfo && (
            <Alert 
              className={
                hashInfo.exists 
                  ? "border-emerald-200 bg-emerald-50" 
                  : "border-slate-200 bg-slate-50"
              }
            >
              {hashInfo.exists ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-slate-600" />
              )}
              <AlertDescription 
                className={hashInfo.exists ? "text-emerald-800" : "text-slate-800"}
              >
                <div className="space-y-2">
                  <div>
                    <strong>
                      {hashInfo.exists ? "Hash Found in Contract!" : "Hash Not Found"}
                    </strong>
                  </div>
                  {hashInfo.exists && (
                    <div className="text-sm space-y-1">
                      <div>Submitted by: <code className="bg-emerald-100 px-1 rounded">{hashInfo.submitter}</code></div>
                      <div>Stored at: {new Date(hashInfo.timestamp).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display for Hash Check Section */}
          {error && !zkVerificationResult && !submissionResult && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Hash Check Error</strong>
                <div className="text-sm mt-1">{error}</div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Verify ZK Proof on Blockchain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Verify ZK Proof on Blockchain
          </CardTitle>
          <CardDescription>
            Verify a ZK proof against the stored hash using the contract&apos;s verifyKnowledge function
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proof-verify">ZK Proof JSON</Label>
            <textarea
              id="proof-verify"
              value={proofToVerify}
              onChange={(e) => setProofToVerify(e.target.value)}
              placeholder="Paste the complete ZK proof JSON here..."
              className="w-full h-32 p-3 border rounded-md text-sm font-mono"
            />
          </div>

          <Button
            onClick={handleVerifyZKProof}
            disabled={!proofToVerify.trim() || isVerifyingZK}
            variant="outline"
            className="w-full"
          >
            {isVerifyingZK ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Verifying on Blockchain...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify ZK Proof on Chain
              </>
            )}
          </Button>

          {/* ZK Verification Error */}
          {zkError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>ZK Verification Error</strong>
                <div className="text-sm mt-1">{zkError}</div>
              </AlertDescription>
            </Alert>
          )}

          {zkVerificationResult && (
            <Alert 
              className={
                zkVerificationResult.isValid 
                  ? "border-emerald-200 bg-emerald-50" 
                  : "border-red-200 bg-red-50"
              }
            >
              {zkVerificationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription 
                className={zkVerificationResult.isValid ? "text-emerald-800" : "text-red-800"}
              >
                <div className="space-y-2">
                  <div>
                    <strong>
                      {zkVerificationResult.isValid ? "✅ ZK Proof Valid!" : "❌ ZK Proof Invalid"}
                    </strong>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Verified at: {new Date(zkVerificationResult.timestamp).toLocaleString()}</div>
                    <div>Method: Contract verifyKnowledge() call</div>
                    {zkVerificationResult.txHash && (
                      <>
                        <div>Transaction: <code className="bg-emerald-100 px-1 rounded">{zkVerificationResult.txHash}</code></div>
                        <div>Block: #{zkVerificationResult.blockNumber}</div>
                        <div>Gas Used: {zkVerificationResult.gasUsed?.toLocaleString()}</div>
                      </>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Smart Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Smart Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm font-medium">Contract Name</div>
            <div className="text-sm text-slate-600">AnonymousData</div>
          </div>
          <div>
            <div className="text-sm font-medium">Contract Address</div>
            <div className="text-sm text-slate-600 font-mono">0xfC13069148EFED7865b1355aCb9986E8eEfd232b</div>
          </div>
          <div>
            <div className="text-sm font-medium">Network</div>
            <div className="text-sm text-slate-600">{networkName || 'Base Sepolia (Chain ID: 84532)'}</div>
          </div>
          <div>
            <div className="text-sm font-medium">RPC URL</div>
            <div className="text-sm text-slate-600 font-mono">https://sepolia.base.org</div>
          </div>
          <div>
            <div className="text-sm font-medium">Features</div>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>Store Poseidon hashes via setHash(uint256)</li>
              <li>Read stored hash via storedHash()</li>
              <li>ZK proof verification with verifyKnowledge()</li>
              <li>Groth16 verifier integration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}