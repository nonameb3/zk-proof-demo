import { Shield } from "lucide-react"
import { WalletConnect } from "./wallet-connect"

export function Header() {
  return (
    <div className="space-y-6">
      {/* Top row - Wallet connection only, positioned right */}
      <div className="flex justify-end">
        <WalletConnect />
      </div>
      
      {/* Center section - Title with icon, centered */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-emerald-600" />
          <h1 className="text-4xl font-bold text-slate-900">Zero-Knowledge Proof Demo</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Demonstrate privacy-preserving verification where secrets remain hidden while proving their validity.
          Perfect for credentials, authentication, and private data verification.
        </p>
      </div>
    </div>
  )
}