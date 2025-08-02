"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router"

export interface MenuItem {
  name: string
  label: string
  href: string
  gradient: string
  iconColor: string
  icon: React.ComponentType<{ className?: string }>
}

interface MenuBarProps {
  items: MenuItem[]
  activeItem: string
  onItemClick: (item: string) => void
}

export const MenuBar = React.forwardRef<HTMLDivElement, MenuBarProps>(
  ({ items, activeItem, onItemClick }, ref) => {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleItemClick = (item: MenuItem) => {
      onItemClick(item.name)
      
      // Navigate if href is not just a hash
      if (item.href && item.href !== "#") {
        navigate(item.href)
      }
    }

    return (
      <div ref={ref} className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <motion.nav
          className="flex items-center gap-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.name
            const isHovered = hoveredItem === item.name

            return (
              <motion.button
                key={item.name}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden",
                  "text-white/70 hover:text-white",
                  isActive && "text-white"
                )}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Background gradient */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r opacity-20",
                        item.gradient
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: isActive ? 0.3 : 0.2, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Glow effect */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r blur-xl opacity-30",
                        item.gradient
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>

                {/* Content */}
                <div className="relative z-10 flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", item.iconColor)} />
                  <span>{item.label}</span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full"
                    initial={{ scale: 0, x: "-50%" }}
                    animate={{ scale: 1, x: "-50%" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </motion.nav>
      </div>
    )
  }
)

MenuBar.displayName = "MenuBar"