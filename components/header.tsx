"use client"

import Link from "next/link"
import { WalletConnect } from "./wallet-connect"
import { Hexagon, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-primary rounded-lg p-2">
            <Hexagon className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">NFT Minter</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
          </Link>
          <WalletConnect />
        </div>
      </div>
    </header>
  )
}
