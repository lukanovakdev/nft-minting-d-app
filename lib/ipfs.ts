// IPFS integration using Web3.Storage
// Get your free API token from https://web3.storage/

interface IPFSUploadResult {
  cid: string
  url: string
}

/**
 * Upload file to IPFS using Web3.Storage
 * @param file File to upload
 * @param apiToken Web3.Storage API token
 * @returns IPFS CID and URL
 */
export async function uploadToIPFS(
  file: File,
  apiToken?: string
): Promise<IPFSUploadResult> {
  const token = apiToken || process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN

  if (!token) {
    throw new Error(
      "Web3.Storage token not found. Please set NEXT_PUBLIC_WEB3_STORAGE_TOKEN in your .env file or get one from https://web3.storage/"
    )
  }

  try {
    // Dynamically import web3.storage to avoid SSR issues
    const { Web3Storage } = await import("web3.storage")
    const client = new Web3Storage({ token })

    // Create file object for upload
    const files = [file]

    // Upload to IPFS
    const cid = await client.put(files, {
      wrapWithDirectory: false,
    })

    // Construct IPFS URL
    const url = `ipfs://${cid}`
    const gatewayUrl = `https://${cid}.ipfs.w3s.link`

    return {
      cid,
      url,
    }
  } catch (error) {
    console.error("Error uploading to IPFS:", error)
    throw new Error(
      `Failed to upload to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata Metadata object to upload
 * @param apiToken Web3.Storage API token
 * @returns IPFS CID and URL
 */
export async function uploadMetadataToIPFS(
  metadata: Record<string, unknown>,
  apiToken?: string
): Promise<IPFSUploadResult> {
  const token = apiToken || process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN

  if (!token) {
    throw new Error(
      "Web3.Storage token not found. Please set NEXT_PUBLIC_WEB3_STORAGE_TOKEN in your .env file"
    )
  }

  try {
    const { Web3Storage } = await import("web3.storage")
    const client = new Web3Storage({ token })

    // Convert metadata to JSON blob
    const jsonString = JSON.stringify(metadata, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const file = new File([blob], "metadata.json", { type: "application/json" })

    // Upload to IPFS
    const cid = await client.put([file], {
      wrapWithDirectory: false,
    })

    const url = `ipfs://${cid}`
    const gatewayUrl = `https://${cid}.ipfs.w3s.link`

    return {
      cid,
      url,
    }
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error)
    throw new Error(
      `Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Get IPFS gateway URL from IPFS URI
 * @param ipfsUri IPFS URI (e.g., ipfs://Qm...)
 * @returns HTTP gateway URL
 */
export function getIPFSGatewayURL(ipfsUri: string): string {
  if (ipfsUri.startsWith("ipfs://")) {
    const cid = ipfsUri.replace("ipfs://", "")
    // Use multiple gateway options for reliability
    return `https://${cid}.ipfs.w3s.link`
  }

  if (ipfsUri.startsWith("https://") || ipfsUri.startsWith("http://")) {
    return ipfsUri
  }

  // Assume it's a CID without prefix
  return `https://${ipfsUri}.ipfs.w3s.link`
}

/**
 * Standard NFT metadata format (ERC-721 compatible)
 */
export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
  animation_url?: string
}

/**
 * Create standard ERC-721 metadata
 */
export function createNFTMetadata(
  name: string,
  description: string,
  imageURI: string,
  options?: {
    attributes?: Array<{ trait_type: string; value: string | number }>
    external_url?: string
    animation_url?: string
  }
): NFTMetadata {
  return {
    name,
    description,
    image: imageURI,
    ...(options?.attributes && { attributes: options.attributes }),
    ...(options?.external_url && { external_url: options.external_url }),
    ...(options?.animation_url && { animation_url: options.animation_url }),
  }
}

