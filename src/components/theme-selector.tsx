"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Check, Palette } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export type ThemeName = "coral" | "ocean" | "forest" | "sunset" | "midnight"
export type ThemeMode = "light" | "dark"

interface Theme {
  name: ThemeName
  label: string
  description: string
  preview: {
    light: string
    dark: string
  }
}

const themes: Theme[] = [
  {
    name: "coral",
    label: "Coral",
    description: "Warm beach vibes",
    preview: {
      light: "oklch(0.6171 0.1375 39.0427)",
      dark: "oklch(0.6724 0.1308 38.7559)",
    },
  },
  {
    name: "ocean",
    label: "Ocean",
    description: "Cool blue waters",
    preview: {
      light: "oklch(0.5482 0.1520 240.8365)",
      dark: "oklch(0.6024 0.1608 241.7559)",
    },
  },
  {
    name: "forest",
    label: "Forest",
    description: "Fresh green nature",
    preview: {
      light: "oklch(0.5582 0.1620 155.4207)",
      dark: "oklch(0.6124 0.1808 156.7559)",
    },
  },
  {
    name: "sunset",
    label: "Sunset",
    description: "Romantic purple hues",
    preview: {
      light: "oklch(0.5771 0.1920 328.3634)",
      dark: "oklch(0.6524 0.2108 329.7559)",
    },
  },
  {
    name: "midnight",
    label: "Midnight",
    description: "Deep indigo night",
    preview: {
      light: "oklch(0.4982 0.1820 274.8365)",
      dark: "oklch(0.5524 0.2008 275.7559)",
    },
  },
]

interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeName, mode: ThemeMode) => void
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  // All hooks MUST be at the top level before any early returns
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentThemeName, setCurrentThemeName] = React.useState<ThemeName>("coral")

  const isDarkMode = theme === "dark"

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    // Get the stored theme name from localStorage or attribute
    const storedTheme = localStorage.getItem("badezeit-theme-name") as ThemeName
    const htmlElement = document.documentElement
    const dataTheme = htmlElement.getAttribute("data-theme") as ThemeName

    const themeName = storedTheme || dataTheme || "coral"
    setCurrentThemeName(themeName)
    htmlElement.setAttribute("data-theme", themeName)
  }, [mounted])

  // Early return AFTER all hooks
  if (!mounted) {
    return null
  }

  const handleThemeSelect = (themeName: ThemeName) => {
    const htmlElement = document.documentElement

    // Set the data-theme attribute
    htmlElement.setAttribute("data-theme", themeName)

    // Store theme name in localStorage
    localStorage.setItem("badezeit-theme-name", themeName)

    // Update state
    setCurrentThemeName(themeName)
    setIsOpen(false)
    onThemeChange?.(themeName, isDarkMode ? "dark" : "light")
  }

  const handleModeToggle = () => {
    const newMode = isDarkMode ? "light" : "dark"
    setTheme(newMode)
    onThemeChange?.(currentThemeName, newMode)
  }

  return (
    <div className="relative h-full w-full">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-full w-full items-center justify-center rounded-full bg-transparent text-primary-foreground transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Seleccionar tema"
        aria-expanded={isOpen}
      >
        <Palette className="h-5 w-5 md:h-6 md:w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 bottom-12 z-50 w-[calc(100vw-2rem)] max-w-[320px] sm:w-80 overflow-hidden rounded-lg border bg-popover shadow-xl"
            >
              <div className="p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Tema</h3>
                  <button
                    onClick={handleModeToggle}
                    className="min-h-[32px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted active:scale-95"
                  >
                    {isDarkMode ? "🌙 Oscuro" : "☀️ Claro"}
                  </button>
                </div>

                <div className="space-y-1">
                  {themes.map((themeOption) => {
                    const isActive = currentThemeName === themeOption.name
                    const previewColor = isDarkMode
                      ? themeOption.preview.dark
                      : themeOption.preview.light

                    return (
                      <motion.button
                        key={themeOption.name}
                        onClick={() => handleThemeSelect(themeOption.name)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg p-2.5 sm:p-3 text-left transition-colors min-h-[52px] sm:min-h-[60px]",
                          isActive
                            ? "bg-accent text-accent-foreground ring-2 ring-primary/20"
                            : "hover:bg-muted active:scale-[0.98]"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Color Preview */}
                        <div
                          className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 rounded-md border-2 shadow-sm"
                          style={{ backgroundColor: previewColor }}
                        />

                        {/* Theme Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm sm:text-base font-medium">
                              {themeOption.label}
                            </p>
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Check className="h-4 w-4 text-primary" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {themeOption.description}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Footer with mode toggle */}
              <div className="border-t bg-muted/20 p-2.5 sm:p-3">
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                  <span className="font-medium">Modo</span>
                  <button
                    onClick={handleModeToggle}
                    className="min-h-[36px] rounded-md bg-background px-4 py-2 font-medium shadow-sm transition-all hover:bg-accent active:scale-95"
                  >
                    {isDarkMode ? "🌙 Oscuro" : "☀️ Claro"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
