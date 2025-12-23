import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/contexts/web3-context"
import { MintProvider } from "@/contexts/mint-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "NFT Minter - Mint Your Digital Collectibles",
  description: "Mint and collect unique NFTs on the Ethereum blockchain. Built with Solidity, Hardhat, and Next.js",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Web3Provider>
            <MintProvider>
              {children}
              <Toaster />
            </MintProvider>
          </Web3Provider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
