"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface MintContextValue {
  refreshTrigger: number
  triggerRefresh: () => void
}

const MintContext = createContext<MintContextValue | undefined>(undefined)

export function MintProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  return <MintContext.Provider value={{ refreshTrigger, triggerRefresh }}>{children}</MintContext.Provider>
}

export function useMint() {
  const context = useContext(MintContext)
  if (context === undefined) {
    throw new Error("useMint must be used within a MintProvider")
  }
  return context
}

