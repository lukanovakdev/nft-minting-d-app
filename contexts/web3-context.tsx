"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { ethers } from "ethers"
import type { EthereumProvider } from "@/lib/types/ethereum"

interface Web3ContextValue {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnecting: boolean
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextValue | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      return
    }

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[]

      if (accounts.length > 0) {
        const connectedAccount = accounts[0]
        setAccount(connectedAccount)
        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        setProvider(browserProvider)
        const browserSigner = await browserProvider.getSigner()
        setSigner(browserSigner)
      }
    } catch (error) {
      console.error("Error checking connection:", error)
    }
  }, [])

  const connect = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask not found. Please install MetaMask to connect your wallet.")
    }

    setIsConnecting(true)
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      if (accounts.length > 0) {
        const connectedAccount = accounts[0]
        setAccount(connectedAccount)
        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        setProvider(browserProvider)
        const browserSigner = await browserProvider.getSigner()
        setSigner(browserSigner)
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
  }, [])

  useEffect(() => {
    checkConnection()

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAccount(accounts[0])
          if (window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum)
            setProvider(browserProvider)
            browserProvider.getSigner().then(setSigner).catch(console.error)
          }
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [checkConnection, disconnect])

  const value: Web3ContextValue = {
    account,
    provider,
    signer,
    isConnecting,
    isConnected: !!account,
    connect,
    disconnect,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

