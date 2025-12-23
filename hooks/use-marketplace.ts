"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "@/contexts/web3-context"
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/lib/contract-config"
import { useToast } from "@/hooks/use-toast"

export interface Listing {
  seller: string
  tokenId: string
  price: string
  active: boolean
}

export function useMarketplace() {
  const { provider, signer } = useWeb3()
  const { toast } = useToast()
  const [marketplaceFee, setMarketplaceFee] = useState<string>("0")
  const [loading, setLoading] = useState(false)

  const marketplaceContract = useMemo(() => {
    if (!provider) return null
    return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
  }, [provider])

  const marketplaceContractWithSigner = useMemo(() => {
    if (!signer) return null
    return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer)
  }, [signer])

  useEffect(() => {
    async function fetchMarketplaceFee() {
      if (!marketplaceContract) return

      try {
        const fee = await marketplaceContract.marketplaceFee()
        const feePercentage = (Number(fee) / 100).toFixed(2)
        setMarketplaceFee(feePercentage)
      } catch (error) {
        console.error("Error fetching marketplace fee:", error)
      }
    }

    fetchMarketplaceFee()
  }, [marketplaceContract])

  const getListing = useCallback(
    async (tokenId: string): Promise<Listing | null> => {
      if (!marketplaceContract) return null

      try {
        const [seller, price, active] = await marketplaceContract.getListing(tokenId)
        return {
          seller,
          tokenId,
          price: ethers.formatEther(price),
          active,
        }
      } catch (error) {
        console.error("Error fetching listing:", error)
        return null
      }
    },
    [marketplaceContract],
  )

  const getActiveListings = useCallback(
    async (offset: number = 0, limit: number = 50): Promise<string[]> => {
      if (!marketplaceContract) return []

      try {
        const listingIds = await marketplaceContract.getActiveListings(offset, limit)
        return listingIds.map((id: bigint) => id.toString())
      } catch (error) {
        console.error("Error fetching active listings:", error)
        return []
      }
    },
    [marketplaceContract],
  )

  const getSellerListings = useCallback(
    async (sellerAddress: string): Promise<string[]> => {
      if (!marketplaceContract) return []

      try {
        const listingIds = await marketplaceContract.getSellerListings(sellerAddress)
        return listingIds.map((id: bigint) => id.toString())
      } catch (error) {
        console.error("Error fetching seller listings:", error)
        return []
      }
    },
    [marketplaceContract],
  )

  const listNFT = useCallback(
    async (tokenId: string, price: string) => {
      if (!marketplaceContractWithSigner) {
        throw new Error("Contract not available")
      }

      setLoading(true)
      try {
        const priceInWei = ethers.parseEther(price)
        const tx = await marketplaceContractWithSigner.listNFT(tokenId, priceInWei)
        
        toast({
          title: "Transaction submitted",
          description: "Waiting for listing confirmation...",
        })

        await tx.wait()

        toast({
          title: "NFT Listed! ✅",
          description: "Your NFT has been listed for sale",
        })

        return tx
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to list NFT"
        toast({
          title: "Listing failed",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [marketplaceContractWithSigner, toast],
  )

  const buyNFT = useCallback(
    async (tokenId: string, price: string) => {
      if (!marketplaceContractWithSigner) {
        throw new Error("Contract not available")
      }

      setLoading(true)
      try {
        const priceInWei = ethers.parseEther(price)
        const tx = await marketplaceContractWithSigner.buyNFT(tokenId, { value: priceInWei })

        toast({
          title: "Transaction submitted",
          description: "Waiting for purchase confirmation...",
        })

        await tx.wait()

        toast({
          title: "NFT Purchased! 🎉",
          description: "You are now the owner of this NFT",
        })

        return tx
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to buy NFT"
        toast({
          title: "Purchase failed",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [marketplaceContractWithSigner, toast],
  )

  const cancelListing = useCallback(
    async (tokenId: string) => {
      if (!marketplaceContractWithSigner) {
        throw new Error("Contract not available")
      }

      setLoading(true)
      try {
        const tx = await marketplaceContractWithSigner.cancelListing(tokenId)

        toast({
          title: "Transaction submitted",
          description: "Waiting for cancellation confirmation...",
        })

        await tx.wait()

        toast({
          title: "Listing Cancelled",
          description: "Your listing has been cancelled",
        })

        return tx
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to cancel listing"
        toast({
          title: "Cancellation failed",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [marketplaceContractWithSigner, toast],
  )

  const updateListingPrice = useCallback(
    async (tokenId: string, newPrice: string) => {
      if (!marketplaceContractWithSigner) {
        throw new Error("Contract not available")
      }

      setLoading(true)
      try {
        const priceInWei = ethers.parseEther(newPrice)
        const tx = await marketplaceContractWithSigner.updateListingPrice(tokenId, priceInWei)

        toast({
          title: "Transaction submitted",
          description: "Waiting for price update confirmation...",
        })

        await tx.wait()

        toast({
          title: "Price Updated",
          description: "Your listing price has been updated",
        })

        return tx
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update price"
        toast({
          title: "Update failed",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [marketplaceContractWithSigner, toast],
  )

  return {
    marketplaceContract,
    marketplaceContractWithSigner,
    marketplaceFee,
    loading,
    getListing,
    getActiveListings,
    getSellerListings,
    listNFT,
    buyNFT,
    cancelListing,
    updateListingPrice,
  }
}

