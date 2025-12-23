"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon, ShoppingBag } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useMarketplace } from "@/hooks/use-marketplace"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { ethers } from "ethers"
import Link from "next/link"

interface MarketplaceNFT {
  tokenId: string
  seller: string
  price: string
  tokenURI: string
}

export function MarketplacePage() {
  const { account } = useWeb3()
  const { getActiveListings, getListing } = useMarketplace()
  const { contract } = useNFTContract()
  const [nfts, setNfts] = useState<MarketplaceNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMarketplaceNFTs()
  }, [])

  const loadMarketplaceNFTs = async () => {
    if (!contract) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get all active listing token IDs
      const listingIds = await getActiveListings(0, 100) // Load first 100 listings

      // Fetch details for each listing
      const nftPromises = listingIds.map(async (tokenId) => {
        try {
          const listing = await getListing(tokenId)
          if (!listing || !listing.active) return null

          // Fetch token URI from NFT contract
          const tokenURI = await contract.tokenURI(tokenId)

          return {
            tokenId,
            seller: listing.seller,
            price: listing.price,
            tokenURI,
          }
        } catch (err) {
          console.error(`Error loading NFT ${tokenId}:`, err)
          return null
        }
      })

      const nftResults = await Promise.all(nftPromises)
      const validNFTs = nftResults.filter((nft): nft is MarketplaceNFT => nft !== null)

      setNfts(validNFTs)
    } catch (err) {
      console.error("Error loading marketplace NFTs:", err)
      setError("Failed to load marketplace listings")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading marketplace...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[60vh]">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadMarketplaceNFTs} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">NFT Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and purchase unique NFTs from our collection
            </p>
          </div>
          {account && (
            <Link href="/">
              <Button variant="outline">
                <ShoppingBag className="w-4 h-4 mr-2" />
                My Collection
              </Button>
            </Link>
          )}
        </div>

        {nfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to list an NFT on the marketplace
            </p>
            {account && (
              <Link href="/">
                <Button>Start Minting</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {nfts.length} {nfts.length === 1 ? "NFT" : "NFTs"} listed for sale
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <MarketplaceNFTCard key={nft.tokenId} nft={nft} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface MarketplaceNFTCardProps {
  nft: MarketplaceNFT
}

function MarketplaceNFTCard({ nft }: MarketplaceNFTCardProps) {
  const { account } = useWeb3()
  const isOwnListing = nft.seller.toLowerCase() === account?.toLowerCase()

  return (
    <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-colors">
      <Link href={`/marketplace/${nft.tokenId}`}>
        <div className="aspect-square bg-secondary/50 flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
          <ImageIcon className="w-16 h-16 text-muted-foreground" />
        </div>
      </Link>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Link href={`/marketplace/${nft.tokenId}`}>
            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
              NFT #{nft.tokenId}
            </h3>
          </Link>
          {isOwnListing && <Badge variant="secondary">Your Listing</Badge>}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="text-lg font-bold text-primary">{nft.price} ETH</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">{nft.tokenURI}</p>
        </div>

        <Link href={`/marketplace/${nft.tokenId}`}>
          <Button className="w-full" variant={isOwnListing ? "outline" : "default"}>
            {isOwnListing ? "View Details" : "Buy Now"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}

