"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router";
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface AdminNavBarProps {
  items: NavItem[]
  className?: string
}

export function AdminNavBar({ items, className }: AdminNavBarProps) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update active tab based on current location
  useEffect(() => {
    const currentItem = items.find(item => item.url === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.name)
    }
  }, [location.pathname, items])

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b",
        className,
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground">Admin Panel</span>
        </div>
        
        <div className="flex items-center gap-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors",
                  "text-foreground/80 hover:text-primary",
                  isActive && "bg-muted text-primary",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="hidden md:inline">{item.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="admin-lamp"
                    className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
