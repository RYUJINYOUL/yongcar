'use client'

import React from "react"
import { useCallback, useState } from 'react'

interface ImageUploadProps {
  onImageSelect: (files: File[]) => void
  selectedImages: File[]
}

export default function ImageUpload({ onImageSelect, selectedImages }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // selectedImages가 변경될 때마다 미리보기 업데이트
  React.useEffect(() => {
    const newPreviews: string[] = []
    selectedImages.forEach((file, index) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews[index] = reader.result as string
        if (newPreviews.filter(p => p).length === selectedImages.length) {
          setPreviews([...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
    
    if (selectedImages.length === 0) {
      setPreviews([])
    }
  }, [selectedImages])

  const handleFileChange = useCallback((files: File[]) => {
    // 기존 이미지에 새 이미지 추가 (최대 3장까지)
    const remainingSlots = 3 - selectedImages.length
    const newFiles = files.slice(0, remainingSlots)
    const updatedFiles = [...selectedImages, ...newFiles]
    
    console.log('이미지 추가됨:', newFiles.length, '장 (총', updatedFiles.length, '장)')
    onImageSelect(updatedFiles)
  }, [onImageSelect, selectedImages])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length > 0) {
      handleFileChange(files)
    }
  }, [handleFileChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileChange(files)
  }

  const handleRemove = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index)
    onImageSelect(newFiles)
  }

  const handleRemoveAll = () => {
    onImageSelect([])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">{selectedImages.length}/3 이미지 업로드됨</p>
        {selectedImages.length > 0 && (
          <button
            type="button"
            onClick={handleRemoveAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            모두 삭제
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 업로드된 이미지들 */}
        {previews.map((preview, index) => (
          <div key={index} className="relative">
            <img
              src={preview}
              alt={`업로드된 지도 ${index + 1}`}
              className="w-full h-48 object-cover rounded-xl border border-white/10"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-2 text-xs text-gray-400 truncate">
              {selectedImages[index]?.name}
            </div>
          </div>
        ))}
        
        {/* 빈 슬롯들 - 업로드 버튼 */}
        {Array.from({ length: 3 - selectedImages.length }).map((_, index) => (
          <label
            key={`empty-${index}`}
            className={`upload-area h-48 flex items-center justify-center cursor-pointer ${isDragging ? 'border-blue-400/60 bg-blue-500/10' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-white font-medium text-sm mb-1">이미지 추가</p>
              <p className="text-gray-500 text-xs">클릭 또는 드래그</p>
            </div>
          </label>
        ))}
      </div>
      
      <p className="text-gray-500 text-xs text-center">
        PNG, JPG, WEBP (각각 최대 10MB) • 전체 지도, 상세 골목, 건물 현황 등을 각각 업로드하세요
      </p>
    </div>
  )
}
