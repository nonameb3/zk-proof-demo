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
  ExternalLink,
  Wallet,
  Link as LinkIcon,
} from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import type { HashSubmissionResult, HashInfo } from "@/hooks/use-web3"

interface BlockchainTabProps {
  currentHash?: string
}

export function BlockchainTab({ currentHash }: BlockchainTabProps) {
  const { 
    isConnected, 
    address, 
    networkName, 
    submitHashToContract, 
    checkHashInContract,
    isSubmitting,
    isChecking 
  } = useWeb3()
  
  const [hashToSubmit, setHashToSubmit] = useState(currentHash || "")
  const [hashToCheck, setHashToCheck] = useState("")
  const [submissionResult, setSubmissionResult] = useState<HashSubmissionResult | null>(null)
  const [hashInfo, setHashInfo] = useState<HashInfo | null>(null)
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Connected to {networkName}</span>
              </div>
              <div className="text-sm text-slate-600 font-mono">
                Address: {address}
              </div>
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
            disabled={!isConnected || !hashToSubmit.trim() || isSubmitting}
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
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error</strong>
            <div className="text-sm mt-1">{error}</div>
          </AlertDescription>
        </Alert>
      )}

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
            <div className="text-sm font-medium">Contract Address</div>
            <div className="text-sm text-slate-600 font-mono">0x1234567890123456789012345678901234567890</div>
          </div>
          <div>
            <div className="text-sm font-medium">Network</div>
            <div className="text-sm text-slate-600">{networkName}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Features</div>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>Store ZK proof hashes on-chain</li>
              <li>Verify hash existence and metadata</li>
              <li>Immutable proof of submission</li>
              <li>Decentralized verification</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}