import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TabsContent } from "@/components/ui/tabs"
import {
  Hash,
  Lock,
  Info,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react"

interface GenerateTabProps {
  secret: string
  setSecret: (secret: string) => void
  isGenerating: boolean
  generationProgress: number
  generatePoseidonHash: (input: string) => string
  onGenerateProof: (secret: string) => Promise<void>
}

export function GenerateTab({
  secret,
  setSecret,
  isGenerating,
  generationProgress,
  generatePoseidonHash,
  onGenerateProof,
}: GenerateTabProps) {
  const [showSecret, setShowSecret] = useState(false)

  return (
    <TabsContent value="generate" className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="secret" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Secret Message or Data
          </Label>
          <div className="relative">
            <Input
              id="secret"
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your private data (e.g., password, credential, private key)"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Info className="h-3 w-3" />
            This data never leaves your browser and is never transmitted
          </p>
        </div>

        {secret && (
          <Alert>
            <Hash className="h-4 w-4" />
            <AlertDescription>
              <strong>Poseidon Hash Preview:</strong> {generatePoseidonHash(secret)}
            </AlertDescription>
          </Alert>
        )}

        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Generating ZK Proof...</span>
            </div>
            <Progress value={generationProgress} className="w-full" />
            <div className="text-xs text-slate-500 space-y-1">
              <div>• Computing witness generation</div>
              <div>• Running trusted setup</div>
              <div>• Creating cryptographic proof</div>
            </div>
          </div>
        )}

        <Button
          onClick={() => onGenerateProof(secret)}
          disabled={!secret.trim() || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? "Generating Proof..." : "Generate ZK Proof"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Technical Specifications</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <div>• Algorithm: Groth16 ZK-SNARK</div>
            <div>• Hash Function: Poseidon</div>
            <div>• Proof Size: ~256 bytes</div>
            <div>• Generation Time: 2-5 seconds</div>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Use Cases</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <div>• Identity verification</div>
            <div>• Credential validation</div>
            <div>• Private authentication</div>
            <div>• Compliance proofs</div>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}