"use client"

import { useState, useRef } from "react"
import { addAttachment } from "@/app/actions/homework"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X } from "lucide-react"

interface FileUploaderProps {
  homeworkId: number
  onUploadComplete: () => void
  onCancel: () => void
}

export function FileUploader({ homeworkId, onUploadComplete, onCancel }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // For demo purposes, we'll use a placeholder URL
      // In production, you'd upload to Vercel Blob or similar
      const fileUrl = `/uploads/${file.name}`

      await addAttachment(homeworkId, file.name, fileUrl, file.size)
      onUploadComplete()
    } catch {
      setError("Failed to upload file")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border border-dashed border-border rounded-lg space-y-3">
      {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">{error}</div>}

      {file ? (
        <div className="flex items-center gap-2">
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFile(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="text-center py-4 cursor-pointer" onClick={() => inputRef.current?.click()}>
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Click to select a file</p>
        </div>
      )}

      <Input ref={inputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" disabled={!file || loading} onClick={handleUpload}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Upload
        </Button>
      </div>
    </div>
  )
}
