"use client"

import { useState, useCallback } from "react"
import { uploadToIPFS, uploadMetadataToIPFS, type NFTMetadata } from "@/lib/ipfs"
import { useToast } from "@/hooks/use-toast"

interface IPFSUploadState {
  uploading: boolean
  error: string | null
}

export function useIPFS() {
  const { toast } = useToast()
  const [uploadState, setUploadState] = useState<IPFSUploadState>({
    uploading: false,
    error: null,
  })

  const uploadFile = useCallback(
    async (file: File) => {
      setUploadState({ uploading: true, error: null })

      try {
        toast({
          title: "Uploading to IPFS...",
          description: "Please wait while your file is being uploaded",
        })

        const result = await uploadToIPFS(file)

        setUploadState({ uploading: false, error: null })

        toast({
          title: "Upload successful! ✅",
          description: "File uploaded to IPFS",
        })

        return result
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload file"
        setUploadState({ uploading: false, error: errorMessage })

        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        })

        throw error
      }
    },
    [toast]
  )

  const uploadMetadata = useCallback(
    async (metadata: NFTMetadata) => {
      setUploadState({ uploading: true, error: null })

      try {
        toast({
          title: "Uploading metadata to IPFS...",
          description: "Please wait while your metadata is being uploaded",
        })

        const result = await uploadMetadataToIPFS(metadata)

        setUploadState({ uploading: false, error: null })

        toast({
          title: "Metadata uploaded! ✅",
          description: "Metadata uploaded to IPFS",
        })

        return result
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload metadata"
        setUploadState({ uploading: false, error: errorMessage })

        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        })

        throw error
      }
    },
    [toast]
  )

  return {
    uploadFile,
    uploadMetadata,
    uploading: uploadState.uploading,
    error: uploadState.error,
  }
}

