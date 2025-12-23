"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon, ArrowLeft } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useMarketplace, type Listing } from "@/hooks/use-marketplace"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { BuyNFT } from "@/components/buy-nft"
import { ListNFT } from "@/components/list-nft"
import { useMint } from "@/contexts/mint-context"
import { useMarketplace } from "@/hooks/use-marketplace"
import Link from "next/link"

interface NFTDetailPageProps {
  tokenId: string
}

export function NFTDetailPage({ tokenId }: NFTDetailPageProps) {
  const { account } = useWeb3()
  const { contract } = useNFTContract()
  const { getListing, cancelListing } = useMarketplace()
  const { triggerRefresh } = useMint()
  const [loading, setLoading] = useState(true)
  const [tokenURI, setTokenURI] = useState<string>("")
  const [owner, setOwner] = useState<string>("")
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNFTDetails()
  }, [tokenId])

  const loadNFTDetails = async () => {
    if (!contract) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Load NFT details
      const [uri, ownerAddress] = await Promise.all([
        contract.tokenURI(tokenId),
        contract.ownerOf(tokenId),
      ])

      setTokenURI(uri)
      setOwner(ownerAddress)

      // Load listing if exists
      const listingData = await getListing(tokenId)
      setListing(listingData)
    } catch (err) {
      console.error("Error loading NFT details:", err)
      setError("Failed to load NFT details")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchased = () => {
    triggerRefresh()
    loadNFTDetails()
  }

  const handleListed = () => {
    triggerRefresh()
    loadNFTDetails()
  }

  const handleCancelled = async () => {
    triggerRefresh()
    loadNFTDetails()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading NFT details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 min-h-[60vh]">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/marketplace">
            <Button variant="outline">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = account?.toLowerCase() === owner.toLowerCase()
  const isListed = listing?.active ?? false

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NFT Image/Preview */}
        <Card className="overflow-hidden">
          <div className="aspect-square bg-secondary/50 flex items-center justify-center">
            <ImageIcon className="w-32 h-32 text-muted-foreground" />
          </div>
        </Card>

        {/* NFT Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">NFT #{tokenId}</h1>
              {isListed && <Badge variant="default">For Sale</Badge>}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Owner</p>
                <p className="font-mono text-sm">
                  {owner.slice(0, 6)}...{owner.slice(-4)}
                  {isOwner && <Badge variant="secondary" className="ml-2">You</Badge>}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Token URI</p>
                <p className="font-mono text-xs break-all">{tokenURI}</p>
              </div>

              {listing && listing.active && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-2xl font-bold text-primary">{listing.price} ETH</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Card */}
          {isOwner ? (
            <>
              {isListed ? (
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-4">Manage Listing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This NFT is currently listed for sale.
                    </p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Price: </span>
                        <span className="font-semibold">{listing?.price} ETH</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (listing) {
                        try {
                          await cancelListing(tokenId)
                          handleCancelled()
                        } catch (error) {
                          console.error("Error cancelling listing:", error)
                        }
                      }
                    }}
                    className="w-full"
                  >
                    Cancel Listing
                  </Button>
                </Card>
              ) : (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">List for Sale</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    List this NFT on the marketplace for others to purchase.
                  </p>
                  <ListNFT tokenId={tokenId} onListed={handleListed} />
                </Card>
              )}
            </>
          ) : (
            <BuyNFT tokenId={tokenId} listing={listing} onPurchased={handlePurchased} />
          )}
        </div>
      </div>
    </div>
  )
}

