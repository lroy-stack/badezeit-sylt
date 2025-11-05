"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import {
  LogIn,
  LogOut,
  Calendar,
  User,
  Table,
  Menu,
  Settings,
  Download,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import type { ActivityAction } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Activity {
  id: string
  action: ActivityAction
  description: string
  entityType: string | null
  entityId: string | null
  createdAt: Date
  user: {
    firstName: string | null
    lastName: string | null
    email: string
    role: string
  }
}

interface ActivityLogProps {
  activities: Activity[]
  showUser?: boolean
}

const actionIcons: Record<ActivityAction, any> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  CREATE_RESERVATION: Calendar,
  UPDATE_RESERVATION: Calendar,
  CANCEL_RESERVATION: Calendar,
  CREATE_CUSTOMER: User,
  UPDATE_CUSTOMER: User,
  DELETE_CUSTOMER: User,
  CREATE_TABLE: Table,
  UPDATE_TABLE: Table,
  DELETE_TABLE: Table,
  CREATE_MENU_ITEM: Menu,
  UPDATE_MENU_ITEM: Menu,
  DELETE_MENU_ITEM: Menu,
  UPDATE_SETTINGS: Settings,
  EXPORT_DATA: Download,
  VIEW_ANALYTICS: BarChart3,
}

const actionColors: Record<ActivityAction, string> = {
  LOGIN: "bg-green-500",
  LOGOUT: "bg-gray-500",
  CREATE_RESERVATION: "bg-blue-500",
  UPDATE_RESERVATION: "bg-blue-400",
  CANCEL_RESERVATION: "bg-red-500",
  CREATE_CUSTOMER: "bg-purple-500",
  UPDATE_CUSTOMER: "bg-purple-400",
  DELETE_CUSTOMER: "bg-red-500",
  CREATE_TABLE: "bg-orange-500",
  UPDATE_TABLE: "bg-orange-400",
  DELETE_TABLE: "bg-red-500",
  CREATE_MENU_ITEM: "bg-green-500",
  UPDATE_MENU_ITEM: "bg-green-400",
  DELETE_MENU_ITEM: "bg-red-500",
  UPDATE_SETTINGS: "bg-gray-600",
  EXPORT_DATA: "bg-indigo-500",
  VIEW_ANALYTICS: "bg-cyan-500",
}

export function ActivityLog({ activities, showUser = true }: ActivityLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Aktivitätsprotokoll
        </CardTitle>
        <CardDescription>
          Letzte Aktionen im System
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence initial={false}>
            {activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Keine Aktivitäten vorhanden
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = actionIcons[activity.action] || RefreshCw
                  const colorClass = actionColors[activity.action] || "bg-gray-500"

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                        className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white`}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {activity.description}
                            </p>
                            {showUser && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {activity.user.firstName} {activity.user.lastName}
                                {' • '}
                                <Badge variant="outline" className="text-xs">
                                  {activity.user.role}
                                </Badge>
                              </p>
                            )}
                          </div>
                          <time className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                              locale: de,
                            })}
                          </time>
                        </div>

                        {activity.entityType && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {activity.entityType}
                            </Badge>
                            {activity.entityId && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {activity.entityId.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
