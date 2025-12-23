import { MintSection } from "@/components/mint-section"
import { NFTGallery } from "@/components/nft-gallery"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-balance">Mint Your Unique NFT</h1>
            <p className="text-lg text-muted-foreground text-balance">
              Connect your wallet and mint exclusive digital collectibles on the Ethereum testnet
            </p>
          </div>
          <MintSection />
        </div>
        <NFTGallery />
      </main>
    </div>
  )
}
