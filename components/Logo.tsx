'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-xl',
  xl: 'text-2xl',
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const sizeClass = sizeClasses[size]
  const textSize = textSizes[size]

  return (
    <div className={`${sizeClass} ${className} relative`}>
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden">
        {!imageError ? (
          <Image
            src="/logo.png"
            alt="ClipSon Affiliates"
            fill
            className="object-contain p-1"
            onError={() => setImageError(true)}
            priority={size === 'xl' || size === 'lg'}
          />
        ) : (
          <span className={`text-white font-bold ${textSize}`}>CA</span>
        )}
      </div>
    </div>
  )
}

