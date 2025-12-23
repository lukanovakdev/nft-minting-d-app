"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useToast } from "@/hooks/use-toast"

export function WalletConnect() {
  const { account, isConnecting, connect, disconnect } = useWeb3()
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      await connect()
      // Account will be updated via context, but we'll show a success toast
      // The actual account value will come from the next render
      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet"
      toast({
        title: error instanceof Error && error.message.includes("MetaMask") ? "MetaMask not found" : "Connection failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  return (
    <div>
      {account ? (
        <Button onClick={handleDisconnect} variant="outline" className="gap-2 bg-transparent">
          <Wallet className="w-4 h-4" />
          {account.slice(0, 6)}...{account.slice(-4)}
        </Button>
      ) : (
        <Button onClick={handleConnect} disabled={isConnecting} className="gap-2">
          <Wallet className="w-4 h-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  )
}
