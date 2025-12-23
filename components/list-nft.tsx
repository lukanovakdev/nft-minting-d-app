"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Tag } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useMarketplace } from "@/hooks/use-marketplace"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { MARKETPLACE_ADDRESS } from "@/lib/contract-config"

interface ListNFTProps {
  tokenId: string
  onListed?: () => void
}

export function ListNFT({ tokenId, onListed }: ListNFTProps) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isListing, setIsListing] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [checkingApproval, setCheckingApproval] = useState(false)

  const { account } = useWeb3()
  const { listNFT, marketplaceFee } = useMarketplace()
  const { contractWithSigner } = useNFTContract()
  const { toast } = useToast()

  const checkApproval = async () => {
    if (!contractWithSigner || !account) return

    setCheckingApproval(true)
    try {
      // Check if marketplace is approved for this token
      const approved = await contractWithSigner.getApproved(tokenId)
      const isApprovedForAll = await contractWithSigner.isApprovedForAll(account, MARKETPLACE_ADDRESS)

      setIsApproved(
        approved.toLowerCase() === MARKETPLACE_ADDRESS.toLowerCase() || isApprovedForAll
      )
    } catch (error) {
      console.error("Error checking approval:", error)
      setIsApproved(false)
    } finally {
      setCheckingApproval(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      checkApproval()
      setPrice("")
    }
  }

  const handleApprove = async () => {
    if (!contractWithSigner) return

    setIsApproving(true)
    try {
      // First try to approve for all (better UX for multiple listings)
      const tx = await contractWithSigner.setApprovalForAll(MARKETPLACE_ADDRESS, true)
      
      toast({
        title: "Approval submitted",
        description: "Waiting for confirmation...",
      })

      await tx.wait()

      setIsApproved(true)
      toast({
        title: "Marketplace approved",
        description: "You can now list your NFTs",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve marketplace"
      toast({
        title: "Approval failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleList = async () => {
    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      })
      return
    }

    setIsListing(true)
    try {
      await listNFT(tokenId, price)
      setOpen(false)
      setPrice("")
      onListed?.()
    } catch (error) {
      // Error already handled in hook
      console.error("Error listing NFT:", error)
    } finally {
      setIsListing(false)
    }
  }

  if (!account) {
    return (
      <Button disabled variant="outline" size="sm">
        <Tag className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="w-4 h-4 mr-2" />
          List for Sale
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>List NFT #{tokenId} for Sale</DialogTitle>
          <DialogDescription>
            Set a price for your NFT. Once listed, it will be available for purchase on the marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {checkingApproval ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Checking approval...</span>
            </div>
          ) : !isApproved ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Before listing, you need to approve the marketplace to transfer your NFT.
                </p>
                <p className="text-xs text-muted-foreground">
                  This is a one-time approval that allows you to list multiple NFTs.
                </p>
              </div>
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full"
                variant="default"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve Marketplace"
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="price">Price (ETH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isListing}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the price you want to sell this NFT for
                </p>
              </div>

              {marketplaceFee && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sale Price</span>
                    <span className="font-medium">{price || "0"} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Marketplace Fee ({marketplaceFee}%)</span>
                    <span className="font-medium">
                      {price ? (parseFloat(price) * (parseFloat(marketplaceFee) / 100)).toFixed(4) : "0"} ETH
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm font-medium">
                    <span>You Receive</span>
                    <span>
                      {price
                        ? (parseFloat(price) * (1 - parseFloat(marketplaceFee) / 100)).toFixed(4)
                        : "0"}{" "}
                      ETH
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isListing || isApproving}>
            Cancel
          </Button>
          {isApproved && (
            <Button onClick={handleList} disabled={isListing || !price || parseFloat(price) <= 0}>
              {isListing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Listing...
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4 mr-2" />
                  List for Sale
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

