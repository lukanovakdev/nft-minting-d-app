"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { useWeb3 } from "@/contexts/web3-context"
import { useMint } from "@/contexts/mint-context"
import { useNFTContract } from "@/hooks/use-nft-contract"
import { DEFAULT_MINT_PRICE } from "@/lib/contract-config"

export function MintSection() {
  const [tokenURI, setTokenURI] = useState("")
  const [isMinting, setIsMinting] = useState(false)
  const [mintPrice, setMintPrice] = useState<string>(DEFAULT_MINT_PRICE)
  const { account } = useWeb3()
  const { triggerRefresh } = useMint()
  const { contract, contractWithSigner } = useNFTContract()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchMintPrice() {
      if (!contract) return
      try {
        const price = await contract.mintPrice()
        const priceInEth = ethers.formatEther(price)
        setMintPrice(priceInEth)
      } catch (error) {
        console.error("Error fetching mint price:", error)
      }
    }

    fetchMintPrice()
  }, [contract])

  const mintNFT = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!contractWithSigner) {
      toast({
        title: "Contract not available",
        description: "Please ensure you're connected to the correct network",
        variant: "destructive",
      })
      return
    }

    if (!tokenURI.trim()) {
      toast({
        title: "Token URI required",
        description: "Please enter a token URI or IPFS hash",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    try {
      const value = ethers.parseEther(mintPrice)

      const tx = await contractWithSigner.mint(account, tokenURI, { value })

      toast({
        title: "Transaction submitted",
        description: "Waiting for confirmation...",
      })

      await tx.wait()

      toast({
        title: "NFT Minted! 🎉",
        description: "Your NFT has been successfully minted",
      })

      setTokenURI("")
      triggerRefresh()
    } catch (error) {
      console.error("Error minting NFT:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to mint NFT"
      toast({
        title: "Minting failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto p-8 bg-card border-border">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 rounded-lg p-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Mint NFT</h2>
            <p className="text-sm text-muted-foreground">Create your unique digital asset</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tokenURI">Token URI / IPFS Hash</Label>
          <Input
            id="tokenURI"
            placeholder="ipfs://QmX... or https://..."
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            disabled={isMinting}
            className="bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground">Enter the metadata URI for your NFT (IPFS hash or URL)</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-1">Mint Price</p>
          <p className="text-2xl font-bold text-primary">{mintPrice} ETH</p>
        </div>

        <Button
          onClick={mintNFT}
          disabled={!account || isMinting || !tokenURI.trim() || !contractWithSigner}
          className="w-full gap-2"
          size="lg"
        >
          {isMinting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Mint NFT
            </>
          )}
        </Button>

        {!account && <p className="text-sm text-center text-muted-foreground">Connect your wallet to start minting</p>}
      </div>
    </Card>
  )
}
