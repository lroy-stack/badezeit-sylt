"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SubItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface CollapsibleNavItemProps {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: SubItem[]
  roles: string[]
}

export function CollapsibleNavItem({
  name,
  href,
  icon: Icon,
  subItems,
  roles,
}: CollapsibleNavItemProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  // Auto-expand si estamos en una subruta
  React.useEffect(() => {
    if (subItems && subItems.some(item => pathname.startsWith(item.href))) {
      setIsOpen(true)
    }
  }, [pathname, subItems])

  const hasSubItems = subItems && subItems.length > 0
  const isActive = pathname === href || (hasSubItems && subItems.some(item => pathname.startsWith(item.href)))

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  return (
    <li>
      <Link
        href={hasSubItems ? "#" : href}
        onClick={handleClick}
        aria-expanded={hasSubItems ? isOpen : undefined}
        aria-haspopup={hasSubItems ? "true" : undefined}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 font-normal",
            isActive && "bg-accent text-accent-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="flex-1 text-left">{name}</span>
          {hasSubItems && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </Button>
      </Link>

      {/* Subitems */}
      <AnimatePresence initial={false}>
        {hasSubItems && isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden pl-4 mt-1 space-y-1"
          >
            {subItems.map((subItem) => {
              const SubIcon = subItem.icon
              const isSubActive = pathname.startsWith(subItem.href)

              return (
                <motion.li
                  key={subItem.href}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link href={subItem.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-9 font-normal text-sm",
                        isSubActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
                      <span className="flex-1 text-left">{subItem.name}</span>
                    </Button>
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
