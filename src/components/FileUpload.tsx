'use client'

import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void
}

export function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      
      const files = Array.from(e.dataTransfer.files)
      onFilesUploaded(files)
    },
    [onFilesUploaded]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files)
        onFilesUploaded(files)
      }
    },
    [onFilesUploaded]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept=".log"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-2">
        <Upload className="w-8 h-8 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Drop log files here or click to upload
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supports .log files
          </p>
        </div>
      </div>
    </div>
  )
}
