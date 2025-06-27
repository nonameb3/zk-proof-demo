import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TabsContent } from "@/components/ui/tabs"
import {
  CheckCircle,
  Hash,
  Clock,
  Copy,
  Download,
  Info,
  Upload,
} from "lucide-react"
import { ZKProof } from "@/hooks/use-zk-proof"
import { useWeb3 } from "@/hooks/use-web3"
import { useState } from "react"

interface ShareTabProps {
  zkProof: ZKProof | null
  copied: boolean
  onCopyProof: () => Promise<void>
  onSwitchToBlockchain?: () => void
}

export function ShareTab({ zkProof, copied, onCopyProof, onSwitchToBlockchain }: ShareTabProps) {
  const { isConnected, submitHashToContract, isSubmitting } = useWeb3()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitToBlockchain = async () => {
    if (!zkProof?.hash) return
    
    try {
      await submitHashToContract(zkProof.hash)
      setSubmitted(true)
      if (onSwitchToBlockchain) {
        onSwitchToBlockchain()
      }
    } catch {
      // Failed to submit hash to blockchain
    }
  }
  return (
    <TabsContent value="share" className="space-y-6">
      {zkProof && (
        <>
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              <strong>Proof Generated Successfully!</strong> Your secret is now cryptographically proven
              without being revealed.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Public Hash
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs bg-slate-100 p-2 rounded block break-all">{zkProof.hash}</code>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">{new Date(zkProof.timestamp).toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label className="text-sm font-medium">ZK Proof Data</Label>
              <div className="mt-2 bg-slate-50 p-4 rounded-lg">
                <code className="text-xs text-slate-700 whitespace-pre-wrap break-all">
                  {JSON.stringify(
                    {
                      proof: zkProof.proof,
                      publicSignals: zkProof.publicSignals,
                      hash: zkProof.hash,
                    },
                    null,
                    2,
                  )}
                </code>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex gap-2">
                <Button onClick={onCopyProof} variant="outline" className="flex-1 bg-transparent">
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy Proof"}
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
              
              {isConnected && (
                <Button 
                  onClick={handleSubmitToBlockchain} 
                  disabled={isSubmitting || submitted}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isSubmitting 
                    ? "Submitting to Blockchain..." 
                    : submitted 
                    ? "Submitted to Blockchain ✓" 
                    : "Submit Hash to Blockchain"
                  }
                </Button>
              )}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Share this proof and hash with the verifier. Your original secret remains completely private.
              </AlertDescription>
            </Alert>
          </div>
        </>
      )}
    </TabsContent>
  )
}