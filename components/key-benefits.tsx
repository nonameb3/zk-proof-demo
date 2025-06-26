import { Card, CardContent } from "@/components/ui/card"
import { Lock, Zap, Network } from "lucide-react"

export function KeyBenefits() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="border-emerald-200">
        <CardContent className="p-4 text-center">
          <Lock className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-900">Privacy Preserved</h3>
          <p className="text-sm text-slate-600">Secrets never leave your device</p>
        </CardContent>
      </Card>
      <Card className="border-amber-200">
        <CardContent className="p-4 text-center">
          <Zap className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-900">Instant Verification</h3>
          <p className="text-sm text-slate-600">Cryptographic proof validation</p>
        </CardContent>
      </Card>
      <Card className="border-purple-200">
        <CardContent className="p-4 text-center">
          <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-900">Blockchain Ready</h3>
          <p className="text-sm text-slate-600">On-chain verification support</p>
        </CardContent>
      </Card>
    </div>
  )
}