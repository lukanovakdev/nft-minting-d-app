"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, ShoppingCart, AlertCircle } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useMarketplace, type Listing } from "@/hooks/use-marketplace"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BuyNFTProps {
  tokenId: string
  listing: Listing | null
  onPurchased?: () => void
}

export function BuyNFT({ tokenId, listing, onPurchased }: BuyNFTProps) {
  const { account } = useWeb3()
  const { buyNFT, marketplaceFee } = useMarketplace()
  const { toast } = useToast()
  const [isBuying, setIsBuying] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBalance() {
      if (!account || typeof window.ethereum === "undefined") return

      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(account)
        setBalance(ethers.formatEther(balance))
      } catch (error) {
        console.error("Error fetching balance:", error)
      }
    }

    fetchBalance()
  }, [account])

  const handleBuy = async () => {
    if (!listing || !account) return

    setIsBuying(true)
    try {
      await buyNFT(tokenId, listing.price)
      onPurchased?.()
    } catch (error) {
      // Error already handled in hook
      console.error("Error buying NFT:", error)
    } finally {
      setIsBuying(false)
    }
  }

  if (!listing || !listing.active) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not for Sale</CardTitle>
          <CardDescription>This NFT is not currently listed on the marketplace.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>Please connect your wallet to purchase this NFT.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const price = parseFloat(listing.price)
  const feePercentage = parseFloat(marketplaceFee || "0")
  const feeAmount = price * (feePercentage / 100)
  const totalPrice = price
  const hasEnoughBalance = balance ? parseFloat(balance) >= totalPrice : false
  const isOwnListing = listing.seller.toLowerCase() === account.toLowerCase()

  if (isOwnListing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Listing</CardTitle>
          <CardDescription>This is your listing. You cannot purchase your own NFT.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase NFT #{tokenId}</CardTitle>
        <CardDescription>Complete your purchase to own this NFT</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sale Price</span>
            <span className="font-medium">{listing.price} ETH</span>
          </div>
          {marketplaceFee && feeAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Marketplace Fee ({marketplaceFee}%)</span>
              <span className="font-medium">{feeAmount.toFixed(4)} ETH</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{listing.price} ETH</span>
          </div>
        </div>

        {balance && (
          <div className="text-sm">
            <span className="text-muted-foreground">Your Balance: </span>
            <span className="font-medium">{parseFloat(balance).toFixed(4)} ETH</span>
          </div>
        )}

        {!hasEnoughBalance && balance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Insufficient Balance</AlertTitle>
            <AlertDescription>
              You need {totalPrice.toFixed(4)} ETH but you only have {parseFloat(balance).toFixed(4)} ETH.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleBuy}
          disabled={isBuying || !hasEnoughBalance}
          className="w-full"
          size="lg"
        >
          {isBuying ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Buy Now
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

