"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AnimatedTableProps {
  headers: string[]
  rows: React.ReactNode[][]
  onRowClick?: (index: number) => void
  className?: string
}

export function AnimatedTable({ headers, rows, onRowClick, className }: AnimatedTableProps) {
  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index}>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  {header}
                </motion.div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(0, 0, 0, 0.02)" }}
              onClick={() => onRowClick?.(rowIndex)}
              className={onRowClick ? "cursor-pointer" : ""}
              style={{ display: "table-row" }}
            >
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface AnimatedCardGridProps {
  children: React.ReactNode[]
  className?: string
}

export function AnimatedCardGrid({ children, className }: AnimatedCardGridProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: index * 0.1,
            duration: 0.4,
            ease: "easeOut",
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="h-full"
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
