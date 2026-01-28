'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
  '2xl': 'w-40 h-40',
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
  '2xl': 'text-4xl',
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

