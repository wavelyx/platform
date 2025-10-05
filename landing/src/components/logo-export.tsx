"use client"

import { Waves } from "lucide-react"

export function LogoExport() {
  return (
    <div className="flex items-center space-x-3 p-8 bg-white">
      {/* Logo Icon - Exact match to navigation */}
      <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-lg flex items-center justify-center overflow-hidden">
        <Waves className="h-6 w-6 text-white" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>
      
      {/* Logo Text - Exact match to navigation */}
      <span className="text-2xl font-bold gradient-text">wavelyz</span>
    </div>
  )
}

// Alternative versions for different use cases
export function LogoIconOnly() {
  return (
    <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-lg flex items-center justify-center overflow-hidden">
      <Waves className="h-6 w-6 text-white" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
    </div>
  )
}

export function LogoTextOnly() {
  return (
    <span className="text-2xl font-bold gradient-text">
      wavelyz
    </span>
  )
}
