"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ThemeSelector } from "./theme-selector"

export function FloatingThemeToggle() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl md:h-16 md:w-16">
        <ThemeSelector />
      </div>

      {/* Ripple effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/30 pointer-events-none"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 0, opacity: 0.5 }}
        whileHover={{ scale: 1.1, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  )
}
