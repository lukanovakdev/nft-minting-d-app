"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon, Tag } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useNFTs, type NFT } from "@/hooks/use-nfts"
import { useMarketplace, type Listing } from "@/hooks/use-marketplace"
import { ListNFT } from "@/components/list-nft"
import Link from "next/link"

export function NFTGallery() {
  const { account } = useWeb3()
  const { nfts, loading } = useNFTs()
  const { getListing } = useMarketplace()
  const [listings, setListings] = useState<Map<string, Listing>>(new Map())
  const [loadingListings, setLoadingListings] = useState(false)

  useEffect(() => {
    if (nfts.length > 0 && account && getListing) {
      loadListings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts, account])

  const loadListings = async () => {
    setLoadingListings(true)
    try {
      const listingsMap = new Map<string, Listing>()
      
      // Load listings for all NFTs in parallel
      const listingPromises = nfts.map(async (nft) => {
        try {
          const listing = await getListing(nft.tokenId)
          if (listing && listing.active) {
            listingsMap.set(nft.tokenId, listing)
          }
        } catch (error) {
          console.error(`Error loading listing for token ${nft.tokenId}:`, error)
        }
      })

      await Promise.all(listingPromises)
      setListings(listingsMap)
    } catch (error) {
      console.error("Error loading listings:", error)
    } finally {
      setLoadingListings(false)
    }
  }

  if (loading || loadingListings) {
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
        {nfts.map((nft) => {
          const listing = listings.get(nft.tokenId)
          const isListed = listing?.active ?? false

          return (
            <NFTGalleryCard key={nft.tokenId} nft={nft} listing={listing} isListed={isListed} />
          )
        })}
      </div>
    </div>
  )
}

interface NFTGalleryCardProps {
  nft: NFT
  listing: Listing | undefined
  isListed: boolean
}

function NFTGalleryCard({ nft, listing, isListed }: NFTGalleryCardProps) {
  return (
    <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-colors flex flex-col">
      <Link href={`/marketplace/${nft.tokenId}`}>
        <div className="aspect-square bg-secondary/50 flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
          <ImageIcon className="w-16 h-16 text-muted-foreground" />
        </div>
      </Link>
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <Link href={`/marketplace/${nft.tokenId}`}>
            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
              NFT #{nft.tokenId}
            </h3>
          </Link>
          <div className="flex gap-2">
            {isListed ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                Listed
              </Badge>
            ) : (
              <Badge variant="secondary">Owned</Badge>
            )}
          </div>
        </div>

        {isListed && listing && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Listed Price</span>
              <span className="text-sm font-semibold text-primary">{listing.price} ETH</span>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground font-mono truncate flex-1">{nft.tokenURI}</p>

        <div className="flex gap-2 pt-2">
          <Link href={`/marketplace/${nft.tokenId}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          {!isListed && (
            <ListNFT tokenId={nft.tokenId} />
          )}
        </div>
      </div>
    </Card>
  )
}
