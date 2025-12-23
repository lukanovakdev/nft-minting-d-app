"use client"

import { WalletConnect } from "./wallet-connect"
import { Hexagon } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2">
            <Hexagon className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">NFT Minter</span>
        </div>
        <WalletConnect />
      </div>
    </header>
  )
}
