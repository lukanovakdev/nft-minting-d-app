"use client"

import { useState, useEffect, useCallback } from "react"
import { useWeb3 } from "@/contexts/web3-context"
import { useMint } from "@/contexts/mint-context"
import { useNFTContract } from "./use-nft-contract"

export interface NFT {
  tokenId: string
  owner: string
  tokenURI: string
}

export function useNFTs() {
  const { account } = useWeb3()
  const { refreshTrigger } = useMint()
  const { contract } = useNFTContract()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadNFTs = useCallback(
    async (ownerAddress: string) => {
      if (!contract) {
        setError(new Error("Contract not available"))
        return
      }

      setLoading(true)
      setError(null)

      try {
        const balance = await contract.balanceOf(ownerAddress)
        const tokenIds: NFT[] = []

        for (let i = 0; i < Number(balance); i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i)
          const tokenURI = await contract.tokenURI(tokenId)

          tokenIds.push({
            tokenId: tokenId.toString(),
            owner: ownerAddress,
            tokenURI,
          })
        }

        setNfts(tokenIds)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load NFTs")
        console.error("Error loading NFTs:", error)
        setError(error)
        setNfts([])
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  useEffect(() => {
    if (account && contract) {
      loadNFTs(account)
    } else {
      setNfts([])
      setLoading(false)
    }
  }, [account, contract, loadNFTs, refreshTrigger])

  return {
    nfts,
    loading,
    error,
    refetch: account ? () => loadNFTs(account) : undefined,
  }
}

