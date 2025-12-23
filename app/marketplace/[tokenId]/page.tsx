import { NFTDetailPage } from "@/components/nft-detail-page"

interface PageProps {
  params: Promise<{ tokenId: string }>
}

export default async function NFTDetail({ params }: PageProps) {
  const { tokenId } = await params
  return <NFTDetailPage tokenId={tokenId} />
}

