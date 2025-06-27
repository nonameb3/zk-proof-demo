import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/hooks/use-web3"
import { Wallet, LogOut, Loader2 } from "lucide-react"

export function WalletConnect() {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    balance, 
    networkName,
    connectWallet, 
    disconnect 
  } = useWeb3()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end text-sm">
          <div className="font-mono text-xs">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </div>
          <div className="text-xs text-slate-500">
            {balance?.formatted ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {networkName}
        </Badge>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          className="h-8"
        >
          <LogOut className="h-3 w-3 mr-1" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className="h-8"
    >
      {isConnecting ? (
        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
      ) : (
        <Wallet className="h-3 w-3 mr-2" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}