import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TabsContent } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Network,
} from "lucide-react"
import { VerificationResult } from "@/hooks/use-zk-proof"

interface VerifyTabProps {
  isVerifying: boolean
  verificationResult: VerificationResult | null
  onVerifyProof: (verificationInput: string, hashInput: string, onChain?: boolean) => Promise<VerificationResult | undefined>
}

export function VerifyTab({ isVerifying, verificationResult, onVerifyProof }: VerifyTabProps) {
  const [verificationInput, setVerificationInput] = useState("")
  const [hashInput, setHashInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (onChain = false) => {
    setError(null)
    try {
      await onVerifyProof(verificationInput, hashInput, onChain)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    }
  }

  return (
    <TabsContent value="verify" className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="proof-input">ZK Proof Data</Label>
          <textarea
            id="proof-input"
            value={verificationInput}
            onChange={(e) => setVerificationInput(e.target.value)}
            placeholder="Paste the ZK proof JSON data here..."
            className="w-full h-32 p-3 border rounded-md text-sm font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hash-input">Expected Hash</Label>
          <Input
            id="hash-input"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="0x1234...abcd"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <Button
            onClick={() => handleVerify(false)}
            disabled={!verificationInput.trim() || !hashInput.trim() || isVerifying}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Verify Locally
          </Button>
          <Button
            onClick={() => handleVerify(true)}
            disabled={!verificationInput.trim() || !hashInput.trim() || isVerifying}
          >
            <Network className="h-4 w-4 mr-2" />
            Verify On-Chain
          </Button>
        </div>

        {isVerifying && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 animate-spin" />
            Verifying proof...
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Verification Error</strong>
              <div className="text-sm mt-1">{error}</div>
            </AlertDescription>
          </Alert>
        )}

        {verificationResult && (
          <Alert
            className={
              verificationResult.isValid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
            }
          >
            {verificationResult.isValid ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={verificationResult.isValid ? "text-emerald-800" : "text-red-800"}>
              <div className="space-y-2">
                <div>
                  <strong>Verification {verificationResult.isValid ? "Successful" : "Failed"}</strong>
                </div>
                <div className="text-sm space-y-1">
                  <div>Verified at: {new Date(verificationResult.timestamp).toLocaleString()}</div>
                  {verificationResult.gasUsed && (
                    <>
                      <div>Gas used: {verificationResult.gasUsed.toLocaleString()}</div>
                      <div>Block: #{verificationResult.blockNumber}</div>
                    </>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900">Why Zero-Knowledge Proofs?</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="space-y-2">
            <h5 className="font-medium text-slate-900">Traditional Verification</h5>
            <ul className="space-y-1">
              <li>• Reveals sensitive data</li>
              <li>• Requires trust in verifier</li>
              <li>• Data can be compromised</li>
              <li>• Privacy concerns</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-slate-900">Zero-Knowledge Proofs</h5>
            <ul className="space-y-1">
              <li>• Secrets remain private</li>
              <li>• Cryptographic guarantees</li>
              <li>• No data exposure risk</li>
              <li>• Complete privacy preservation</li>
            </ul>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}