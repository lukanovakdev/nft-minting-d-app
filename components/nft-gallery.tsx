"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ImageIcon } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useNFTs } from "@/hooks/use-nfts"

export function NFTGallery() {
  const { account } = useWeb3()
  const { nfts, loading } = useNFTs()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Connect your wallet to view your NFTs</p>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No NFTs yet</h3>
        <p className="text-muted-foreground">Mint your first NFT to get started</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Your NFT Collection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <Card
            key={nft.tokenId}
            className="overflow-hidden bg-card border-border hover:border-primary/50 transition-colors"
          >
            <div className="aspect-square bg-secondary/50 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">NFT #{nft.tokenId}</h3>
                <Badge variant="secondary">Owned</Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">{nft.tokenURI}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
