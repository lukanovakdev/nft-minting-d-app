"use client"

import { useMemo } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "@/contexts/web3-context"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract-config"

export function useNFTContract() {
  const { provider, signer } = useWeb3()

  const contract = useMemo(() => {
    if (!provider) return null
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  }, [provider])

  const contractWithSigner = useMemo(() => {
    if (!signer) return null
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }, [signer])

  return {
    contract,
    contractWithSigner,
  }
}

