"use client"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { useIPFS } from "@/hooks/use-ipfs"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onUploadComplete: (ipfsUrl: string, imageUrl: string) => void
  onRemove?: () => void
  maxSizeMB?: number
  accept?: string
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  onUploadComplete,
  onRemove,
  maxSizeMB = 10,
  accept = "image/*",
  disabled = false,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { uploadFile, uploading } = useIPFS()

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > maxSizeMB) {
        alert(`File size must be less than ${maxSizeMB}MB`)
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to IPFS
      try {
        const result = await uploadFile(file)
        const imageUrl = `https://${result.cid}.ipfs.w3s.link`
        onUploadComplete(result.url, imageUrl)
      } catch (error) {
        console.error("Error uploading image:", error)
        setPreview(null)
        setSelectedFile(null)
      }
    },
    [uploadFile, maxSizeMB, onUploadComplete]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled || uploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onRemove?.()
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  if (preview) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-secondary/50">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="text-center text-sm text-white">Uploading to IPFS...</p>
              </div>
            </div>
          )}
          {!uploading && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedFile?.name} ({(selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>NFT Image</Label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 p-8 transition-colors",
          isDragging && "border-primary bg-primary/10",
          disabled && "cursor-not-allowed opacity-50",
          uploading && "cursor-wait opacity-50",
          "hover:border-primary/50 hover:bg-secondary"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-sm text-muted-foreground">
              Uploading to IPFS...
            </p>
          </div>
        ) : (
          <>
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">
                {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF up to {maxSizeMB}MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={disabled}
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Image
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

