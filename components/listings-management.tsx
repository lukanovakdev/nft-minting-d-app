"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon, X, Tag } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useMarketplace, type Listing } from "@/hooks/use-marketplace"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { useMint } from "@/contexts/mint-context"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ListingsManagement() {
  const { account } = useWeb3()
  const { getSellerListings, getListing, cancelListing, updateListingPrice } = useMarketplace()
  const { contract } = useNFTContract()
  const { triggerRefresh } = useMint()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Array<{ tokenId: string; listing: Listing; tokenURI: string }>>([])

  useEffect(() => {
    if (account) {
      loadListings()
    }
  }, [account])

  const loadListings = async () => {
    if (!account || !contract) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const listingIds = await getSellerListings(account)
      
      const listingsData = await Promise.all(
        listingIds.map(async (tokenId) => {
          try {
            const [listing, tokenURI] = await Promise.all([
              getListing(tokenId),
              contract.tokenURI(tokenId),
            ])

            if (listing && listing.active) {
              return { tokenId, listing, tokenURI }
            }
            return null
          } catch (error) {
            console.error(`Error loading listing for token ${tokenId}:`, error)
            return null
          }
        })
      )

      setListings(listingsData.filter((item): item is { tokenId: string; listing: Listing; tokenURI: string } => item !== null))
    } catch (error) {
      console.error("Error loading listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelListing = async (tokenId: string) => {
    try {
      await cancelListing(tokenId)
      triggerRefresh()
      loadListings()
    } catch (error) {
      console.error("Error cancelling listing:", error)
    }
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Connect your wallet to view your listings</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Tag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Active Listings</h3>
        <p className="text-muted-foreground mb-4">You don't have any NFTs listed for sale</p>
        <Link href="/">
          <Button>View My Collection</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">My Listings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your NFT listings on the marketplace
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">View Collection</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(({ tokenId, listing, tokenURI }) => (
          <ListingCard
            key={tokenId}
            tokenId={tokenId}
            listing={listing}
            tokenURI={tokenURI}
            onCancel={handleCancelListing}
          />
        ))}
      </div>
    </div>
  )
}

interface ListingCardProps {
  tokenId: string
  listing: Listing
  tokenURI: string
  onCancel: (tokenId: string) => void
}

function ListingCard({ tokenId, listing, tokenURI, onCancel }: ListingCardProps) {
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await onCancel(tokenId)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-colors flex flex-col">
      <Link href={`/marketplace/${tokenId}`}>
        <div className="aspect-square bg-secondary/50 flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
          <ImageIcon className="w-16 h-16 text-muted-foreground" />
        </div>
      </Link>
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <Link href={`/marketplace/${tokenId}`}>
            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
              NFT #{tokenId}
            </h3>
          </Link>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Listed
          </Badge>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Listed Price</span>
            <span className="text-sm font-semibold text-primary">{listing.price} ETH</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono truncate flex-1">{tokenURI}</p>

        <div className="flex gap-2 pt-2">
          <Link href={`/marketplace/${tokenId}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isCancelling}>
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Listing?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel the listing for NFT #{tokenId}? This will remove it from the marketplace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Listed</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Cancel Listing
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  )
}

